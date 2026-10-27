const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const path = require('path');

// GET tous les équipements (avec image)
router.get('/', authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, u.fullname as assignedToName 
            FROM equipments e
            LEFT JOIN users u ON e.assignedTo = u.id
        `);
        // Ajouter l'URL complète de l'image
        const equipments = rows.map(eq => ({
            ...eq,
            image_url: eq.image_url ? `http://localhost:${process.env.PORT || 5000}/uploads/${eq.image_url}` : null
        }));
        res.json(equipments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET un équipement par ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, u.fullname as assignedToName 
            FROM equipments e
            LEFT JOIN users u ON e.assignedTo = u.id
            WHERE e.id = ?
        `, [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Équipement non trouvé' });
        const equipment = rows[0];
        equipment.image_url = equipment.image_url ? `http://localhost:${process.env.PORT || 5000}/uploads/${equipment.image_url}` : null;
        res.json(equipment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST créer un équipement (avec upload image)
router.post('/', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
    const { code, type, brand, model, serialNumber, purchaseDate, warrantyEnd, location, assignedTo } = req.body;
    const image_filename = req.file ? req.file.filename : null;
    const sql = `INSERT INTO equipments (code, type, brand, model, serialNumber, purchaseDate, warrantyEnd, location, assignedTo, image_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
        const [result] = await db.query(sql, [code, type, brand, model, serialNumber, purchaseDate, warrantyEnd, location, assignedTo || null, image_filename]);
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT modifier un équipement (avec mise à jour image possible)
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
    const { code, type, brand, model, serialNumber, status, purchaseDate, warrantyEnd, location, assignedTo } = req.body;
    let image_filename = null;
    if (req.file) image_filename = req.file.filename;
    else {
        // Conserver l'ancienne image si aucune nouvelle n'est envoyée
        const [old] = await db.query('SELECT image_url FROM equipments WHERE id = ?', [req.params.id]);
        if (old.length) image_filename = old[0].image_url;
    }
    const sql = `UPDATE equipments 
                 SET code=?, type=?, brand=?, model=?, serialNumber=?, status=?, purchaseDate=?, warrantyEnd=?, location=?, assignedTo=?, image_url=?
                 WHERE id=?`;
    try {
        const [result] = await db.query(sql, [code, type, brand, model, serialNumber, status, purchaseDate, warrantyEnd, location, assignedTo || null, image_filename, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Équipement non trouvé' });
        res.json({ updated: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE supprimer un équipement (supprime aussi l'image du disque)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    try {
        const [rows] = await db.query('SELECT image_url FROM equipments WHERE id = ?', [req.params.id]);
        if (rows.length && rows[0].image_url) {
            const fs = require('fs');
            const filepath = path.join(__dirname, '../uploads', rows[0].image_url);
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        }
        const [result] = await db.query('DELETE FROM equipments WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Équipement non trouvé' });
        res.json({ deleted: result.affectedRows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;