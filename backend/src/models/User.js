/**
 * Model User - Gestion des utilisateurs
 */

const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  /**
   * Créer un nouvel utilisateur
   */
  static async create(userData) {
    const { nom_utilisateur, email, mot_de_passe } = userData;
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    
    const query = `
      INSERT INTO utilisateur (nom_utilisateur, email, mot_de_passe) 
      VALUES (?, ?, ?)
    `;
    
    const result = await db.query(query, [nom_utilisateur, email, hashedPassword]);
    return result.insertId;
  }

  /**
   * Trouver un utilisateur par email
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM utilisateur WHERE email = ?';
    const users = await db.query(query, [email]);
    return users[0] || null;
  }

  /**
   * Trouver un utilisateur par ID
   */
  static async findById(id) {
    const query = 'SELECT id, nom_utilisateur, email, role, actif FROM utilisateur WHERE id = ?';
    const users = await db.query(query, [id]);
    return users[0] || null;
  }

  /**
   * Vérifier le mot de passe
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Récupérer tous les utilisateurs (admin)
   */
  static async findAll() {
    const query = 'SELECT id, nom_utilisateur, email, role, actif, date_creation FROM utilisateur';
    return await db.query(query);
  }

  /**
   * Mettre à jour la dernière connexion
   */
  static async updateLastLogin(userId) {
    const query = 'UPDATE utilisateur SET derniere_connexion = NOW() WHERE id = ?';
    await db.query(query, [userId]);
  }
}

module.exports = User;