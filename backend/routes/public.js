const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /public/equipments - liste publique des équipements (sans les infos sensibles)
router.get('/equipments', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id, code, type, brand, model, status, image_url
            FROM equipments
            WHERE status = 'active'
        `);
        const equipments = rows.map(eq => ({
            ...eq,
            image_url: eq.image_url ? `http://localhost:${process.env.PORT || 5000}/uploads/${eq.image_url}` : null
        }));
        res.json(equipments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /public/tickets - formulaire public pour signaler un problème
router.post('/tickets', async (req, res) => {
    const { name, email, equipmentId, title, description } = req.body;
    // Créer un ticket sans utilisateur connecté (createdBy = NULL)
    const sql = `INSERT INTO tickets (title, description, status, priority, equipmentId, createdBy)
                 VALUES (?, ?, 'open', 'medium', ?, NULL)`;
    try {
        const [result] = await db.query(sql, [title, description, equipmentId || null]);
        res.status(201).json({ id: result.insertId, message: 'Ticket créé, nous vous contacterons rapidement.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;