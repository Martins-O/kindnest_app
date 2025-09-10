const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Group = require('../models/Group');

// Get activities for a specific group
router.get('/group/:address', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type = null,
      since = null,
      userAddress = null
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Determine privacy level based on user membership
    let allowedPrivacy = ['public'];
    
    if (userAddress) {
      // Check if user is a member of the group
      const group = await Group.findOne({ 
        contractAddress: req.params.address,
        'members.address': userAddress 
      });
      
      if (group) {
        allowedPrivacy = ['public', 'members_only'];
        
        // If user is admin, they can see private activities too
        const member = group.members.find(m => m.address === userAddress);
        if (member && member.role === 'admin') {
          allowedPrivacy = ['public', 'members_only', 'private'];
        }
      }
    }
    
    const options = {
      limit: parseInt(limit),
      skip,
      privacy: allowedPrivacy.length === 1 ? allowedPrivacy[0] : { $in: allowedPrivacy }
    };
    
    if (type) {
      options.type = type.includes(',') ? type.split(',') : type;
    }
    
    if (since) {
      options.since = new Date(since);
    }
    
    const activities = await Activity.getGroupActivities(req.params.address, {
      limit: parseInt(limit),
      skip,
      type: options.type,
      since: options.since
    }).find({
      privacy: options.privacy
    });
    
    const total = await Activity.countDocuments({
      groupAddress: req.params.address,
      privacy: options.privacy,
      ...(options.type && { type: Array.isArray(options.type) ? { $in: options.type } : options.type }),
      ...(options.since && { timestamp: { $gte: options.since } })
    });
    
    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching group activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get activities for a specific user
router.get('/user/:address', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      type = null,
      since = null
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    const options = {
      limit: parseInt(limit),
      skip
    };
    
    if (type) {
      options.type = type.includes(',') ? type.split(',') : type;
    }
    
    if (since) {
      options.since = new Date(since);
    }
    
    const activities = await Activity.getUserActivities(req.params.address, options);
    
    const total = await Activity.countDocuments({
      $or: [
        { 'actor.address': req.params.address },
        { 'target.address': req.params.address }
      ],
      ...(options.type && { type: Array.isArray(options.type) ? { $in: options.type } : options.type }),
      ...(options.since && { timestamp: { $gte: options.since } })
    });
    
    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Create a new activity
router.post('/', async (req, res) => {
  try {
    const activityData = req.body;
    
    // Generate activity ID if not provided
    if (!activityData.id) {
      activityData.id = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
    
    const activity = new Activity(activityData);
    await activity.save();
    
    // Update group activity score
    if (activityData.groupAddress) {
      const group = await Group.findOne({ contractAddress: activityData.groupAddress });
      if (group) {
        await group.updateActivityScore(1);
      }
    }
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Add reaction to activity
router.post('/:activityId/reactions', async (req, res) => {
  try {
    const { userAddress, reactionType = 'like' } = req.body;
    
    const activity = await Activity.findOne({ id: req.params.activityId });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    await activity.addReaction(userAddress, reactionType);
    
    res.json(activity);
  } catch (error) {
    console.error('Error adding reaction:', error);
    res.status(500).json({ error: 'Failed to add reaction' });
  }
});

// Add comment to activity
router.post('/:activityId/comments', async (req, res) => {
  try {
    const { userAddress, username, text } = req.body;
    
    const activity = await Activity.findOne({ id: req.params.activityId });
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    await activity.addComment(userAddress, username, text);
    
    res.json(activity);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get activity statistics for a group
router.get('/group/:address/stats', async (req, res) => {
  try {
    const { since = null } = req.query;
    
    const match = { groupAddress: req.params.address };
    if (since) {
      match.timestamp = { $gte: new Date(since) };
    }
    
    const stats = await Activity.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: '$count' },
          activityBreakdown: {
            $push: {
              type: '$_id',
              count: '$count',
              lastActivity: '$lastActivity'
            }
          },
          lastActivity: { $max: '$lastActivity' }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        totalActivities: 0,
        activityBreakdown: [],
        lastActivity: null
      });
    }
    
    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
});

// Bulk create activities (for blockchain event syncing)
router.post('/bulk', async (req, res) => {
  try {
    const { activities } = req.body;
    
    if (!Array.isArray(activities) || activities.length === 0) {
      return res.status(400).json({ error: 'Activities array is required' });
    }
    
    // Add IDs to activities that don't have them
    const activitiesWithIds = activities.map(activity => ({
      ...activity,
      id: activity.id || `activity_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }));
    
    const createdActivities = await Activity.insertMany(activitiesWithIds, { 
      ordered: false,
      ignoreDuplicates: true 
    });
    
    // Update activity scores for affected groups
    const groupAddresses = [...new Set(activities.map(a => a.groupAddress))];
    await Promise.all(
      groupAddresses.map(async (address) => {
        const group = await Group.findOne({ contractAddress: address });
        if (group) {
          const groupActivityCount = activities.filter(a => a.groupAddress === address).length;
          await group.updateActivityScore(groupActivityCount);
        }
      })
    );
    
    res.status(201).json({
      created: createdActivities.length,
      activities: createdActivities
    });
  } catch (error) {
    console.error('Error creating bulk activities:', error);
    res.status(500).json({ error: 'Failed to create activities' });
  }
});

module.exports = router;