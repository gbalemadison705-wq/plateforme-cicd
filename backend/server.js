/**
 * PLATEFORME CI/CD - Point d entree du backend
 * Serveur Express avec gestion des routes et connexion BDD
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { initDatabase } = require('./src/config/initDatabase');

// Importation des routes
const authRoutes = require('./src/routes/auth');
const repositoryRoutes = require('./src/routes/repositories');
const buildRoutes = require('./src/routes/builds');
const webhookRoutes = require('./src/routes/webhooks');

// Initialisation de l application
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES GLOBAUX
// ==========================================

// Securite HTTP
app.use(helmet());

// CORS - Autorise les requetes depuis le frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON et URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs des requetes (en developpement)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ==========================================
// ROUTES
// ==========================================

// Route de sante (pour verifier que le serveur fonctionne)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur CI/CD operationnel',
    timestamp: new Date().toISOString()
  });
});

// Routes de l API
app.use('/api/auth', authRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/builds', buildRoutes);
app.use('/api/webhooks', webhookRoutes);

// Route par defaut (404)
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route non trouvee',
    path: req.originalUrl 
  });
});

// ==========================================
// GESTION DES ERREURS
// ==========================================

app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==========================================
// DEMARRAGE DU SERVEUR
// ==========================================

app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║   PLATEFORME CI/CD - BACKEND ACTIF    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🚀 Serveur demarre sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📝 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Demarre le: ${new Date().toLocaleString('fr-FR')}`);
  console.log('─────────────────────────────────────────');
  console.log('✅ Pret a recevoir des requetes !');
  console.log('');
});

// Initialiser la base de données
initDatabase().catch(err => {
  console.error('❌ Erreur initialisation DB:', err.message);
});

// Gestion propre de l arret
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM recu, arret du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nArret du serveur...');
  process.exit(0);
});

module.exports = app;