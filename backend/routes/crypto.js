const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

router.get('/generate-keys', cryptoController.generateKeys);
router.post('/encrypt', cryptoController.encryptMessage);
router.post('/decrypt', cryptoController.decryptMessage);

module.exports = router;
