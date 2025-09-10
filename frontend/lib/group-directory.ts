'use client';

import { GROUP_TEMPLATES, type GroupTemplate } from './group-templates';

export interface PublicGroupInfo {
  address: string;
  name: string;
  description: string;
  template?: GroupTemplate;
  creator: {
    address: string;
    nickname: string;
    verified: boolean;
  };
  stats: {
    memberCount: number;
    totalContributions: string; // ETH
    totalExpenses: string; // ETH
    createdAt: string;
    lastActivity: string;
  };
  privacy: 'public' | 'unlisted' | 'private';
  category: 'healthcare' | 'education' | 'emergency' | 'lifestyle' | 'financial' | 'other';
  tags: string[];
  joinRequests?: 'open' | 'approval_required' | 'invite_only';
  featured?: boolean;
  verified?: boolean;
  region?: string;
  language?: string;
}

export interface GroupSearchFilters {
  category?: string;
  region?: string;
  language?: string;
  minMembers?: number;
  maxMembers?: number;
  tags?: string[];
  featured?: boolean;
  verified?: boolean;
  privacy?: PublicGroupInfo['privacy'][];
}

export interface GroupSearchOptions {
  query?: string;
  filters?: GroupSearchFilters;
  sortBy?: 'relevance' | 'created_desc' | 'created_asc' | 'members_desc' | 'members_asc' | 'activity_desc';
  limit?: number;
  offset?: number;
}

// Mock directory data for demonstration
const MOCK_GROUPS: PublicGroupInfo[] = [
  {
    address: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B8',
    name: 'Smith Family Medical Fund',
    description: 'A family-based medical emergency fund to help with unexpected healthcare costs and treatments.',
    template: GROUP_TEMPLATES.find(t => t.id === 'medical-emergency'),
    creator: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890a',
      nickname: 'Alice Cooper',
      verified: true
    },
    stats: {
      memberCount: 8,
      totalContributions: '2.5',
      totalExpenses: '1.2',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    privacy: 'public',
    category: 'healthcare',
    tags: ['family', 'medical', 'emergency', 'trusted'],
    joinRequests: 'approval_required',
    featured: true,
    verified: true,
    region: 'North America',
    language: 'English'
  },
  {
    address: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5B9',
    name: 'Tech Community Education Fund',
    description: 'Supporting continuous learning and professional development in the tech community.',
    template: GROUP_TEMPLATES.find(t => t.id === 'education-fund'),
    creator: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890b',
      nickname: 'Bob Miller',
      verified: false
    },
    stats: {
      memberCount: 25,
      totalContributions: '5.8',
      totalExpenses: '3.2',
      createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    privacy: 'public',
    category: 'education',
    tags: ['tech', 'learning', 'professional', 'community'],
    joinRequests: 'open',
    featured: false,
    verified: false,
    region: 'Global',
    language: 'English'
  },
  {
    address: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5C1',
    name: 'Downtown Emergency Response',
    description: 'Community emergency fund for natural disasters and crisis situations in the downtown area.',
    template: GROUP_TEMPLATES.find(t => t.id === 'emergency-response'),
    creator: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890c',
      nickname: 'Charlie Brown',
      verified: true
    },
    stats: {
      memberCount: 42,
      totalContributions: '12.3',
      totalExpenses: '8.7',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    privacy: 'public',
    category: 'emergency',
    tags: ['community', 'emergency', 'local', 'disaster-relief'],
    joinRequests: 'approval_required',
    featured: true,
    verified: true,
    region: 'North America',
    language: 'English'
  },
  {
    address: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5C2',
    name: 'Friends Travel Adventures',
    description: 'A group of friends saving together for amazing travel experiences and adventures.',
    template: GROUP_TEMPLATES.find(t => t.id === 'travel-fund'),
    creator: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890d',
      nickname: 'Diana Ross',
      verified: false
    },
    stats: {
      memberCount: 6,
      totalContributions: '1.8',
      totalExpenses: '0.9',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    privacy: 'unlisted',
    category: 'lifestyle',
    tags: ['friends', 'travel', 'adventure', 'savings'],
    joinRequests: 'invite_only',
    featured: false,
    verified: false,
    region: 'Europe',
    language: 'English'
  },
  {
    address: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5C3',
    name: 'First-Time Homebuyers Circle',
    description: 'Supporting each other on the journey to homeownership with shared savings and resources.',
    template: GROUP_TEMPLATES.find(t => t.id === 'home-fund'),
    creator: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890e',
      nickname: 'Eva Green',
      verified: true
    },
    stats: {
      memberCount: 15,
      totalContributions: '8.9',
      totalExpenses: '2.1',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    privacy: 'public',
    category: 'financial',
    tags: ['homebuying', 'savings', 'real-estate', 'milestone'],
    joinRequests: 'approval_required',
    featured: false,
    verified: false,
    region: 'North America',
    language: 'English'
  },
  {
    address: '0x96D3a232D2A97A94D01eEA63F9f7254974DeD5C4',
    name: 'Local Dental Care Co-op',
    description: 'Community-driven dental care fund providing affordable dental treatments for all members.',
    template: GROUP_TEMPLATES.find(t => t.id === 'dental-care'),
    creator: {
      address: '0x742d35Cc6346C0532399fC4b35C2B1234567890f',
      nickname: 'Frank Ocean',
      verified: false
    },
    stats: {
      memberCount: 18,
      totalContributions: '3.2',
      totalExpenses: '2.8',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    },
    privacy: 'public',
    category: 'healthcare',
    tags: ['dental', 'local', 'healthcare', 'cooperative'],
    joinRequests: 'open',
    featured: false,
    verified: false,
    region: 'North America',
    language: 'English'
  }
];

export class GroupDirectoryManager {
  private groups: PublicGroupInfo[] = [...MOCK_GROUPS];

  // Search and filter groups
  async searchGroups(options: GroupSearchOptions = {}): Promise<{
    groups: PublicGroupInfo[];
    total: number;
    hasMore: boolean;
  }> {
    let filteredGroups = [...this.groups];

    // Apply privacy filter - exclude private groups from public search
    filteredGroups = filteredGroups.filter(group => group.privacy !== 'private');

    // Apply text search
    if (options.query) {
      const query = options.query.toLowerCase();
      filteredGroups = filteredGroups.filter(group =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.tags.some(tag => tag.toLowerCase().includes(query)) ||
        group.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (options.filters) {
      const { filters } = options;

      if (filters.category) {
        filteredGroups = filteredGroups.filter(group => group.category === filters.category);
      }

      if (filters.region) {
        filteredGroups = filteredGroups.filter(group => group.region === filters.region);
      }

      if (filters.language) {
        filteredGroups = filteredGroups.filter(group => group.language === filters.language);
      }

      if (filters.minMembers !== undefined) {
        filteredGroups = filteredGroups.filter(group => group.stats.memberCount >= filters.minMembers!);
      }

      if (filters.maxMembers !== undefined) {
        filteredGroups = filteredGroups.filter(group => group.stats.memberCount <= filters.maxMembers!);
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredGroups = filteredGroups.filter(group =>
          filters.tags!.some(tag => group.tags.includes(tag))
        );
      }

      if (filters.featured !== undefined) {
        filteredGroups = filteredGroups.filter(group => group.featured === filters.featured);
      }

      if (filters.verified !== undefined) {
        filteredGroups = filteredGroups.filter(group => group.verified === filters.verified);
      }

      if (filters.privacy && filters.privacy.length > 0) {
        filteredGroups = filteredGroups.filter(group =>
          filters.privacy!.includes(group.privacy)
        );
      }
    }

    // Apply sorting
    const sortBy = options.sortBy || 'relevance';
    filteredGroups.sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.stats.createdAt).getTime() - new Date(a.stats.createdAt).getTime();
        case 'created_asc':
          return new Date(a.stats.createdAt).getTime() - new Date(b.stats.createdAt).getTime();
        case 'members_desc':
          return b.stats.memberCount - a.stats.memberCount;
        case 'members_asc':
          return a.stats.memberCount - b.stats.memberCount;
        case 'activity_desc':
          return new Date(b.stats.lastActivity).getTime() - new Date(a.stats.lastActivity).getTime();
        case 'relevance':
        default:
          // Featured and verified groups first, then by activity
          const aScore = (a.featured ? 100 : 0) + (a.verified ? 50 : 0);
          const bScore = (b.featured ? 100 : 0) + (b.verified ? 50 : 0);
          if (aScore !== bScore) return bScore - aScore;
          return new Date(b.stats.lastActivity).getTime() - new Date(a.stats.lastActivity).getTime();
      }
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    const total = filteredGroups.length;
    const paginatedGroups = filteredGroups.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      groups: paginatedGroups,
      total,
      hasMore
    };
  }

  // Get featured groups
  async getFeaturedGroups(limit: number = 6): Promise<PublicGroupInfo[]> {
    return this.groups
      .filter(group => group.featured && group.privacy !== 'private')
      .slice(0, limit);
  }

  // Get groups by category
  async getGroupsByCategory(category: string, limit: number = 10): Promise<PublicGroupInfo[]> {
    return this.groups
      .filter(group => group.category === category && group.privacy !== 'private')
      .slice(0, limit);
  }

  // Get trending groups (most recent activity)
  async getTrendingGroups(limit: number = 10): Promise<PublicGroupInfo[]> {
    return this.groups
      .filter(group => group.privacy !== 'private')
      .sort((a, b) => new Date(b.stats.lastActivity).getTime() - new Date(a.stats.lastActivity).getTime())
      .slice(0, limit);
  }

  // Get group details
  async getGroupDetails(address: string): Promise<PublicGroupInfo | null> {
    const group = this.groups.find(g => g.address.toLowerCase() === address.toLowerCase());
    return group ? { ...group } : null;
  }

  // Get directory statistics
  async getDirectoryStats(): Promise<{
    totalGroups: number;
    totalMembers: number;
    totalContributions: string;
    categoryCounts: Record<string, number>;
    regionCounts: Record<string, number>;
    recentGroups: number; // created in last 30 days
  }> {
    const publicGroups = this.groups.filter(g => g.privacy !== 'private');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const categoryCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    let totalMembers = 0;
    let totalContributions = 0;
    let recentGroups = 0;

    publicGroups.forEach(group => {
      // Category counts
      categoryCounts[group.category] = (categoryCounts[group.category] || 0) + 1;

      // Region counts
      if (group.region) {
        regionCounts[group.region] = (regionCounts[group.region] || 0) + 1;
      }

      // Totals
      totalMembers += group.stats.memberCount;
      totalContributions += parseFloat(group.stats.totalContributions);

      // Recent groups
      if (new Date(group.stats.createdAt) > thirtyDaysAgo) {
        recentGroups++;
      }
    });

    return {
      totalGroups: publicGroups.length,
      totalMembers,
      totalContributions: totalContributions.toFixed(2),
      categoryCounts,
      regionCounts,
      recentGroups
    };
  }

  // Add new group to directory
  async addGroupToDirectory(group: PublicGroupInfo): Promise<void> {
    this.groups.push(group);
  }

  // Update group privacy
  async updateGroupPrivacy(address: string, privacy: PublicGroupInfo['privacy']): Promise<boolean> {
    const groupIndex = this.groups.findIndex(g => g.address.toLowerCase() === address.toLowerCase());
    if (groupIndex >= 0) {
      this.groups[groupIndex].privacy = privacy;
      return true;
    }
    return false;
  }

  // Get available filter options
  async getFilterOptions(): Promise<{
    categories: Array<{ value: string; label: string; count: number }>;
    regions: Array<{ value: string; label: string; count: number }>;
    languages: Array<{ value: string; label: string; count: number }>;
    tags: Array<{ value: string; count: number }>;
  }> {
    const publicGroups = this.groups.filter(g => g.privacy !== 'private');

    const categoryCounts: Record<string, number> = {};
    const regionCounts: Record<string, number> = {};
    const languageCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    publicGroups.forEach(group => {
      // Categories
      categoryCounts[group.category] = (categoryCounts[group.category] || 0) + 1;

      // Regions
      if (group.region) {
        regionCounts[group.region] = (regionCounts[group.region] || 0) + 1;
      }

      // Languages
      if (group.language) {
        languageCounts[group.language] = (languageCounts[group.language] || 0) + 1;
      }

      // Tags
      group.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const categories = Object.entries(categoryCounts)
      .map(([value, count]) => ({
        value,
        label: value.charAt(0).toUpperCase() + value.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count);

    const regions = Object.entries(regionCounts)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);

    const languages = Object.entries(languageCounts)
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);

    const tags = Object.entries(tagCounts)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 tags

    return { categories, regions, languages, tags };
  }
}

export const groupDirectoryManager = new GroupDirectoryManager();

// Utility functions
export const getRelativeTime = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
};

export const getCategoryIcon = (category: PublicGroupInfo['category']): string => {
  switch (category) {
    case 'healthcare': return '🏥';
    case 'education': return '📚';
    case 'emergency': return '🚨';
    case 'lifestyle': return '🎯';
    case 'financial': return '💰';
    default: return '👥';
  }
};

export const getJoinRequestsBadge = (joinRequests: PublicGroupInfo['joinRequests']): {
  text: string;
  color: string;
} => {
  switch (joinRequests) {
    case 'open':
      return { text: 'Open', color: 'bg-green-500/20 text-green-400' };
    case 'approval_required':
      return { text: 'Approval Required', color: 'bg-yellow-500/20 text-yellow-400' };
    case 'invite_only':
      return { text: 'Invite Only', color: 'bg-red-500/20 text-red-400' };
    default:
      return { text: 'Unknown', color: 'bg-gray-500/20 text-gray-400' };
  }
};