const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middlewares/authMiddleware');

router.get('/', authenticate, (req, res) => {
  const stats = {};
  db.get('SELECT COUNT(*) as totalEquipments FROM equipments', [], (err, row) => {
    stats.totalEquipments = row.totalEquipments;
    db.get('SELECT COUNT(*) as activeTickets FROM tickets WHERE status != "closed"', [], (err, row2) => {
      stats.activeTickets = row2.activeTickets;
      db.get('SELECT COUNT(*) as outOfWarranty FROM equipments WHERE warrantyEnd < date("now")', [], (err, row3) => {
        stats.outOfWarranty = row3.outOfWarranty;
        db.all('SELECT type, COUNT(*) as count FROM equipments GROUP BY type', [], (err, rows) => {
          stats.byType = rows;
          res.json(stats);
        });
      });
    });
  });
});

module.exports = router;