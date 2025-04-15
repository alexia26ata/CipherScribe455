const forge = require('node-forge');

function generateRSAKeyPair(bits = 2048) {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({ bits, workers: 2 }, (err, keypair) => {
      if (err) return reject(err);

      const n = keypair.publicKey.n.toString(10); // Decimal string
      const e = keypair.publicKey.e.toString(10);
      const d = keypair.privateKey.d.toString(10);

      resolve({
        publicKey: { n, e },
        privateKey: { n, d }
      });
    });
  });
}

function encryptInteger(message, publicKey) {
  const m = new forge.jsbn.BigInteger(message);
  const n = new forge.jsbn.BigInteger(publicKey.n);
  const e = new forge.jsbn.BigInteger(publicKey.e);
  return m.modPow(e, n).toString(10);
}

function decryptInteger(ciphertext, privateKey) {
  const c = new forge.jsbn.BigInteger(ciphertext);
  const n = new forge.jsbn.BigInteger(privateKey.n);
  const d = new forge.jsbn.BigInteger(privateKey.d);
  return c.modPow(d, n).toString(10);
}

module.exports = {
  generateRSAKeyPair,
  encryptInteger,
  decryptInteger
};
