'use client';

export interface ActivityItem {
  id: string;
  type: 'member_joined' | 'member_left' | 'expense_added' | 'expense_settled' | 'proposal_created' | 'proposal_approved' | 'proposal_executed' | 'contribution_made' | 'achievement_earned' | 'milestone_reached';
  timestamp: string;
  actor: {
    address: string;
    nickname: string;
    avatar?: string;
  };
  target?: {
    address?: string;
    nickname?: string;
    id?: string;
    name?: string;
  };
  metadata: {
    amount?: string;
    description?: string;
    expenseId?: string;
    proposalId?: string;
    category?: string;
    achievement?: string;
    milestone?: string;
  };
  groupAddress: string;
  txHash?: string;
  privacy: 'public' | 'members_only' | 'private';
}

export interface ActivityFeedOptions {
  groupAddress?: string;
  userAddress?: string;
  limit?: number;
  offset?: number;
  types?: ActivityItem['type'][];
  privacy?: ActivityItem['privacy'][];
}

// Mock activity data for demonstration
const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'activity_1',
    type: 'member_joined',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    actor: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890a',
      nickname: 'Alice Cooper',
    },
    metadata: {},
    groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
    privacy: 'members_only'
  },
  {
    id: 'activity_2',
    type: 'expense_added',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    actor: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890b',
      nickname: 'Bob Miller',
    },
    metadata: {
      amount: '0.05',
      description: 'Group lunch at The Garden Cafe',
      expenseId: 'expense_123',
      category: 'Food & Dining'
    },
    groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    privacy: 'members_only'
  },
  {
    id: 'activity_3',
    type: 'contribution_made',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    actor: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890c',
      nickname: 'Charlie Brown',
    },
    metadata: {
      amount: '0.1',
      description: 'Monthly contribution to medical fund'
    },
    groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
    txHash: '0xdef1234567890abcdef1234567890abcdef123456',
    privacy: 'members_only'
  },
  {
    id: 'activity_4',
    type: 'proposal_created',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    actor: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890d',
      nickname: 'Diana Ross',
    },
    target: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890e',
      nickname: 'Emergency Contact'
    },
    metadata: {
      amount: '0.2',
      description: 'Emergency medical assistance for member',
      proposalId: 'proposal_456'
    },
    groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
    privacy: 'members_only'
  },
  {
    id: 'activity_5',
    type: 'milestone_reached',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actor: {
      address: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
      nickname: 'Smith Family Medical Fund',
    },
    metadata: {
      milestone: 'Reached 1 ETH total contributions',
      amount: '1.0'
    },
    groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
    privacy: 'public'
  },
  {
    id: 'activity_6',
    type: 'achievement_earned',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    actor: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890f',
      nickname: 'Frank Ocean',
    },
    metadata: {
      achievement: 'Consistent Contributor',
      description: '6 months of regular contributions'
    },
    groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
    privacy: 'public'
  }
];

export class ActivityFeedManager {
  private activities: ActivityItem[] = [...MOCK_ACTIVITIES];

  // Get activities with filtering options
  async getActivities(options: ActivityFeedOptions = {}): Promise<ActivityItem[]> {
    let filteredActivities = [...this.activities];

    // Filter by group
    if (options.groupAddress) {
      filteredActivities = filteredActivities.filter(
        activity => activity.groupAddress.toLowerCase() === options.groupAddress!.toLowerCase()
      );
    }

    // Filter by user
    if (options.userAddress) {
      filteredActivities = filteredActivities.filter(
        activity => activity.actor.address.toLowerCase() === options.userAddress!.toLowerCase()
      );
    }

    // Filter by activity types
    if (options.types && options.types.length > 0) {
      filteredActivities = filteredActivities.filter(
        activity => options.types!.includes(activity.type)
      );
    }

    // Filter by privacy levels
    if (options.privacy && options.privacy.length > 0) {
      filteredActivities = filteredActivities.filter(
        activity => options.privacy!.includes(activity.privacy)
      );
    }

    // Sort by timestamp (newest first)
    filteredActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    
    return filteredActivities.slice(offset, offset + limit);
  }

  // Add new activity
  async addActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
    const newActivity: ActivityItem = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.activities.unshift(newActivity);
    
    // Keep only the last 1000 activities to prevent memory issues
    if (this.activities.length > 1000) {
      this.activities = this.activities.slice(0, 1000);
    }

    return newActivity;
  }

  // Get activity statistics
  async getActivityStats(groupAddress: string): Promise<{
    totalActivities: number;
    recentActivities: number; // last 24 hours
    topContributors: Array<{ address: string; nickname: string; count: number }>;
    activityByType: Record<ActivityItem['type'], number>;
  }> {
    const groupActivities = await this.getActivities({ groupAddress });
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentActivities = groupActivities.filter(
      activity => new Date(activity.timestamp) > last24Hours
    ).length;

    // Count activities by contributor
    const contributorCounts = new Map<string, { nickname: string; count: number }>();
    groupActivities.forEach(activity => {
      const key = activity.actor.address;
      const existing = contributorCounts.get(key) || { nickname: activity.actor.nickname, count: 0 };
      contributorCounts.set(key, { ...existing, count: existing.count + 1 });
    });

    const topContributors = Array.from(contributorCounts.entries())
      .map(([address, data]) => ({ address, nickname: data.nickname, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Count activities by type
    const activityByType: Record<ActivityItem['type'], number> = {
      member_joined: 0,
      member_left: 0,
      expense_added: 0,
      expense_settled: 0,
      proposal_created: 0,
      proposal_approved: 0,
      proposal_executed: 0,
      contribution_made: 0,
      achievement_earned: 0,
      milestone_reached: 0
    };

    groupActivities.forEach(activity => {
      activityByType[activity.type]++;
    });

    return {
      totalActivities: groupActivities.length,
      recentActivities,
      topContributors,
      activityByType
    };
  }

  // Generate activity for common actions
  async recordMemberJoined(groupAddress: string, memberAddress: string, nickname: string) {
    return this.addActivity({
      type: 'member_joined',
      actor: { address: memberAddress, nickname },
      metadata: {},
      groupAddress,
      privacy: 'members_only'
    });
  }

  async recordExpenseAdded(
    groupAddress: string, 
    actorAddress: string, 
    actorNickname: string, 
    expenseId: string,
    amount: string,
    description: string,
    txHash?: string
  ) {
    return this.addActivity({
      type: 'expense_added',
      actor: { address: actorAddress, nickname: actorNickname },
      metadata: { amount, description, expenseId },
      groupAddress,
      txHash,
      privacy: 'members_only'
    });
  }

  async recordContribution(
    groupAddress: string,
    contributorAddress: string,
    contributorNickname: string,
    amount: string,
    txHash?: string
  ) {
    return this.addActivity({
      type: 'contribution_made',
      actor: { address: contributorAddress, nickname: contributorNickname },
      metadata: { amount, description: 'Contribution to group treasury' },
      groupAddress,
      txHash,
      privacy: 'members_only'
    });
  }

  async recordProposalCreated(
    groupAddress: string,
    proposerAddress: string,
    proposerNickname: string,
    proposalId: string,
    amount: string,
    description: string
  ) {
    return this.addActivity({
      type: 'proposal_created',
      actor: { address: proposerAddress, nickname: proposerNickname },
      metadata: { amount, description, proposalId },
      groupAddress,
      privacy: 'members_only'
    });
  }
}

export const activityFeedManager = new ActivityFeedManager();

// Utility functions for activity display
export const getActivityIcon = (type: ActivityItem['type']): string => {
  switch (type) {
    case 'member_joined': return '👋';
    case 'member_left': return '👋';
    case 'expense_added': return '💰';
    case 'expense_settled': return '✅';
    case 'proposal_created': return '📝';
    case 'proposal_approved': return '👍';
    case 'proposal_executed': return '🚀';
    case 'contribution_made': return '💎';
    case 'achievement_earned': return '🏆';
    case 'milestone_reached': return '🎯';
    default: return '📌';
  }
};

export const formatActivityMessage = (activity: ActivityItem): string => {
  const { actor, type, metadata, target } = activity;
  
  switch (type) {
    case 'member_joined':
      return `${actor.nickname} joined the group`;
    case 'member_left':
      return `${actor.nickname} left the group`;
    case 'expense_added':
      return `${actor.nickname} added expense: ${metadata.description} (${metadata.amount} ETH)`;
    case 'expense_settled':
      return `${actor.nickname} settled expense: ${metadata.description}`;
    case 'proposal_created':
      return `${actor.nickname} created proposal: ${metadata.description} (${metadata.amount} ETH)`;
    case 'proposal_approved':
      return `${actor.nickname} approved proposal: ${metadata.description}`;
    case 'proposal_executed':
      return `Proposal executed: ${metadata.description}`;
    case 'contribution_made':
      return `${actor.nickname} contributed ${metadata.amount} ETH`;
    case 'achievement_earned':
      return `${actor.nickname} earned achievement: ${metadata.achievement}`;
    case 'milestone_reached':
      return `Group milestone: ${metadata.milestone}`;
    default:
      return `${actor.nickname} performed an action`;
  }
};

export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return time.toLocaleDateString();
};