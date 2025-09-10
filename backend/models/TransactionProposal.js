const mongoose = require('mongoose');

const proposalSignatureSchema = new mongoose.Schema({
  signerEmail: {
    type: String,
    required: true
  },
  signerAddress: {
    type: String,
    required: true
  },
  signedAt: {
    type: Date,
    default: Date.now
  },
  onChainConfirmed: {
    type: Boolean,
    default: false
  }
});

const transactionProposalSchema = new mongoose.Schema({
  groupAddress: {
    type: String,
    required: true,
    index: true
  },
  groupName: {
    type: String,
    required: true
  },
  proposerEmail: {
    type: String,
    required: true
  },
  proposerAddress: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  amount: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  data: {
    type: String,
    default: '0x'
  },
  txId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'executed', 'rejected'],
    default: 'pending'
  },
  requiredSignatures: {
    type: Number,
    default: 2
  },
  currentSignatures: {
    type: Number,
    default: 0
  },
  signatures: [proposalSignatureSchema],
  executedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionProposalSchema.index({ groupAddress: 1, status: 1 });
transactionProposalSchema.index({ 'signatures.signerAddress': 1 });

const TransactionProposal = mongoose.model('TransactionProposal', transactionProposalSchema);

module.exports = TransactionProposal;