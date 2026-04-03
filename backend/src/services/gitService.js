/**
 * Service Git - Gestion des operations Git
 */

const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

class GitService {
  /**
   * Cloner un depot GitHub
   */
  static async cloneRepository(githubUrl, branch, destinationPath) {
    try {
      logger.info(`========================================`);
      logger.info(`Clonage du depot GitHub`);
      logger.info(`URL: ${githubUrl}`);
      logger.info(`Branche: ${branch}`);
      logger.info(`Destination: ${destinationPath}`);
      logger.info(`========================================`);
      
      // Supprimer le dossier de destination s'il existe
      try {
        await fs.rm(destinationPath, { recursive: true, force: true });
      } catch (error) {
        // Ignore si le dossier n'existe pas
      }
      
      // Creer le dossier parent
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      
      // Cloner le depot
      const git = simpleGit();
      await git.clone(githubUrl, destinationPath, ['--branch', branch, '--single-branch']);
      
      logger.success(`Depot clone avec succes !`);
      logger.info(`Chemin: ${destinationPath}`);
      
      return {
        success: true,
        path: destinationPath
      };
    } catch (error) {
      logger.error(`Erreur lors du clonage: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Recuperer les infos du dernier commit
   */
  static async getLatestCommit(repoPath) {
    try {
      const git = simpleGit(repoPath);
      const log = await git.log({ maxCount: 1 });
      
      if (!log.latest) {
        return null;
      }
      
      return {
        hash: log.latest.hash,
        message: log.latest.message,
        author: log.latest.author_name,
        date: log.latest.date
      };
    } catch (error) {
      logger.error('Erreur recuperation commit:', error.message);
      return null;
    }
  }

  /**
   * Verifier si un depot est valide
   */
  static async isValidRepository(repoPath) {
    try {
      const git = simpleGit(repoPath);
      await git.checkIsRepo();
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = GitService;