const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Activity = require('../models/Activity');

// Get all public groups (for discovery)
router.get('/discover', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = null,
      search = null,
      sortBy = 'activity_desc'
    } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {
      'settings.privacy': 'public',
      'social.isPubliclyDiscoverable': true,
      status: 'active'
    };
    
    if (category && category !== 'all') {
      query['template.category'] = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [search.toLowerCase()] } }
      ];
    }
    
    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'activity_desc':
        sort = { 'stats.activityScore': -1, 'stats.lastActivityAt': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'members_desc':
        sort = { 'stats.memberCount': -1 };
        break;
      case 'name_asc':
        sort = { name: 1 };
        break;
      default:
        sort = { 'stats.activityScore': -1 };
    }
    
    const groups = await Group.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-members -guidelines') // Don't return sensitive member data
      .lean();
    
    const total = await Group.countDocuments(query);
    
    res.json({
      groups,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get group by contract address
router.get('/:address', async (req, res) => {
  try {
    const group = await Group.findOne({ contractAddress: req.params.address });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  try {
    const groupData = req.body;
    
    // Generate initial activity for group creation
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Create the group
    const group = new Group({
      ...groupData,
      stats: {
        memberCount: 1,
        totalTransactions: 0,
        activityScore: 1,
        lastActivityAt: new Date()
      }
    });
    
    await group.save();
    
    // Create group creation activity
    const activity = new Activity({
      id: activityId,
      type: 'group_created',
      groupAddress: group.contractAddress,
      groupName: group.name,
      actor: {
        address: group.creator.address,
        nickname: group.creator.nickname,
        email: group.creator.email
      },
      metadata: {
        description: `Created the ${group.name} group`,
        category: group.template.category || 'custom',
        tags: group.tags
      },
      privacy: 'public',
      source: 'api'
    });
    
    await activity.save();
    
    res.status(201).json({ group, activity });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update group information
router.put('/:address', async (req, res) => {
  try {
    const updates = req.body;
    const group = await Group.findOneAndUpdate(
      { contractAddress: req.params.address },
      { ...updates, 'stats.lastActivityAt': new Date() },
      { new: true, runValidators: true }
    );
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Add member to group
router.post('/:address/members', async (req, res) => {
  try {
    const { memberAddress, nickname, role = 'member' } = req.body;
    
    const group = await Group.findOne({ contractAddress: req.params.address });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if member already exists
    const existingMember = group.members.find(m => m.address === memberAddress);
    if (existingMember) {
      return res.status(400).json({ error: 'Member already exists' });
    }
    
    // Add member
    const memberData = {
      address: memberAddress,
      nickname,
      role,
      joinedAt: new Date(),
      status: 'active'
    };
    
    await group.addMember(memberData);
    
    // Create member joined activity
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const activity = new Activity({
      id: activityId,
      type: 'member_joined',
      groupAddress: group.contractAddress,
      groupName: group.name,
      actor: {
        address: memberAddress,
        nickname: nickname
      },
      metadata: {
        description: `${nickname} joined the group`,
        previousMemberCount: group.stats.memberCount - 1,
        newMemberCount: group.stats.memberCount
      },
      privacy: 'members_only',
      source: 'api'
    });
    
    await activity.save();
    await group.updateActivityScore(2); // Member joins are worth 2 points
    
    res.status(201).json({ group, activity });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Get group members
router.get('/:address/members', async (req, res) => {
  try {
    const group = await Group.findOne({ contractAddress: req.params.address });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group.members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

module.exports = router;