require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const cryptoRoutes = require('./routes/crypto');
const historyRoutes = require('./routes/history');

// Import generateKeyPair and middleware if needed
const { generateKeyPair } = require('./utils/cryptoUtils');
//const authMiddleware = require('./middleware/auth'); // comment this if you're not using auth

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/history', historyRoutes);

// BONUS: Generate RSA key pair on backend
app.post('/api/crypto/generate', authMiddleware, (req, res) => {
  const { size } = req.body; // expect size: 1024 or 2048
  try {
    const keys = generateKeyPair(size);
    res.json(keys);
  } catch (err) {
    console.error('Key generation error:', err);
    res.status(500).json({ message: 'Failed to generate keys' });
  }
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.listen(3001, () => console.log('Server running on http://localhost:3001'));
}).catch(err => console.error('MongoDB error:', err));
