/**
 * Controller Repository - Gestion des depots
 */

const Repository = require('../models/Repository');
const logger = require('../utils/logger');
const path = require('path');

/**
 * Creer un nouveau depot
 */
async function createRepository(req, res) {
  try {
    const { nom, description, github_url, github_branch } = req.body;
    const utilisateur_id = req.user.id;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom du depot est requis' });
    }

    if (!github_url) {
      return res.status(400).json({ error: 'L URL GitHub est requise' });
    }

    // Verifier si le depot existe deja
    const exists = await Repository.existsByUserAndName(utilisateur_id, nom);
    if (exists) {
      return res.status(409).json({ 
        error: 'Un depot avec ce nom existe deja' 
      });
    }

    // Creer le chemin de stockage
    const chemin_stockage = path.join('storage', 'repositories', `user_${utilisateur_id}`, nom);

    // Creer le depot
   const repoId = await Repository.create({
  utilisateur_id,
  nom,
  description: description || '',
  chemin_stockage,
  github_url,
  github_branch: github_branch || 'main'
  });

    logger.success(`Nouveau depot cree: ${nom} (user: ${utilisateur_id})`);

    res.status(201).json({
      message: 'Depot cree avec succes',
      repository: {
        id: repoId,
        nom,
        description,
        chemin_stockage
      }
    });

  } catch (error) {
    logger.error('Erreur creation depot:', error);
    res.status(500).json({ error: 'Erreur lors de la creation du depot' });
  }
}

/**
 * Recuperer tous les depots de l'utilisateur
 */
async function getUserRepositories(req, res) {
  try {
    const repositories = await Repository.findByUserId(req.user.id);

    res.json({ repositories });

  } catch (error) {
    logger.error('Erreur recuperation depots:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Recuperer un depot par ID
 */
async function getRepositoryById(req, res) {
  try {
    const { id } = req.params;
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ error: 'Depot non trouve' });
    }

    // Verifier que le depot appartient a l'utilisateur (sauf admin)
    if (repository.utilisateur_id !== req.user.id && req.user.role !== 'administrateur') {
      return res.status(403).json({ error: 'Acces refuse' });
    }

    res.json({ repository });

  } catch (error) {
    logger.error('Erreur recuperation depot:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Supprimer un depot
 */
async function deleteRepository(req, res) {
  try {
    const { id } = req.params;
    const repository = await Repository.findById(id);

    if (!repository) {
      return res.status(404).json({ error: 'Depot non trouve' });
    }

    // Verifier que le depot appartient a l'utilisateur
    if (repository.utilisateur_id !== req.user.id && req.user.role !== 'administrateur') {
      return res.status(403).json({ error: 'Acces refuse' });
    }

    await Repository.delete(id);

    logger.info(`Depot supprime: ${repository.nom}`);

    res.json({ message: 'Depot supprime avec succes' });

  } catch (error) {
    logger.error('Erreur suppression depot:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

/**
 * Recuperer tous les depots (admin)
 */
async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.findAll();

    res.json({ repositories });

  } catch (error) {
    logger.error('Erreur recuperation tous depots:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  createRepository,
  getUserRepositories,
  getRepositoryById,
  deleteRepository,
  getAllRepositories
};