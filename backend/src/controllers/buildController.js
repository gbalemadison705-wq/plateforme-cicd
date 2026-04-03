/**
 * Controller Build - Gestion des builds
 */

const Build = require('../models/Build');
const logger = require('../utils/logger');

/**
 * Recuperer tous les builds de l utilisateur
 */
async function getUserBuilds(req, res) {
  try {
    const builds = await Build.findByUserId(req.user.id);

    res.json({ builds });

  } catch (error) {
    logger.error('Erreur recuperation builds:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Recuperer un build par ID
 */
async function getBuildById(req, res) {
  try {
    const { id } = req.params;
    const build = await Build.findById(id);

    if (!build) {
      return res.status(404).json({ error: 'Build non trouve' });
    }

    // Verifier que le build appartient a l utilisateur (sauf admin)
    if (build.utilisateur_id !== req.user.id && req.user.role !== 'administrateur') {
      return res.status(403).json({ error: 'Acces refuse' });
    }

    res.json({ build });

  } catch (error) {
    logger.error('Erreur recuperation build:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Recuperer les statistiques de builds
 */
async function getStats(req, res) {
  try {
    const userId = req.user.role === 'administrateur' ? null : req.user.id;
    const stats = await Build.getStats(userId);

    res.json({ stats });

  } catch (error) {
    logger.error('Erreur recuperation stats:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getUserBuilds,
  getBuildById,
  getStats
};