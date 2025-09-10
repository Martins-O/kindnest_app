const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  // Basic Group Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    maxLength: 500
  },
  contractAddress: {
    type: String,
    required: true,
    unique: true
  },
  
  // Group Creator/Admin
  creator: {
    address: { type: String, required: true },
    email: { type: String },
    nickname: { type: String, required: true }
  },
  
  // Template Information
  template: {
    id: { type: String },
    name: { type: String },
    category: { 
      type: String, 
      enum: ['healthcare', 'education', 'emergency', 'lifestyle', 'financial', 'custom'],
      default: 'custom'
    }
  },
  
  // Group Settings
  settings: {
    privacy: {
      type: String,
      enum: ['public', 'private', 'invite-only'],
      default: 'public'
    },
    maxMembers: {
      type: Number,
      default: 50,
      min: 2,
      max: 1000
    },
    contributionFrequency: {
      type: String,
      enum: ['weekly', 'monthly', 'as-needed', 'one-time'],
      default: 'as-needed'
    },
    minimumContribution: {
      type: String, // ETH amount as string
      default: '0.001'
    },
    autoApproveMembers: {
      type: Boolean,
      default: false
    }
  },
  
  // Group Status
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  
  // Financial Information
  financial: {
    totalBalance: { type: String, default: '0' }, // ETH as string
    totalContributions: { type: String, default: '0' },
    totalExpenses: { type: String, default: '0' },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  // Member Management
  members: [{
    address: { type: String, required: true },
    nickname: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
    role: { 
      type: String, 
      enum: ['member', 'admin', 'viewer'],
      default: 'member' 
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active'
    }
  }],
  
  // Group Guidelines and Rules
  guidelines: [{
    type: String,
    maxLength: 200
  }],
  
  // Tags for categorization and search
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  
  // Location/Region (optional)
  location: {
    country: String,
    region: String,
    city: String
  },
  
  // Social Features
  social: {
    isPubliclyDiscoverable: { type: Boolean, default: true },
    allowMemberInvites: { type: Boolean, default: true },
    showMemberList: { type: Boolean, default: true },
    showActivityFeed: { type: Boolean, default: true }
  },
  
  // Statistics
  stats: {
    memberCount: { type: Number, default: 0 },
    totalTransactions: { type: Number, default: 0 },
    activityScore: { type: Number, default: 0 }, // For ranking/sorting
    lastActivityAt: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
groupSchema.index({ contractAddress: 1 });
groupSchema.index({ 'creator.address': 1 });
groupSchema.index({ 'template.category': 1 });
groupSchema.index({ 'settings.privacy': 1 });
groupSchema.index({ 'stats.activityScore': -1 });
groupSchema.index({ 'social.isPubliclyDiscoverable': 1 });
groupSchema.index({ tags: 1 });
groupSchema.index({ createdAt: -1 });

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Methods
groupSchema.methods.addMember = function(memberData) {
  this.members.push(memberData);
  this.stats.memberCount = this.members.length;
  this.stats.lastActivityAt = new Date();
  return this.save();
};

groupSchema.methods.removeMember = function(memberAddress) {
  this.members = this.members.filter(member => member.address !== memberAddress);
  this.stats.memberCount = this.members.length;
  this.stats.lastActivityAt = new Date();
  return this.save();
};

groupSchema.methods.updateActivityScore = function(increment = 1) {
  this.stats.activityScore += increment;
  this.stats.lastActivityAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Group', groupSchema);