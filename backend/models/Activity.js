const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Basic Activity Information
  id: {
    type: String,
    required: true,
    unique: true
  },
  
  // Activity Type
  type: {
    type: String,
    required: true,
    enum: [
      'member_joined',
      'member_left', 
      'expense_added',
      'expense_approved',
      'expense_paid',
      'proposal_created',
      'proposal_approved',
      'proposal_rejected',
      'contribution_made',
      'funds_withdrawn',
      'group_created',
      'group_updated',
      'member_role_changed',
      'achievement_earned',
      'milestone_reached'
    ]
  },
  
  // Group Association
  groupAddress: {
    type: String,
    required: true,
    index: true
  },
  groupName: {
    type: String,
    required: true
  },
  
  // Actor (person who performed the action)
  actor: {
    address: { type: String, required: true },
    nickname: { type: String, required: true },
    email: String
  },
  
  // Target (person/thing being acted upon, if applicable)
  target: {
    address: String,
    nickname: String,
    name: String // For non-person targets like expense names
  },
  
  // Activity Metadata
  metadata: {
    // Financial information
    amount: String, // ETH amount as string
    currency: { type: String, default: 'ETH' },
    
    // Description/Details
    description: String,
    title: String,
    
    // Transaction information
    txHash: String,
    blockNumber: Number,
    
    // Proposal/Vote information
    proposalId: String,
    voteCount: Number,
    requiredVotes: Number,
    
    // Member information
    previousRole: String,
    newRole: String,
    
    // Achievement information
    achievementType: String,
    achievementLevel: String,
    
    // Additional context
    category: String,
    tags: [String],
    attachments: [String] // URLs or file references
  },
  
  // Privacy and Visibility
  privacy: {
    type: String,
    enum: ['public', 'members_only', 'private'],
    default: 'members_only'
  },
  
  // Activity Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Interaction tracking
  interactions: {
    views: { type: Number, default: 0 },
    reactions: [{
      user: String, // user address
      type: { 
        type: String, 
        enum: ['like', 'celebrate', 'support', 'concern'],
        default: 'like'
      },
      timestamp: { type: Date, default: Date.now }
    }],
    comments: [{
      user: String, // user address
      username: String,
      text: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  
  // Technical fields
  source: {
    type: String,
    enum: ['blockchain', 'api', 'manual', 'system'],
    default: 'blockchain'
  },
  version: {
    type: String,
    default: '1.0'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activitySchema.index({ groupAddress: 1, timestamp: -1 });
activitySchema.index({ 'actor.address': 1, timestamp: -1 });
activitySchema.index({ type: 1, timestamp: -1 });
activitySchema.index({ privacy: 1 });
activitySchema.index({ status: 1 });
activitySchema.index({ timestamp: -1 });
activitySchema.index({ id: 1 }, { unique: true });

// Compound indexes for common queries
activitySchema.index({ groupAddress: 1, type: 1, timestamp: -1 });
activitySchema.index({ groupAddress: 1, privacy: 1, timestamp: -1 });
activitySchema.index({ 'actor.address': 1, type: 1, timestamp: -1 });

// Static methods for common queries
activitySchema.statics.getGroupActivities = function(groupAddress, options = {}) {
  const {
    limit = 50,
    skip = 0,
    type = null,
    privacy = 'members_only',
    since = null
  } = options;
  
  const query = { 
    groupAddress,
    privacy: { $in: ['public', privacy] }
  };
  
  if (type) {
    if (Array.isArray(type)) {
      query.type = { $in: type };
    } else {
      query.type = type;
    }
  }
  
  if (since) {
    query.timestamp = { $gte: since };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

activitySchema.statics.getUserActivities = function(userAddress, options = {}) {
  const {
    limit = 50,
    skip = 0,
    type = null,
    since = null
  } = options;
  
  const query = { 
    $or: [
      { 'actor.address': userAddress },
      { 'target.address': userAddress }
    ]
  };
  
  if (type) {
    query.type = Array.isArray(type) ? { $in: type } : type;
  }
  
  if (since) {
    query.timestamp = { $gte: since };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip);
};

// Methods
activitySchema.methods.addReaction = function(userAddress, reactionType = 'like') {
  // Remove existing reaction from this user
  this.interactions.reactions = this.interactions.reactions.filter(
    r => r.user !== userAddress
  );
  
  // Add new reaction
  this.interactions.reactions.push({
    user: userAddress,
    type: reactionType,
    timestamp: new Date()
  });
  
  return this.save();
};

activitySchema.methods.addComment = function(userAddress, username, text) {
  this.interactions.comments.push({
    user: userAddress,
    username,
    text,
    timestamp: new Date()
  });
  
  return this.save();
};

activitySchema.methods.incrementViews = function() {
  this.interactions.views += 1;
  return this.save();
};

module.exports = mongoose.model('Activity', activitySchema);