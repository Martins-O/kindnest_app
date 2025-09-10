// API client for backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Groups API
  async getGroups(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sortBy?: string;
  }) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    
    return this.request<{
      groups: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/groups/discover${queryString}`);
  }

  async getGroup(address: string) {
    return this.request<any>(`/groups/${address}`);
  }

  async createGroup(groupData: any) {
    return this.request<any>('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async updateGroup(address: string, updates: any) {
    return this.request<any>(`/groups/${address}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async addMember(groupAddress: string, memberData: {
    memberAddress: string;
    nickname: string;
    role?: string;
  }) {
    return this.request<any>(`/groups/${groupAddress}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  async getGroupMembers(groupAddress: string) {
    return this.request<any[]>(`/groups/${groupAddress}/members`);
  }

  // Activities API
  async getGroupActivities(
    groupAddress: string, 
    params?: {
      page?: number;
      limit?: number;
      type?: string;
      since?: string;
      userAddress?: string;
    }
  ) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';

    return this.request<{
      activities: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/activities/group/${groupAddress}${queryString}`);
  }

  async getUserActivities(
    userAddress: string,
    params?: {
      page?: number;
      limit?: number;
      type?: string;
      since?: string;
    }
  ) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';

    return this.request<{
      activities: any[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/activities/user/${userAddress}${queryString}`);
  }

  async createActivity(activityData: any) {
    return this.request<any>('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  async addReaction(activityId: string, reactionData: {
    userAddress: string;
    reactionType?: string;
  }) {
    return this.request<any>(`/activities/${activityId}/reactions`, {
      method: 'POST',
      body: JSON.stringify(reactionData),
    });
  }

  async addComment(activityId: string, commentData: {
    userAddress: string;
    username: string;
    text: string;
  }) {
    return this.request<any>(`/activities/${activityId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  }

  async getActivityStats(groupAddress: string, since?: string) {
    const queryString = since ? `?since=${since}` : '';
    return this.request<{
      totalActivities: number;
      activityBreakdown: Array<{
        type: string;
        count: number;
        lastActivity: string;
      }>;
      lastActivity: string;
    }>(`/activities/group/${groupAddress}/stats${queryString}`);
  }

  async createBulkActivities(activities: any[]) {
    return this.request<{
      created: number;
      activities: any[];
    }>('/activities/bulk', {
      method: 'POST',
      body: JSON.stringify({ activities }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; message: string }>('/health', {
      headers: {},
    });
  }

  // Blockchain sync API
  async getSyncStatus() {
    return this.request<{
      status: string;
      connected: boolean;
      currentBlock: number;
      lastProcessed: number;
    }>('/sync/status');
  }

  async getSyncStats() {
    return this.request<{
      groups: {
        total: number;
        blockchain: number;
        syncPercentage: number;
      };
      activities: {
        total: number;
        blockchain: number;
        manual: number;
        blockchainPercentage: number;
      };
      syncService: any;
      lastUpdate: string;
    }>('/sync/stats');
  }

  async syncGroup(contractAddress: string) {
    return this.request<{
      success: boolean;
      message: string;
      group: any;
    }>(`/sync/group/${contractAddress}`, {
      method: 'POST',
    });
  }

  async validateGroup(contractAddress: string) {
    return this.request<{
      isValid: boolean;
      issues: string[];
      databaseGroup: any;
      blockchainGroup: any;
    }>(`/sync/validate/${contractAddress}`);
  }

  async triggerResync() {
    return this.request<{
      success: boolean;
      message: string;
    }>('/sync/resync', {
      method: 'POST',
    });
  }

  // Analytics API
  async getGroupAnalytics(
    groupAddress: string, 
    filters?: {
      timeframe?: '7d' | '30d' | '90d' | '1y' | 'all';
      includeMembers?: boolean;
      includePredictions?: boolean;
    }
  ) {
    const queryString = filters ? '?' + new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';

    return this.request<any>(`/analytics/groups/${groupAddress}${queryString}`);
  }

  async getGroupFundingPatterns(
    groupAddress: string,
    timeframe: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
  ) {
    return this.request<{
      patterns: any[];
      summary: {
        totalContributions: number;
        totalExpenses: number;
        netFlow: number;
        averageContribution: number;
        contributionFrequency: number;
      };
      trends: {
        monthly: any[];
        byCategory: any[];
        topContributors: any[];
      };
    }>(`/analytics/groups/${groupAddress}/funding?timeframe=${timeframe}`);
  }

  async getMemberEngagementMetrics(
    groupAddress: string,
    memberAddress?: string
  ) {
    const endpoint = memberAddress 
      ? `/analytics/groups/${groupAddress}/engagement/member/${memberAddress}`
      : `/analytics/groups/${groupAddress}/engagement`;
    
    return this.request<{
      metrics: any[];
      summary: {
        totalMembers: number;
        activeMembers: number;
        averageEngagementScore: number;
        engagementTrend: any[];
      };
    }>(endpoint);
  }

  async getGroupPredictions(
    groupAddress: string,
    months: number = 3
  ) {
    return this.request<{
      fundingPrediction: {
        nextMonthPrediction: number;
        confidence: number;
        trend: 'increasing' | 'decreasing' | 'stable';
        factors: string[];
      };
      memberGrowth: {
        predictedNewMembers: number;
        predictedChurn: number;
        confidenceInterval: [number, number];
      };
      riskAssessment: {
        fundingRisk: 'low' | 'medium' | 'high';
        engagementRisk: 'low' | 'medium' | 'high';
        recommendations: string[];
      };
    }>(`/analytics/groups/${groupAddress}/predictions?months=${months}`);
  }

  async compareGroups(groupAddresses: string[]) {
    return this.request<{
      comparisons: any[];
      benchmark: {
        avgFunds: number;
        avgMembers: number;
        avgEngagement: number;
      };
    }>('/analytics/groups/compare', {
      method: 'POST',
      body: JSON.stringify({ groupAddresses }),
    });
  }

  async recordMemberActivity(
    groupAddress: string,
    memberAddress: string,
    activity: {
      type: 'contribution' | 'vote' | 'proposal' | 'comment' | 'reaction' | 'view' | 'join' | 'leave';
      timestamp: string;
      metadata?: any;
    }
  ) {
    return this.request<{ success: boolean }>(`/analytics/groups/${groupAddress}/activity`, {
      method: 'POST',
      body: JSON.stringify({
        memberAddress,
        ...activity,
      }),
    });
  }

  async getAnalyticsOverview() {
    return this.request<{
      totalGroups: number;
      totalFunding: number;
      totalMembers: number;
      averageGroupSize: number;
      topCategories: Array<{
        category: string;
        count: number;
        totalFunding: number;
      }>;
      fundingTrend: Array<{
        date: string;
        amount: number;
      }>;
    }>('/analytics/overview');
  }

  async exportGroupAnalytics(
    groupAddress: string,
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ) {
    return this.request<{
      downloadUrl: string;
      expiresAt: string;
    }>(`/analytics/groups/${groupAddress}/export?format=${format}`);
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export types
export interface ActivityItem {
  id: string;
  type: string;
  groupAddress: string;
  groupName: string;
  actor: {
    address: string;
    nickname: string;
    email?: string;
  };
  target?: {
    address?: string;
    nickname?: string;
    name?: string;
  };
  metadata: {
    amount?: string;
    currency?: string;
    description?: string;
    title?: string;
    txHash?: string;
    blockNumber?: number;
    [key: string]: any;
  };
  privacy: 'public' | 'members_only' | 'private';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  timestamp: string;
  interactions: {
    views: number;
    reactions: Array<{
      user: string;
      type: string;
      timestamp: string;
    }>;
    comments: Array<{
      user: string;
      username: string;
      text: string;
      timestamp: string;
    }>;
  };
  source: 'blockchain' | 'api' | 'manual' | 'system';
}

export interface GroupData {
  _id: string;
  name: string;
  description: string;
  contractAddress: string;
  creator: {
    address: string;
    email?: string;
    nickname: string;
  };
  template: {
    id?: string;
    name?: string;
    category: string;
  };
  settings: {
    privacy: 'public' | 'private' | 'invite-only';
    maxMembers: number;
    contributionFrequency: string;
    minimumContribution: string;
    autoApproveMembers: boolean;
  };
  status: 'active' | 'paused' | 'closed';
  financial: {
    totalBalance: string;
    totalContributions: string;
    totalExpenses: string;
    lastUpdated: string;
  };
  members: Array<{
    address: string;
    nickname: string;
    joinedAt: string;
    role: 'member' | 'admin' | 'viewer';
    status: 'active' | 'inactive' | 'pending';
  }>;
  guidelines: string[];
  tags: string[];
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  social: {
    isPubliclyDiscoverable: boolean;
    allowMemberInvites: boolean;
    showMemberList: boolean;
    showActivityFeed: boolean;
  };
  stats: {
    memberCount: number;
    totalTransactions: number;
    activityScore: number;
    lastActivityAt: string;
  };
  createdAt: string;
  updatedAt: string;
}