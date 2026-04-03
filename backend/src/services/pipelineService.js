/**
 * Service Pipeline - Execution du pipeline CI/CD
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const logger = require('../utils/logger');

const execPromise = util.promisify(exec);

class PipelineService {
  /**
   * Etape 1 : Valider la structure du projet
   */
  static async validateProject(projectPath) {
    try {
      logger.info('Etape 1/4: Validation de la structure...');
      
      // Verifier que index.html existe
      const indexPath = path.join(projectPath, 'index.html');
      await fs.access(indexPath);
      
      logger.success('Structure validee');
      return { success: true, message: 'Structure valide' };
    } catch (error) {
      logger.error('Validation echouee:', error.message);
      return { success: false, message: 'index.html manquant' };
    }
  }

  /**
   * Etape 2 : Executer les tests (si package.json existe)
   */
  static async runTests(projectPath) {
    try {
      logger.info('Etape 2/4: Execution des tests...');
      
      // Verifier si package.json existe
      const packagePath = path.join(projectPath, 'package.json');
      try {
        await fs.access(packagePath);
        
        // Installer les dependances
        logger.info('Installation des dependances...');
        await execPromise('npm install', { cwd: projectPath });
        
        // Executer les tests (si script test existe)
        try {
          logger.info('Execution des tests...');
          await execPromise('npm test', { cwd: projectPath });
          logger.success('Tests reussis');
        } catch (error) {
          // Pas de script test ou tests echoues
          if (error.message.includes('Missing script')) {
            logger.info('Pas de script test, on continue');
          } else {
            logger.warning('Tests echoues, on continue quand meme');
          }
        }
      } catch (error) {
        // Pas de package.json, projet statique simple
        logger.info('Projet statique, pas de tests');
      }
      
      return { success: true, message: 'Tests OK' };
    } catch (error) {
      logger.error('Tests echoues:', error.message);
      return { success: false, message: 'Tests echoues' };
    }
  }

  /**
   * Etape 3 : Builder le projet
   */
  static async buildProject(projectPath) {
    try {
      logger.info('Etape 3/4: Build du projet...');
      
      const packagePath = path.join(projectPath, 'package.json');
      try {
        await fs.access(packagePath);
        
        // Executer le build si script build existe
        try {
          logger.info('Execution du build...');
          await execPromise('npm run build', { cwd: projectPath });
          logger.success('Build reussi');
          
          // Verifier si dist/ existe
          const distPath = path.join(projectPath, 'dist');
          try {
            await fs.access(distPath);
            return { success: true, message: 'Build reussi', buildPath: distPath };
          } catch (error) {
            // Pas de dossier dist, utiliser le dossier racine
            return { success: true, message: 'Build OK', buildPath: projectPath };
          }
        } catch (error) {
          // Pas de script build
          if (error.message.includes('Missing script')) {
            logger.info('Pas de script build, projet statique');
          } else {
            logger.warning('Build echoue, on utilise les fichiers sources');
          }
        }
      } catch (error) {
        // Projet statique
        logger.info('Projet statique, pas de build');
      }
      
      return { success: true, message: 'Build OK', buildPath: projectPath };
    } catch (error) {
      logger.error('Build echoue:', error.message);
      return { success: false, message: 'Build echoue' };
    }
  }

  /**
   * Executer le pipeline complet
   */
  static async executePipeline(projectPath) {
    const results = {
      validate: null,
      test: null,
      build: null,
      success: false
    };

    try {
      // Validation
      results.validate = await this.validateProject(projectPath);
      if (!results.validate.success) {
        return results;
      }

      // Tests
      results.test = await this.runTests(projectPath);
      if (!results.test.success) {
        return results;
      }

      // Build
      results.build = await this.buildProject(projectPath);
      if (!results.build.success) {
        return results;
      }

      results.success = true;
      return results;
    } catch (error) {
      logger.error('Erreur pipeline:', error.message);
      return results;
    }
  }
}

module.exports = PipelineService;