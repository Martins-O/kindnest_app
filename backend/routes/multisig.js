const express = require('express');
const jwt = require('jsonwebtoken');
const TransactionProposal = require('../models/TransactionProposal');

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create a new transaction proposal
router.post('/proposals', verifyToken, async (req, res) => {
  try {
    const {
      groupAddress,
      groupName,
      destination,
      amount,
      description,
      data = '0x'
    } = req.body;

    console.log('📝 Creating proposal:', {
      groupAddress,
      groupName,
      destination,
      amount,
      description,
      proposer: req.user.email
    });

    if (!groupAddress || !groupName || !destination || !amount || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const proposal = new TransactionProposal({
      groupAddress,
      groupName,
      proposerEmail: req.user.email,
      proposerAddress: req.user.smartAccountAddress,
      destination,
      amount,
      description,
      data,
      requiredSignatures: 2, // Default: 2 signatures required
      currentSignatures: 0
    });

    await proposal.save();

    console.log('✅ Proposal created:', proposal._id);
    res.json({ success: true, proposal });

  } catch (error) {
    console.error('❌ Create proposal error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get proposals for a group
router.get('/proposals/:groupAddress', verifyToken, async (req, res) => {
  try {
    const { groupAddress } = req.params;
    
    console.log('🔍 Getting proposals for group:', groupAddress);

    const proposals = await TransactionProposal.find({ groupAddress })
      .sort({ createdAt: -1 });

    console.log('✅ Found proposals:', proposals.length);
    res.json({ success: true, proposals });

  } catch (error) {
    console.error('❌ Get proposals error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get pending proposals that need user's signature
router.get('/proposals/pending/:userAddress', verifyToken, async (req, res) => {
  try {
    const { userAddress } = req.params;
    
    console.log('🔍 Getting pending proposals for user:', userAddress);

    // Find pending proposals where user hasn't signed yet
    const proposals = await TransactionProposal.find({
      status: 'pending',
      'signatures.signerAddress': { $ne: userAddress }
    }).sort({ createdAt: -1 });

    console.log('✅ Found pending proposals:', proposals.length);
    res.json({ success: true, proposals });

  } catch (error) {
    console.error('❌ Get pending proposals error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Sign a proposal
router.post('/proposals/:proposalId/sign', verifyToken, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const signerEmail = req.user.email;
    const signerAddress = req.user.smartAccountAddress;

    console.log('✍️ Signing proposal:', proposalId, 'by:', signerEmail);

    const proposal = await TransactionProposal.findById(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ error: 'Proposal is not pending' });
    }

    // Check if user already signed
    const hasAlreadySigned = proposal.signatures.some(
      sig => sig.signerAddress === signerAddress
    );

    if (hasAlreadySigned) {
      return res.status(400).json({ error: 'Already signed this proposal' });
    }

    // Add signature
    proposal.signatures.push({
      signerEmail,
      signerAddress,
      signedAt: new Date(),
      onChainConfirmed: false
    });

    proposal.currentSignatures = proposal.signatures.length;

    // Check if proposal is now approved
    if (proposal.currentSignatures >= proposal.requiredSignatures) {
      proposal.status = 'approved';
    }

    await proposal.save();

    console.log('✅ Proposal signed:', proposalId, 
      `(${proposal.currentSignatures}/${proposal.requiredSignatures})`);
    
    res.json({ 
      success: true, 
      proposal,
      message: `Proposal ${proposal.status === 'approved' ? 'approved' : 'signed'}!` 
    });

  } catch (error) {
    console.error('❌ Sign proposal error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Revoke signature
router.delete('/proposals/:proposalId/signatures/:userAddress', verifyToken, async (req, res) => {
  try {
    const { proposalId, userAddress } = req.params;

    console.log('🔄 Revoking signature:', proposalId, 'by:', userAddress);

    const proposal = await TransactionProposal.findById(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status === 'executed') {
      return res.status(400).json({ error: 'Cannot revoke signature from executed proposal' });
    }

    // Remove signature
    proposal.signatures = proposal.signatures.filter(
      sig => sig.signerAddress !== userAddress
    );

    proposal.currentSignatures = proposal.signatures.length;

    // Update status if no longer approved
    if (proposal.currentSignatures < proposal.requiredSignatures) {
      proposal.status = 'pending';
    }

    await proposal.save();

    console.log('✅ Signature revoked:', proposalId);
    res.json({ success: true, proposal });

  } catch (error) {
    console.error('❌ Revoke signature error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Execute proposal (usually by group creator)
router.post('/proposals/:proposalId/execute', verifyToken, async (req, res) => {
  try {
    const { proposalId } = req.params;
    const { txId } = req.body;

    console.log('🚀 Executing proposal:', proposalId, 'by:', req.user.email);

    const proposal = await TransactionProposal.findById(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    if (proposal.status !== 'approved') {
      return res.status(400).json({ error: 'Proposal not approved yet' });
    }

    // Update proposal as executed
    proposal.status = 'executed';
    proposal.executedAt = new Date();
    proposal.txId = txId;

    await proposal.save();

    console.log('✅ Proposal executed:', proposalId, 'tx:', txId);
    res.json({ success: true, proposal });

  } catch (error) {
    console.error('❌ Execute proposal error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get proposal by ID
router.get('/proposals/single/:proposalId', verifyToken, async (req, res) => {
  try {
    const { proposalId } = req.params;
    
    const proposal = await TransactionProposal.findById(proposalId);
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json({ success: true, proposal });

  } catch (error) {
    console.error('❌ Get proposal error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;