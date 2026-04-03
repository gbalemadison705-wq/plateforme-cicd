/**
 * Configuration de la connexion MySQL
 * Pool de connexions pour meilleures performances
 */

const mysql = require('mysql2/promise');

// Création du pool de connexions
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: 'root123',
  database: process.env.DB_NAME || 'plateforme_cicd',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Test de connexion au démarrage
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connexion MySQL établie');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur MySQL:', error.message);
    return false;
  }
}

// Test automatique
testConnection();

/**
 * Exécuter une requête SQL
 * @param {string} query - Requête SQL
 * @param {Array} params - Paramètres
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Erreur SQL:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  query,
  testConnection
};