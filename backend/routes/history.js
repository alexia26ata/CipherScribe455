const express = require('express');
const router = express.Router();
const {
  getHistory,
  clearHistory,
  deleteHistoryItem
} = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getHistory);
router.delete('/', authMiddleware, clearHistory); // Clear all
router.delete('/:id', authMiddleware, deleteHistoryItem); // Delete one

module.exports = router;
