/**
 * Routes Auth - Authentification
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register - Inscription
router.post('/register', authController.register);

// POST /api/auth/login - Connexion
router.post('/login', authController.login);

// GET /api/auth/me - Infos utilisateur connecte (protege)
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;