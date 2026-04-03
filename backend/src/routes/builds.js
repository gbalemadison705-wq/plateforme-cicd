/**
 * Routes Builds - Gestion des builds
 */

const express = require('express');
const router = express.Router();
const buildController = require('../controllers/buildController');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes necessitent authentification
router.use(authenticateToken);

// GET /api/builds - Liste des builds de l utilisateur
router.get('/', buildController.getUserBuilds);

// GET /api/builds/stats - Statistiques des builds
router.get('/stats', buildController.getStats);

// GET /api/builds/:id - Details d un build
router.get('/:id', buildController.getBuildById);

module.exports = router;