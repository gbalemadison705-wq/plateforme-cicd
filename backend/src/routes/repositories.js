/**
 * Routes Repositories - Gestion des depots
 */

const express = require('express');
const router = express.Router();
const repositoryController = require('../controllers/repositoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Toutes les routes necessitent authentification
router.use(authenticateToken);

// GET /api/repositories - Liste des depots de l utilisateur
router.get('/', repositoryController.getUserRepositories);

// POST /api/repositories - Creer un depot
router.post('/', repositoryController.createRepository);

// GET /api/repositories/:id - Details d un depot
router.get('/:id', repositoryController.getRepositoryById);

// DELETE /api/repositories/:id - Supprimer un depot
router.delete('/:id', repositoryController.deleteRepository);

// GET /api/repositories/admin/all - Tous les depots (admin seulement)
router.get('/admin/all', requireAdmin, repositoryController.getAllRepositories);

module.exports = router;