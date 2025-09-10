require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const multisigRoutes = require('./routes/multisig');
const groupRoutes = require('./routes/groups');
const activityRoutes = require('./routes/activities');
const syncRoutes = require('./routes/sync');
const blockchainSync = require('./services/blockchain-sync');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Frontend URL
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kindnest')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/multisig', multisigRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'KindNest Backend Running' });
});

// Blockchain sync health check
app.get('/api/sync/status', async (req, res) => {
  try {
    const status = await blockchainSync.healthCheck();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for debugging
app.post('/api/test', (req, res) => {
  console.log('🧪 Test endpoint called:', req.body);
  res.json({ success: true, message: 'Test endpoint working', timestamp: Date.now() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 KindNest Backend running on port ${PORT}`);
  
  // Start blockchain synchronization service
  try {
    await blockchainSync.startSyncService();
  } catch (error) {
    console.error('⚠️ Failed to start blockchain sync service:', error);
  }
});

module.exports = app;