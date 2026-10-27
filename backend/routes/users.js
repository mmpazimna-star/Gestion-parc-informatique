const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// GET liste des utilisateurs (admin seulement)
router.get('/', authenticate, authorize('admin'), (req, res) => {
  db.all('SELECT id, username, role, fullname, service FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST créer un utilisateur
router.post('/', authenticate, authorize('admin'), (req, res) => {
  const { username, password, role, fullname, service } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.run(`INSERT INTO users (username, password, role, fullname, service) VALUES (?,?,?,?,?)`,
    [username, hashed, role, fullname, service], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    });
});