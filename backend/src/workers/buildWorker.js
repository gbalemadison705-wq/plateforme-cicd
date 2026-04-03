/**
 * Worker CI/CD - Moteur d execution des builds
 * Version complete avec clone GitHub et vrai pipeline
 */

const Build = require('../models/Build');
const Repository = require('../models/Repository');
const GitService = require('../services/gitService');
const PipelineService = require('../services/pipelineService');
const DeployService = require('../services/deployService');
const logger = require('../utils/logger');
const path = require('path');
const db = require('../config/database');

class BuildWorker {
  /**
   * Executer un build complet avec clone GitHub
   */
  static async executeBuild(buildData) {
    const { buildId, repositoryId } = buildData;
    
    logger.info(`========================================`);
    logger.info(`DEBUT DU BUILD #${buildId}`);
    logger.info(`========================================`);

    const startTime = Date.now();
    let deployUrl = null;
    let clonePath = null;

    try {
      // 1. Mettre le build en cours
      await Build.updateStatus(buildId, 'en_cours');
      logger.info('Statut: EN COURS');

      // 2. Recuperer les infos du depot
      const repository = await Repository.findById(repositoryId);
      if (!repository) {
        throw new Error('Depot non trouve');
      }

      logger.info(`Depot: ${repository.nom}`);
      logger.info(`GitHub URL: ${repository.github_url}`);
      logger.info(`Branche: ${repository.github_branch}`);

      // 3. Cloner le depot depuis GitHub
      logger.info('');
      logger.info('ETAPE 1/5: CLONE DU CODE DEPUIS GITHUB');
      logger.info('─────────────────────────────────────────');
      
      clonePath = path.join(
        process.env.STORAGE_PATH || './storage',
        'repositories',
        `user_${repository.utilisateur_id}`,
        `${repository.nom}_${buildId}`
      );

      const cloneResult = await GitService.cloneRepository(
        repository.github_url,
        repository.github_branch || 'main',
        clonePath
      );

      if (!cloneResult.success) {
        throw new Error(`Echec du clonage: ${cloneResult.error}`);
      }

      // 4. Recuperer les infos du commit
      const commitInfo = await GitService.getLatestCommit(clonePath);
      if (commitInfo) {
        logger.info(`Commit: ${commitInfo.hash.substring(0, 7)}`);
        logger.info(`Message: ${commitInfo.message}`);
        logger.info(`Auteur: ${commitInfo.author}`);
        
        // Enregistrer le commit dans la BDD
        const commitQuery = `
          INSERT INTO commit (depot_id, commit_hash, message, auteur) 
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE message = VALUES(message)
        `;
        await db.query(commitQuery, [
          repositoryId,
          commitInfo.hash,
          commitInfo.message,
          commitInfo.author
        ]);
      }

      // 5. Executer le pipeline
      logger.info('');
      logger.info('ETAPE 2/5: EXECUTION DU PIPELINE CI/CD');
      logger.info('─────────────────────────────────────────');
      
      const pipelineResults = await PipelineService.executePipeline(clonePath);

      if (!pipelineResults.success) {
        throw new Error('Pipeline echoue');
      }

      // 6. Deployer le site
      logger.info('');
      logger.info('ETAPE 3/5: DEPLOIEMENT');
      logger.info('─────────────────────────────────────────');
      
      const deployResult = await DeployService.deploy(
        pipelineResults.build.buildPath,
        buildId
      );

      if (!deployResult.success) {
        throw new Error(`Deploiement echoue: ${deployResult.error}`);
      }

      deployUrl = deployResult.url;

      // 7. Marquer le build comme reussi
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);

      await Build.updateStatus(buildId, 'reussi', {
        date_fin: new Date(),
        duree: duration,
        url_deploiement: deployUrl
      });

      logger.success('');
      logger.success('========================================');
      logger.success(`BUILD #${buildId} REUSSI !`);
      logger.success(`Duree totale: ${duration}s`);
      logger.success(`URL du site: ${deployUrl}`);
      logger.success('========================================');
      logger.success('');

      return {
        success: true,
        buildId,
        duration,
        url: deployUrl
      };

    } catch (error) {
      // Build echoue
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);

      await Build.updateStatus(buildId, 'echoue', {
        date_fin: new Date(),
        duree: duration
      });

      logger.error('');
      logger.error('========================================');
      logger.error(`BUILD #${buildId} ECHOUE`);
      logger.error(`Erreur: ${error.message}`);
      logger.error(`Duree: ${duration}s`);
      logger.error('========================================');
      logger.error('');

      return {
        success: false,
        buildId,
        error: error.message
      };
    }
  }
}

module.exports = BuildWorker;