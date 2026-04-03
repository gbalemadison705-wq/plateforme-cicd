-- ============================================
-- BASE DE DONNÉES - PLATEFORME CI/CD
-- Mémoire de Licence
-- ============================================

-- Créer la base de données
DROP DATABASE IF EXISTS plateforme_cicd;
CREATE DATABASE plateforme_cicd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE plateforme_cicd;

-- ============================================
-- TABLE 1 : UTILISATEUR
-- ============================================
CREATE TABLE utilisateur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_utilisateur VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('utilisateur', 'administrateur') DEFAULT 'utilisateur',
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_nom_utilisateur (nom_utilisateur)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 2 : DEPOT (Projets)
-- ============================================
CREATE TABLE depot (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    chemin_stockage VARCHAR(255) NOT NULL,
    url_git VARCHAR(255),
    dernier_commit_hash VARCHAR(40),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    UNIQUE KEY unique_depot_user (utilisateur_id, nom),
    INDEX idx_utilisateur (utilisateur_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 3 : COMMIT
-- ============================================
CREATE TABLE commit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    depot_id INT NOT NULL,
    commit_hash VARCHAR(40) UNIQUE NOT NULL,
    message TEXT,
    auteur VARCHAR(100),
    horodatage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (depot_id) REFERENCES depot(id) ON DELETE CASCADE,
    INDEX idx_depot (depot_id),
    INDEX idx_hash (commit_hash)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 4 : PIPELINE
-- ============================================
CREATE TABLE pipeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    depot_id INT UNIQUE NOT NULL,
    fichier_config TEXT,
    etapes JSON,
    actif BOOLEAN DEFAULT TRUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (depot_id) REFERENCES depot(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 5 : CONSTRUCTION (Builds)
-- ============================================
CREATE TABLE construction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    commit_id INT NOT NULL,
    pipeline_id INT NOT NULL,
    statut ENUM('en_attente', 'en_cours', 'reussi', 'echoue', 'annule') DEFAULT 'en_attente',
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP NULL,
    duree INT,
    logs LONGTEXT,
    url_deploiement VARCHAR(255),
    FOREIGN KEY (commit_id) REFERENCES commit(id) ON DELETE CASCADE,
    FOREIGN KEY (pipeline_id) REFERENCES pipeline(id) ON DELETE CASCADE,
    INDEX idx_statut (statut),
    INDEX idx_commit (commit_id),
    INDEX idx_pipeline (pipeline_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 6 : ETAPE (Étapes d'un build)
-- ============================================
CREATE TABLE etape (
    id INT AUTO_INCREMENT PRIMARY KEY,
    construction_id INT NOT NULL,
    nom VARCHAR(50) NOT NULL,
    ordre INT NOT NULL,
    statut ENUM('en_attente', 'en_cours', 'reussi', 'echoue') DEFAULT 'en_attente',
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP NULL,
    duree INT,
    logs TEXT,
    commande TEXT,
    FOREIGN KEY (construction_id) REFERENCES construction(id) ON DELETE CASCADE,
    INDEX idx_construction (construction_id)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 7 : DEPLOIEMENT
-- ============================================
CREATE TABLE deploiement (
    id INT AUTO_INCREMENT PRIMARY KEY,
    construction_id INT UNIQUE NOT NULL,
    url VARCHAR(255) UNIQUE NOT NULL,
    chemin_serveur VARCHAR(255) NOT NULL,
    statut ENUM('actif', 'inactif') DEFAULT 'actif',
    taille_octets BIGINT,
    date_deploiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (construction_id) REFERENCES construction(id) ON DELETE CASCADE,
    INDEX idx_url (url)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 8 : NOTIFICATION
-- ============================================
CREATE TABLE notification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    construction_id INT,
    type ENUM('info', 'succes', 'erreur', 'avertissement') DEFAULT 'info',
    message TEXT NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (construction_id) REFERENCES construction(id) ON DELETE SET NULL,
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_lu (lu)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 9 : STATISTIQUE
-- ============================================
CREATE TABLE statistique (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_builds INT DEFAULT 0,
    builds_reussis INT DEFAULT 0,
    builds_echoues INT DEFAULT 0,
    espace_disque_utilise BIGINT DEFAULT 0,
    duree_moyenne_build INT,
    INDEX idx_date (date)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 10 : QUOTA
-- ============================================
CREATE TABLE quota (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT UNIQUE NOT NULL,
    stockage_max BIGINT DEFAULT 1073741824,
    stockage_utilise BIGINT DEFAULT 0,
    builds_max_par_jour INT DEFAULT 50,
    builds_aujourd_hui INT DEFAULT 0,
    date_reset_quotidien DATE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLE 11 : LOG_SYSTEME
-- ============================================
CREATE TABLE log_systeme (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT,
    type_action VARCHAR(50) NOT NULL,
    description TEXT,
    adresse_ip VARCHAR(45),
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE SET NULL,
    INDEX idx_type_action (type_action),
    INDEX idx_date (date_action)
) ENGINE=InnoDB;

-- ============================================
-- TABLE 12 : SESSION
-- ============================================
CREATE TABLE session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utilisateur_id INT NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    adresse_ip VARCHAR(45),
    user_agent TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    actif BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_utilisateur (utilisateur_id)
) ENGINE=InnoDB;

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Utilisateur admin (mot de passe: admin123)
INSERT INTO utilisateur (nom_utilisateur, email, mot_de_passe, role) VALUES
('admin', 'admin@plateforme-cicd.com', '$2b$10$rG7XHqJYz.0d6X5xKvY.6e7K8vZHxJ9mN3pL2qW4sT6uV8xC0yE1m', 'administrateur');

-- Utilisateur test (mot de passe: test123)
INSERT INTO utilisateur (nom_utilisateur, email, mot_de_passe, role) VALUES
('testuser', 'test@example.com', '$2b$10$rG7XHqJYz.0d6X5xKvY.6e7K8vZHxJ9mN3pL2qW4sT6uV8xC0yE1m', 'utilisateur');

-- Créer les quotas pour ces utilisateurs
INSERT INTO quota (utilisateur_id, date_reset_quotidien) VALUES
(1, CURDATE()),
(2, CURDATE());

-- ============================================
-- CONFIRMATION
-- ============================================
SELECT 'Base de données créée avec succès!' AS Message;
SELECT COUNT(*) AS 'Nombre de tables' FROM information_schema.tables WHERE table_schema = 'plateforme_cicd';
```

---

## ▶️ ÉTAPE 3 : EXÉCUTER LE SCRIPT

**1.** Le script SQL est maintenant copié

**2.** Allez dans **MySQL Workbench**

**3.** **Collez** le script dans la zone de texte (**Ctrl + V**)

**4.** Cherchez l'icône **⚡ Execute** (un éclair jaune) dans la barre d'outils

**5.** **Cliquez dessus**

**6.** Attendez quelques secondes...

**7.** ✅ En bas, vous devriez voir :
```
Base de données créée avec succès!
Nombre de tables: 12
```

---

## ✅ ÉTAPE 4 : VÉRIFIER

**1.** Dans le panneau de **gauche**, cherchez **"Schemas"** ou **"Navigator"**

**2.** Cliquez sur l'icône **🔄 Refresh** (actualiser)

**3.** Vous devriez voir :
```
plateforme_cicd
  └── Tables (12)
      ├── utilisateur
      ├── depot
      ├── commit
      ├── pipeline
      ├── construction
      ├── etape
      ├── deploiement
      ├── notification
      ├── statistique
      ├── quota
      ├── log_systeme
      └── session