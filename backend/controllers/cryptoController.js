const {
    generateRSAKeyPair,
    encryptInteger,
    decryptInteger
  } = require('../utils/rsaUtils');
  
  // Example: Generate keys
  exports.generateKeys = async (req, res) => {
    try {
      const bits = parseInt(req.query.bits) || 2048; // allow 1024/2048
      const keys = await generateRSAKeyPair(bits);
      res.json(keys);
    } catch (err) {
      res.status(500).json({ error: 'Key generation failed' });
    }
  };
  
  // Example: Encrypt
  exports.encryptMessage = (req, res) => {
    const { message, publicKey } = req.body;
    try {
      const ciphertext = encryptInteger(message, publicKey);
      res.json({ ciphertext });
    } catch (err) {
      res.status(400).json({ error: 'Encryption failed' });
    }
  };
  
  // Example: Decrypt
  exports.decryptMessage = (req, res) => {
    const { ciphertext, privateKey } = req.body;
    try {
      const message = decryptInteger(ciphertext, privateKey);
      res.json({ message });
    } catch (err) {
      res.status(400).json({ error: 'Decryption failed' });
    }
  };
  