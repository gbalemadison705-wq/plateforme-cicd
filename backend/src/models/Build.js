/**
 * Model Build - Gestion des constructions (builds)
 */

const db = require('../config/database');

class Build {
  /**
   * Creer un nouveau build
   */
  static async create(buildData) {
    const { commit_id, pipeline_id, statut } = buildData;
    
    const query = `
      INSERT INTO construction (commit_id, pipeline_id, statut) 
      VALUES (?, ?, ?)
    `;
    
    const result = await db.query(query, [commit_id, pipeline_id, statut || 'en_attente']);
    return result.insertId;
  }

  /**
   * Trouver un build par ID
   */
  static async findById(id) {
    const query = `
      SELECT c.*, 
             co.commit_hash, co.message as commit_message, co.auteur,
             d.nom as depot_nom, d.utilisateur_id
      FROM construction c
      JOIN commit co ON c.commit_id = co.id
      JOIN depot d ON co.depot_id = d.id
      WHERE c.id = ?
    `;
    
    const builds = await db.query(query, [id]);
    return builds[0] || null;
  }

  /**
   * Trouver tous les builds d un utilisateur
   */
  static async findByUserId(userId) {
    const query = `
      SELECT c.*, 
             co.commit_hash, co.message as commit_message,
             d.nom as depot_nom
      FROM construction c
      JOIN commit co ON c.commit_id = co.id
      JOIN depot d ON co.depot_id = d.id
      WHERE d.utilisateur_id = ?
      ORDER BY c.date_debut DESC
      LIMIT 50
    `;
    
    return await db.query(query, [userId]);
  }

  /**
   * Mettre a jour le statut d un build
   */
  static async updateStatus(buildId, statut, additionalData = {}) {
    let query = 'UPDATE construction SET statut = ?';
    let params = [statut];
    
    if (additionalData.date_fin) {
      query += ', date_fin = ?';
      params.push(additionalData.date_fin);
    }
    
    if (additionalData.duree) {
      query += ', duree = ?';
      params.push(additionalData.duree);
    }
    
    if (additionalData.url_deploiement) {
      query += ', url_deploiement = ?';
      params.push(additionalData.url_deploiement);
    }
    
    query += ' WHERE id = ?';
    params.push(buildId);
    
    await db.query(query, params);
  }

  /**
   * Recuperer les statistiques des builds
   */
  static async getStats(userId = null) {
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'reussi' THEN 1 ELSE 0 END) as reussis,
        SUM(CASE WHEN statut = 'echoue' THEN 1 ELSE 0 END) as echoues,
        SUM(CASE WHEN statut = 'en_cours' THEN 1 ELSE 0 END) as en_cours,
        AVG(duree) as duree_moyenne
      FROM construction c
      JOIN commit co ON c.commit_id = co.id
      JOIN depot d ON co.depot_id = d.id
    `;
    
    if (userId) {
      query += ' WHERE d.utilisateur_id = ?';
      const stats = await db.query(query, [userId]);
      return stats[0];
    } else {
      const stats = await db.query(query);
      return stats[0];
    }
  }
}

module.exports = Build;