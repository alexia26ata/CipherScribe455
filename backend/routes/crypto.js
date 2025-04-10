const express = require('express');
const router = express.Router();
const { encryptMessage, decryptMessage } = require('../controllers/cryptoController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/encrypt', authMiddleware, encryptMessage);
router.post('/decrypt', authMiddleware, decryptMessage);

module.exports = router;