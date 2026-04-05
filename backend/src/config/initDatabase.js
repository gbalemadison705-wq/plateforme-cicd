/**
 * Script d'initialisation de la base de données
 */

const db = require('./database');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    logger.info('========================================');
    logger.info('INITIALISATION DE LA BASE DE DONNÉES');
    logger.info('========================================');

    // Lire le fichier schema.sql
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Séparer les requêtes SQL (par point-virgule)
    const queries = schema
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));

    // Exécuter chaque requête
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query) {
        await db.query(query);
        logger.info(`Requête ${i + 1}/${queries.length} exécutée`);
      }
    }

    logger.success('========================================');
    logger.success('Base de données initialisée avec succès !');
    logger.success('========================================');

  } catch (error) {
    logger.error('Erreur lors de l\'initialisation:', error.message);
    throw error;
  }
}

module.exports = { initDatabase };