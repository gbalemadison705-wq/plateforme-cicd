/**
 * Service Deploy - Deploiement des sites
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class DeployService {
  /**
   * Deployer un site
   */
  static async deploy(buildPath, deploymentId) {
    try {
      logger.info('Etape 4/4: Deploiement...');
      
      // Creer le dossier de deploiement
      const deployPath = path.join(
        process.env.STORAGE_PATH || './storage',
        'deployments',
        `site_${deploymentId}`
      );
      
      await fs.mkdir(deployPath, { recursive: true });
      
      // Copier les fichiers
      await this.copyDirectory(buildPath, deployPath);
      
      // Generer l'URL
      const url = `http://localhost:8000/sites/site_${deploymentId}`;
      
      logger.success(`Site deploye: ${url}`);
      
      return {
        success: true,
        url: url,
        path: deployPath
      };
    } catch (error) {
      logger.error('Erreur deploiement:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Copier un dossier recursivement
   */
  static async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Supprimer un deploiement
   */
  static async undeploy(deploymentId) {
    try {
      const deployPath = path.join(
        process.env.STORAGE_PATH || './storage',
        'deployments',
        `site_${deploymentId}`
      );
      
      await fs.rm(deployPath, { recursive: true, force: true });
      logger.info(`Deploiement supprime: ${deploymentId}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Erreur suppression:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = DeployService;