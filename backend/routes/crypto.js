const express = require("express");
const router = express.Router();
const NodeRSA = require("node-rsa");

// Route: POST /api/crypto/generate
router.post("/generate", (req, res) => {
  const { keySize } = req.body;
  const size = keySize === 2048 ? 2048 : 1024;

  try {
    const key = new NodeRSA({ b: size });
    const publicKey = key.exportKey("components-public");
    const privateKey = key.exportKey("components-private");

    res.json({
      publicKey: {
        e: parseInt(publicKey.e, 16),
        n: parseInt(publicKey.n, 16),
      },
      privateKey: {
        d: parseInt(privateKey.d, 16),
        n: parseInt(privateKey.n, 16),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Key generation failed" });
  }
});

module.exports = router;
