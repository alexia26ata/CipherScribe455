const Message = require('../models/Message');

exports.encryptMessage = async (req, res) => {
    const { message, e, n } = req.body;
    const m = BigInt(message);
    const c = m ** BigInt(e) % BigInt(n);
    const saved = await Message.create({
        user: req.user.id,
        direction: 'encrypt',
        input: message,
        output: c.toString()
    });
    res.json({ ciphertext: c.toString() });
};

exports.decryptMessage = async (req, res) => {
    const { ciphertext, d, n } = req.body;
    const m = BigInt(ciphertext) ** BigInt(d) % BigInt(n);
    const saved = await Message.create({
        user: req.user.id,
        direction: 'decrypt',
        input: ciphertext,
        output: m.toString()
    });
    res.json({ message: m.toString() });
};