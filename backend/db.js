const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

// Fonction d'initialisation des tables (à appeler au démarrage)
async function initTables() {
    try {
        // Table users
        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin','technicien','user') DEFAULT 'user',
                fullname VARCHAR(100),
                service VARCHAR(100)
            )
        `);

        // Table equipments (avec image_url)
        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS equipments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                code VARCHAR(50) UNIQUE NOT NULL,
                type VARCHAR(50) NOT NULL,
                brand VARCHAR(50),
                model VARCHAR(50),
                serialNumber VARCHAR(100),
                status ENUM('active','maintenance','retired') DEFAULT 'active',
                purchaseDate DATE,
                warrantyEnd DATE,
                location VARCHAR(100),
                assignedTo INT,
                image_url VARCHAR(255),
                FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Table tickets
        await promisePool.execute(`
            CREATE TABLE IF NOT EXISTS tickets (
                id INT PRIMARY KEY AUTO_INCREMENT,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                status ENUM('open','in_progress','closed') DEFAULT 'open',
                priority ENUM('low','medium','high') DEFAULT 'medium',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolvedAt TIMESTAMP NULL,
                equipmentId INT,
                createdBy INT,
                assignedTo INT,
                FOREIGN KEY (equipmentId) REFERENCES equipments(id) ON DELETE SET NULL,
                FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL,
                FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Vérifier si l'admin existe, sinon l'insérer (mot de passe: admin123)
        const [rows] = await promisePool.execute('SELECT * FROM users WHERE username = ?', ['admin']);
        if (rows.length === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            await promisePool.execute(
                'INSERT INTO users (username, password, role, fullname) VALUES (?, ?, ?, ?)',
                ['admin', hashedPassword, 'admin', 'Administrateur']
            );
            console.log('Compte admin créé : admin / admin123');
        }

        console.log('✅ Base de données initialisée avec succès');
    } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation des tables :', err.message);
    }
}

// Exporter la pool promesse + la fonction d'init
module.exports = {
    query: (...args) => promisePool.query(...args),
    execute: (...args) => promisePool.execute(...args),
    getConnection: () => promisePool.getConnection(),
    initTables
};