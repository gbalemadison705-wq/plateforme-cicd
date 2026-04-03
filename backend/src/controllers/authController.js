/**
 * Controller Auth - Gestion authentification
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Inscription d'un nouvel utilisateur
 */
async function register(req, res) {
  try {
    const { nom_utilisateur, email, mot_de_passe } = req.body;

    // Verification des champs
    if (!nom_utilisateur || !email || !mot_de_passe) {
      return res.status(400).json({ 
        error: 'Tous les champs sont requis' 
      });
    }

    // Verifier si l'email existe deja
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Cet email est deja utilise' 
      });
    }

    // Creer l'utilisateur
    const userId = await User.create({ nom_utilisateur, email, mot_de_passe });

    logger.success(`Nouvel utilisateur cree: ${email}`);

    res.status(201).json({ 
      message: 'Compte cree avec succes',
      userId 
    });

  } catch (error) {
    logger.error('Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l inscription' });
  }
}

/**
 * Connexion utilisateur
 */
async function login(req, res) {
  try {
    const { email, mot_de_passe } = req.body;

    // Verification des champs
    if (!email || !mot_de_passe) {
      return res.status(400).json({ 
        error: 'Email et mot de passe requis' 
      });
    }

    // Trouver l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Verifier le mot de passe
    const validPassword = await User.verifyPassword(mot_de_passe, user.mot_de_passe);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }

    // Verifier si le compte est actif
    if (!user.actif) {
      return res.status(403).json({ 
        error: 'Compte desactive' 
      });
    }

    // Generer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Mettre a jour la derniere connexion
    await User.updateLastLogin(user.id);

    logger.success(`Connexion reussie: ${email}`);

    res.json({
      message: 'Connexion reussie',
      token,
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    logger.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
}

/**
 * Recuperer les infos de l'utilisateur connecte
 */
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouve' });
    }

    res.json({ user });

  } catch (error) {
    logger.error('Erreur getMe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  register,
  login,
  getMe
};