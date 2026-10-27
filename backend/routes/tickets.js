const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// GET tous les tickets
router.get('/', authenticate, async (req, res) => {
    let sql = `
        SELECT t.*, e.code as equipmentCode, u1.fullname as createdByName, u2.fullname as assignedToName
        FROM tickets t
        LEFT JOIN equipments e ON t.equipmentId = e.id
        LEFT JOIN users u1 ON t.createdBy = u1.id
        LEFT JOIN users u2 ON t.assignedTo = u2.id
    `;
    const params = [];
    if (req.user.role === 'user') {
        sql += ' WHERE t.createdBy = ?';
        params.push(req.user.id);
    }
    const [rows] = await db.query(sql, params);
    res.json(rows);
});

// POST créer un ticket
router.post('/', authenticate, async (req, res) => {
    const { title, description, priority, equipmentId } = req.body;
    const sql = `INSERT INTO tickets (title, description, priority, equipmentId, createdBy, status)
                 VALUES (?, ?, ?, ?, ?, 'open')`;
    const [result] = await db.query(sql, [title, description, priority, equipmentId || null, req.user.id]);
    res.status(201).json({ id: result.insertId });
});

// PUT (fermer/assigner)
router.put('/:id', authenticate, authorize('admin', 'technicien'), async (req, res) => {
    const { status, assignedTo } = req.body;
    let resolvedAt = null;
    if (status === 'closed') resolvedAt = new Date();
    const sql = `UPDATE tickets SET status=?, assignedTo=?, resolvedAt=? WHERE id=?`;
    const [result] = await db.query(sql, [status, assignedTo || null, resolvedAt, req.params.id]);
    res.json({ updated: result.affectedRows });
});

// DELETE
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
    const [result] = await db.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ deleted: result.affectedRows });
});

module.exports = router;