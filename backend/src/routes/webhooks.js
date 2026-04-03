/**
 * Routes Webhooks - Declenchement des builds
 */

const express = require('express');
const router = express.Router();
const Build = require('../models/Build');
const Repository = require('../models/Repository');
const BuildWorker = require('../workers/buildWorker');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * POST /api/webhooks/trigger/:repoId
 * Declencher manuellement un build
 */

router.post('/trigger/:repoId', async (req, res) => {
  try {
    const { repoId } = req.params;
    
    logger.info(`========================================`);
    logger.info(`DECLENCHEMENT MANUEL DU BUILD`);
    logger.info(`Depot ID: ${repoId}`);
    logger.info(`========================================`);
    
    // Verifier que le depot existe
    const repository = await Repository.findById(repoId);
    if (!repository) {
      return res.status(404).json({ error: 'Depot non trouve' });
    }

    // Verifier qu'il y a une URL GitHub
    if (!repository.github_url) {
      return res.status(400).json({ 
        error: 'Ce depot n a pas d URL GitHub configuree' 
      });
    }

    // Creer ou recuperer le pipeline
    let pipelineQuery = 'SELECT id FROM pipeline WHERE depot_id = ?';
    let pipelines = await db.query(pipelineQuery, [repoId]);
    
    let pipelineId;
    if (pipelines.length === 0) {
      const createPipelineQuery = 'INSERT INTO pipeline (depot_id) VALUES (?)';
      const pipelineResult = await db.query(createPipelineQuery, [repoId]);
      pipelineId = pipelineResult.insertId;
    } else {
      pipelineId = pipelines[0].id;
    }

    // Creer un commit temporaire (sera remplace par le vrai commit apres clone)
    const commitQuery = `
      INSERT INTO commit (depot_id, commit_hash, message, auteur) 
      VALUES (?, ?, ?, ?)
    `;
    const commitResult = await db.query(commitQuery, [
      repoId,
      'pending_' + Date.now(),
      'Build manuel en cours...',
      'System'
    ]);
    const commitId = commitResult.insertId;

    // Creer le build
    const buildId = await Build.create({
      commit_id: commitId,
      pipeline_id: pipelineId,
      statut: 'en_attente'
    });

    logger.info(`Build cree: #${buildId}`);

    // Executer le build de maniere asynchrone
    setImmediate(async () => {
      await BuildWorker.executeBuild({
        buildId: buildId,
        repositoryId: repoId
      });
    });

    res.json({
      message: 'Build declenche avec succes',
      buildId: buildId,
      status: 'en_attente',
      info: 'Le build va cloner le code depuis GitHub et executer le pipeline complet'
    });

  } catch (error) {
    logger.error('Erreur declenchement build:', error);
    res.status(500).json({ error: 'Erreur lors du declenchement du build' });
  }
});

/**
 * POST /api/webhooks/git
 * Webhook Git (simulation)
 */
router.post('/git', async (req, res) => {
  try {
    logger.info('Webhook Git recu');
    
    // Dans une vraie implementation, on recevrait les donnees de GitHub/GitLab
    const { repository, commit } = req.body;
    
    res.json({ 
      message: 'Webhook recu',
      status: 'processing' 
    });

  } catch (error) {
    logger.error('Erreur webhook:', error);
    res.status(500).json({ error: 'Erreur webhook' });
  }
});

module.exports = router;