const express = require('express');
const router = express.Router();
const blockchainSync = require('../services/blockchain-sync');
const Group = require('../models/Group');
const Activity = require('../models/Activity');

// Get sync service status
router.get('/status', async (req, res) => {
  try {
    const status = await blockchainSync.healthCheck();
    res.json(status);
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manual sync trigger for specific group
router.post('/group/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid contract address' });
    }
    
    const result = await blockchainSync.syncGroup(address);
    
    if (!result) {
      return res.status(404).json({ error: 'Group not found on blockchain' });
    }
    
    res.json({ 
      success: true, 
      message: 'Group synchronized successfully',
      group: result 
    });
  } catch (error) {
    console.error('Error syncing group:', error);
    res.status(500).json({ error: error.message });
  }
});

// Force full resync
router.post('/resync', async (req, res) => {
  try {
    // Stop current sync service
    await blockchainSync.stopSyncService();
    
    // Clear database activities from blockchain source
    await Activity.deleteMany({ source: 'blockchain' });
    console.log('🗑️ Cleared blockchain activities from database');
    
    // Restart sync service
    await blockchainSync.startSyncService();
    
    res.json({ 
      success: true, 
      message: 'Full resync initiated successfully' 
    });
  } catch (error) {
    console.error('Error during resync:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sync statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalGroups,
      blockchainGroups,
      totalActivities,
      blockchainActivities,
      manualActivities
    ] = await Promise.all([
      Group.countDocuments(),
      Group.countDocuments({ contractAddress: { $ne: null } }),
      Activity.countDocuments(),
      Activity.countDocuments({ source: 'blockchain' }),
      Activity.countDocuments({ source: 'manual' })
    ]);
    
    const syncHealth = await blockchainSync.healthCheck();
    
    res.json({
      groups: {
        total: totalGroups,
        blockchain: blockchainGroups,
        syncPercentage: totalGroups > 0 ? Math.round((blockchainGroups / totalGroups) * 100) : 0
      },
      activities: {
        total: totalActivities,
        blockchain: blockchainActivities,
        manual: manualActivities,
        blockchainPercentage: totalActivities > 0 ? Math.round((blockchainActivities / totalActivities) * 100) : 0
      },
      syncService: syncHealth,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting sync stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validate group against blockchain
router.get('/validate/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid contract address' });
    }
    
    // Get group from database
    const dbGroup = await Group.findOne({ contractAddress: address.toLowerCase() });
    
    if (!dbGroup) {
      return res.status(404).json({ error: 'Group not found in database' });
    }
    
    // Get group info from blockchain (this will throw if not found)
    const blockchainData = await blockchainSync.syncGroup(address);
    
    if (!blockchainData) {
      return res.json({
        isValid: false,
        issues: ['Group exists in database but not found on blockchain'],
        databaseGroup: dbGroup
      });
    }
    
    // Compare key fields
    const issues = [];
    if (dbGroup.name !== blockchainData.name) {
      issues.push(`Name mismatch: DB="${dbGroup.name}" vs Blockchain="${blockchainData.name}"`);
    }
    
    if (dbGroup.creator.address.toLowerCase() !== blockchainData.creator.address.toLowerCase()) {
      issues.push(`Creator mismatch: DB="${dbGroup.creator.address}" vs Blockchain="${blockchainData.creator.address}"`);
    }
    
    res.json({
      isValid: issues.length === 0,
      issues,
      databaseGroup: dbGroup,
      blockchainGroup: blockchainData
    });
    
  } catch (error) {
    console.error('Error validating group:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;