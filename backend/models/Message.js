const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    direction: String,
    input: String,
    output: String
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);