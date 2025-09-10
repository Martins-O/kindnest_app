'use client';

export interface MemberProfile {
  address: string;
  nickname: string;
  bio?: string;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  verified: boolean;
  reputation: {
    score: number; // 0-1000
    level: 'newcomer' | 'contributor' | 'trusted' | 'veteran' | 'legend';
    badges: MemberBadge[];
  };
  stats: {
    totalContributions: string; // ETH
    groupsJoined: number;
    expensesPaid: number;
    proposalsCreated: number;
    proposalsApproved: number;
    helpfulVotes: number;
  };
  preferences: {
    privacy: 'public' | 'members_only' | 'private';
    notifications: {
      email: boolean;
      push: boolean;
      groupActivity: boolean;
      mentions: boolean;
    };
    displayName: 'nickname' | 'address' | 'both';
  };
  socialLinks?: {
    twitter?: string;
    discord?: string;
    telegram?: string;
    website?: string;
  };
  groups: MemberGroupInfo[];
}

export interface MemberBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface MemberGroupInfo {
  groupAddress: string;
  groupName: string;
  role: 'member' | 'moderator' | 'creator';
  joinedAt: string;
  contributions: string; // ETH
  status: 'active' | 'inactive';
}

// Mock profile data for demonstration
const MOCK_PROFILES: MemberProfile[] = [
  {
    address: '0x742d35Cc6346C0532399fC4b35C2B1234567890a',
    nickname: 'Alice Cooper',
    bio: 'Community organizer passionate about mutual aid and collective support. Always ready to help!',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=alice`,
    joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    verified: true,
    reputation: {
      score: 850,
      level: 'veteran',
      badges: [
        {
          id: 'early_adopter',
          name: 'Early Adopter',
          description: 'One of the first 100 users',
          icon: '🌟',
          earnedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          rarity: 'rare'
        },
        {
          id: 'consistent_contributor',
          name: 'Consistent Contributor',
          description: '6 months of regular contributions',
          icon: '💎',
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          rarity: 'epic'
        },
        {
          id: 'community_helper',
          name: 'Community Helper',
          description: 'Helped 25+ members with questions',
          icon: '🤝',
          earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          rarity: 'uncommon'
        }
      ]
    },
    stats: {
      totalContributions: '2.5',
      groupsJoined: 4,
      expensesPaid: 12,
      proposalsCreated: 8,
      proposalsApproved: 25,
      helpfulVotes: 45
    },
    preferences: {
      privacy: 'public',
      notifications: {
        email: true,
        push: true,
        groupActivity: true,
        mentions: true
      },
      displayName: 'nickname'
    },
    socialLinks: {
      twitter: '@alice_web3',
      discord: 'alice#1234'
    },
    groups: [
      {
        groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
        groupName: 'Smith Family Medical Fund',
        role: 'creator',
        joinedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        contributions: '1.2',
        status: 'active'
      },
      {
        groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B9',
        groupName: 'Community Education Fund',
        role: 'moderator',
        joinedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        contributions: '0.8',
        status: 'active'
      }
    ]
  },
  {
    address: '0x742d35Cc6346C0532399fC4b35C2B1234567890b',
    nickname: 'Bob Miller',
    bio: 'Tech enthusiast and crypto believer. Building the future of finance, one block at a time.',
    joinedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    verified: false,
    reputation: {
      score: 420,
      level: 'contributor',
      badges: [
        {
          id: 'first_contribution',
          name: 'First Contribution',
          description: 'Made your first contribution',
          icon: '🎯',
          earnedAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
          rarity: 'common'
        },
        {
          id: 'generous_giver',
          name: 'Generous Giver',
          description: 'Contributed over 1 ETH total',
          icon: '💝',
          earnedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          rarity: 'uncommon'
        }
      ]
    },
    stats: {
      totalContributions: '1.3',
      groupsJoined: 2,
      expensesPaid: 6,
      proposalsCreated: 3,
      proposalsApproved: 8,
      helpfulVotes: 12
    },
    preferences: {
      privacy: 'members_only',
      notifications: {
        email: true,
        push: false,
        groupActivity: true,
        mentions: true
      },
      displayName: 'both'
    },
    groups: [
      {
        groupAddress: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
        groupName: 'Smith Family Medical Fund',
        role: 'member',
        joinedAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        contributions: '0.7',
        status: 'active'
      }
    ]
  }
];

export class MemberProfileManager {
  private profiles: Map<string, MemberProfile> = new Map();

  constructor() {
    // Initialize with mock data
    MOCK_PROFILES.forEach(profile => {
      this.profiles.set(profile.address.toLowerCase(), profile);
    });
  }

  // Get member profile
  async getMemberProfile(address: string): Promise<MemberProfile | null> {
    const profile = this.profiles.get(address.toLowerCase());
    if (profile) {
      return { ...profile };
    }

    // Create default profile for unknown members
    return {
      address,
      nickname: this.shortenAddress(address),
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      verified: false,
      reputation: {
        score: 0,
        level: 'newcomer',
        badges: []
      },
      stats: {
        totalContributions: '0',
        groupsJoined: 0,
        expensesPaid: 0,
        proposalsCreated: 0,
        proposalsApproved: 0,
        helpfulVotes: 0
      },
      preferences: {
        privacy: 'members_only',
        notifications: {
          email: false,
          push: false,
          groupActivity: true,
          mentions: true
        },
        displayName: 'nickname'
      },
      groups: []
    };
  }

  // Update member profile
  async updateMemberProfile(
    address: string, 
    updates: Partial<Pick<MemberProfile, 'nickname' | 'bio' | 'avatar' | 'preferences' | 'socialLinks'>>
  ): Promise<MemberProfile> {
    const existing = await this.getMemberProfile(address);
    if (!existing) throw new Error('Profile not found');

    const updated = {
      ...existing,
      ...updates,
      preferences: updates.preferences ? { ...existing.preferences, ...updates.preferences } : existing.preferences,
      socialLinks: updates.socialLinks ? { ...existing.socialLinks, ...updates.socialLinks } : existing.socialLinks
    };

    this.profiles.set(address.toLowerCase(), updated);
    return updated;
  }

  // Get multiple profiles
  async getMemberProfiles(addresses: string[]): Promise<MemberProfile[]> {
    const profiles = await Promise.all(
      addresses.map(addr => this.getMemberProfile(addr))
    );
    return profiles.filter(p => p !== null) as MemberProfile[];
  }

  // Search profiles
  async searchProfiles(query: string, limit: number = 20): Promise<MemberProfile[]> {
    const allProfiles = Array.from(this.profiles.values());
    const lowercaseQuery = query.toLowerCase();
    
    return allProfiles
      .filter(profile => 
        profile.nickname.toLowerCase().includes(lowercaseQuery) ||
        profile.bio?.toLowerCase().includes(lowercaseQuery) ||
        profile.address.toLowerCase().includes(lowercaseQuery)
      )
      .slice(0, limit);
  }

  // Get reputation level info
  getReputationInfo(score: number): {
    level: MemberProfile['reputation']['level'];
    nextLevel: MemberProfile['reputation']['level'] | null;
    progress: number;
    requirements: string;
  } {
    const levels: Array<{
      level: MemberProfile['reputation']['level'];
      min: number;
      max: number;
      requirements: string;
    }> = [
      { level: 'newcomer', min: 0, max: 99, requirements: 'Join your first group' },
      { level: 'contributor', min: 100, max: 299, requirements: 'Make regular contributions' },
      { level: 'trusted', min: 300, max: 599, requirements: 'Build community trust' },
      { level: 'veteran', min: 600, max: 899, requirements: 'Long-term commitment' },
      { level: 'legend', min: 900, max: 1000, requirements: 'Community leadership' }
    ];

    const currentLevel = levels.find(l => score >= l.min && score <= l.max)!;
    const nextLevelIndex = levels.findIndex(l => l.level === currentLevel.level) + 1;
    const nextLevel = nextLevelIndex < levels.length ? levels[nextLevelIndex] : null;
    
    const progress = nextLevel 
      ? ((score - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
      : 100;

    return {
      level: currentLevel.level,
      nextLevel: nextLevel?.level || null,
      progress: Math.min(progress, 100),
      requirements: nextLevel?.requirements || 'Maximum level achieved'
    };
  }

  // Award badge
  async awardBadge(address: string, badge: Omit<MemberBadge, 'earnedAt'>): Promise<void> {
    const profile = await this.getMemberProfile(address);
    if (!profile) return;

    // Check if badge already exists
    if (profile.reputation.badges.some(b => b.id === badge.id)) return;

    const newBadge: MemberBadge = {
      ...badge,
      earnedAt: new Date().toISOString()
    };

    profile.reputation.badges.push(newBadge);
    
    // Award reputation points based on rarity
    const points = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      legendary: 200
    }[badge.rarity] || 10;

    profile.reputation.score = Math.min(1000, profile.reputation.score + points);
    profile.reputation.level = this.getReputationInfo(profile.reputation.score).level;

    this.profiles.set(address.toLowerCase(), profile);
  }

  // Update member activity
  async updateLastActive(address: string): Promise<void> {
    const profile = await this.getMemberProfile(address);
    if (profile) {
      profile.lastActive = new Date().toISOString();
      this.profiles.set(address.toLowerCase(), profile);
    }
  }

  // Add member to group
  async addMemberToGroup(
    memberAddress: string, 
    groupInfo: Omit<MemberGroupInfo, 'joinedAt'>
  ): Promise<void> {
    const profile = await this.getMemberProfile(memberAddress);
    if (!profile) return;

    // Check if already in group
    if (profile.groups.some(g => g.groupAddress.toLowerCase() === groupInfo.groupAddress.toLowerCase())) {
      return;
    }

    profile.groups.push({
      ...groupInfo,
      joinedAt: new Date().toISOString()
    });

    profile.stats.groupsJoined = profile.groups.length;
    this.profiles.set(memberAddress.toLowerCase(), profile);
  }

  private shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}

export const memberProfileManager = new MemberProfileManager();

// Utility functions
export const getBadgeRarityColor = (rarity: MemberBadge['rarity']): string => {
  switch (rarity) {
    case 'common': return 'text-gray-400 bg-gray-500/20';
    case 'uncommon': return 'text-green-400 bg-green-500/20';
    case 'rare': return 'text-blue-400 bg-blue-500/20';
    case 'epic': return 'text-purple-400 bg-purple-500/20';
    case 'legendary': return 'text-yellow-400 bg-yellow-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

export const getReputationLevelColor = (level: MemberProfile['reputation']['level']): string => {
  switch (level) {
    case 'newcomer': return 'text-gray-400';
    case 'contributor': return 'text-green-400';
    case 'trusted': return 'text-blue-400';
    case 'veteran': return 'text-purple-400';
    case 'legend': return 'text-yellow-400';
    default: return 'text-gray-400';
  }
};

export const formatJoinDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) return 'Today';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};