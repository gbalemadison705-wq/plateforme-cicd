/**
 * Middleware d'authentification JWT
 * Vérifie que l'utilisateur est connecté
 */

const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Vérifie le token JWT
 */
function authenticateToken(req, res, next) {
  // Récupérer le token depuis le header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    logger.warning('Tentative d\'accès sans token');
    return res.status(401).json({ 
      error: 'Accès non autorisé',
      message: 'Token manquant' 
    });
  }

  // Vérifier le token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warning('Token invalide détecté');
      return res.status(403).json({ 
        error: 'Token invalide',
        message: 'Votre session a expiré, veuillez vous reconnecter' 
      });
    }

    // Token valide - ajouter les infos user à la requête
    req.user = user;
    next();
  });
}

/**
 * Vérifie que l'utilisateur est admin
 */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'administrateur') {
    logger.warning(`Accès admin refusé pour l'utilisateur ${req.user.id}`);
    return res.status(403).json({ 
      error: 'Accès refusé',
      message: 'Droits administrateur requis' 
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};