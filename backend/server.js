require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { login } = require('./auth');
const equipmentsRoutes = require('./routes/equipments');
const ticketsRoutes = require('./routes/tickets');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
const publicRoutes = require('./routes/public');
app.use('/api/public', publicRoutes);

// Servir les fichiers statiques : images uploadées et frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes publiques
app.post('/api/login', login);

// Routes protégées
app.use('/api/equipments', equipmentsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Initialisation des tables avant démarrage
db.initTables()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Serveur MySQL démarré sur http://localhost:${PORT}`);
            console.log(`📁 Frontend disponible : http://localhost:${PORT}`);
            console.log(`🖼️  Images accessibles : http://localhost:${PORT}/uploads/`);
        });
    })
    .catch((err) => {
        console.error('❌ Erreur critique lors de l\'initialisation de la base :', err);
        process.exit(1);
    });