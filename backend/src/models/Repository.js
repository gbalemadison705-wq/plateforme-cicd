/**
 * Model Repository - Gestion des depots
 */

const db = require('../config/database');

class Repository {
  /**
   * Creer un nouveau depot
   */
  static async create(repoData) {
  const { utilisateur_id, nom, description, chemin_stockage, github_url, github_branch } = repoData;
  
  const query = `
    INSERT INTO depot (utilisateur_id, nom, description, chemin_stockage, github_url, github_branch) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const result = await db.query(query, [
    utilisateur_id, 
    nom, 
    description, 
    chemin_stockage,
    github_url || null,
    github_branch || 'main'
  ]);
  return result.insertId;
}

  /**
   * Trouver tous les depots d'un utilisateur
   */
  static async findByUserId(userId) {
    const query = `
      SELECT d.*, 
             (SELECT COUNT(*) FROM construction c 
              JOIN commit co ON c.commit_id = co.id 
              WHERE co.depot_id = d.id) as total_builds
      FROM depot d
      WHERE d.utilisateur_id = ?
      ORDER BY d.date_modification DESC
    `;
    
    return await db.query(query, [userId]);
  }

  /**
   * Trouver un depot par ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM depot WHERE id = ?';
    const repos = await db.query(query, [id]);
    return repos[0] || null;
  }

  /**
   * Verifier si un depot existe pour un utilisateur
   */
  static async existsByUserAndName(userId, nom) {
    const query = 'SELECT id FROM depot WHERE utilisateur_id = ? AND nom = ?';
    const repos = await db.query(query, [userId, nom]);
    return repos.length > 0;
  }

  /**
   * Supprimer un depot
   */
  static async delete(id) {
    const query = 'DELETE FROM depot WHERE id = ?';
    await db.query(query, [id]);
  }

  /**
   * Recuperer tous les depots (admin)
   */
  static async findAll() {
    const query = `
      SELECT d.*, u.nom_utilisateur, u.email 
      FROM depot d
      JOIN utilisateur u ON d.utilisateur_id = u.id
      ORDER BY d.date_creation DESC
    `;
    
    return await db.query(query);
  }
}

module.exports = Repository;