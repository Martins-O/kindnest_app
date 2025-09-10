export interface FundingPattern {
  date: string;
  amount: number;
  memberAddress: string;
  memberNickname: string;
  type: 'contribution' | 'expense' | 'withdrawal';
  category?: string;
  description?: string;
}

export interface MemberEngagementMetric {
  memberAddress: string;
  memberNickname: string;
  joinedAt: string;
  totalContributions: number;
  contributionCount: number;
  lastActivity: string;
  engagementScore: number;
  averageContribution: number;
  participationRate: number;
  responseTime: number; // Average time to respond to proposals in hours
  votingParticipation: number; // Percentage of votes participated in
}

export interface GroupAnalytics {
  groupAddress: string;
  groupName: string;
  timeframe: {
    start: string;
    end: string;
  };
  fundingPatterns: {
    totalFunds: number;
    totalContributions: number;
    totalExpenses: number;
    averageContribution: number;
    contributionFrequency: number;
    monthlyTrend: Array<{
      month: string;
      contributions: number;
      expenses: number;
      netFlow: number;
    }>;
    topContributors: Array<{
      memberAddress: string;
      memberNickname: string;
      totalAmount: number;
      percentage: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
      count: number;
    }>;
  };
  memberEngagement: {
    totalMembers: number;
    activeMembers: number;
    averageEngagementScore: number;
    memberMetrics: MemberEngagementMetric[];
    engagementTrend: Array<{
      date: string;
      activeMembers: number;
      newMembers: number;
      churnedMembers: number;
    }>;
  };
  predictiveAnalytics: {
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
  };
}

export interface AnalyticsFilters {
  timeframe: '7d' | '30d' | '90d' | '1y' | 'all';
  memberType?: 'all' | 'active' | 'inactive' | 'new';
  transactionType?: 'all' | 'contributions' | 'expenses' | 'withdrawals';
  category?: string;
}

export interface GroupComparison {
  groupAddress: string;
  groupName: string;
  metrics: {
    totalFunds: number;
    memberCount: number;
    avgContribution: number;
    engagementScore: number;
    fundingVelocity: number; // Funds per day
  };
  ranking: {
    byFunds: number;
    byEngagement: number;
    byGrowth: number;
  };
}

export interface FundingForecast {
  groupAddress: string;
  predictions: Array<{
    date: string;
    predictedContributions: number;
    predictedExpenses: number;
    confidence: number;
    factors: Array<{
      factor: string;
      impact: number; // -1 to 1
      description: string;
    }>;
  }>;
  scenarios: {
    optimistic: { amount: number; probability: number };
    realistic: { amount: number; probability: number };
    pessimistic: { amount: number; probability: number };
  };
}

// Analytics calculation utilities
export class AnalyticsCalculator {
  static calculateEngagementScore(metric: Partial<MemberEngagementMetric>): number {
    const weights = {
      contributionFrequency: 0.3,
      participationRate: 0.25,
      responseTime: 0.2,
      votingParticipation: 0.25
    };

    const contributionScore = Math.min((metric.contributionCount || 0) / 10, 1) * 100;
    const participationScore = (metric.participationRate || 0) * 100;
    const responseScore = Math.max(0, 100 - ((metric.responseTime || 0) / 24) * 10);
    const votingScore = (metric.votingParticipation || 0) * 100;

    return (
      contributionScore * weights.contributionFrequency +
      participationScore * weights.participationRate +
      responseScore * weights.responseTime +
      votingScore * weights.votingParticipation
    );
  }

  static predictFundingNeeds(
    patterns: FundingPattern[],
    timeframeMonths: number = 3
  ): FundingForecast['predictions'] {
    if (patterns.length < 2) {
      return [];
    }

    // Simple linear regression for prediction
    const contributions = patterns.filter(p => p.type === 'contribution');
    const expenses = patterns.filter(p => p.type === 'expense');

    const monthlyContributions = this.groupByMonth(contributions);
    const monthlyExpenses = this.groupByMonth(expenses);

    const contributionTrend = this.calculateTrend(monthlyContributions);
    const expenseTrend = this.calculateTrend(monthlyExpenses);

    const predictions = [];
    const now = new Date();

    for (let i = 1; i <= timeframeMonths; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = futureDate.toISOString().substring(0, 7);

      const predictedContributions = Math.max(0, contributionTrend.slope * i + contributionTrend.intercept);
      const predictedExpenses = Math.max(0, expenseTrend.slope * i + expenseTrend.intercept);

      predictions.push({
        date: monthKey,
        predictedContributions,
        predictedExpenses,
        confidence: Math.max(0.1, 1 - (i * 0.1)), // Confidence decreases over time
        factors: this.identifyTrendFactors(patterns, i)
      });
    }

    return predictions;
  }

  private static groupByMonth(patterns: FundingPattern[]): Record<string, number> {
    return patterns.reduce((acc, pattern) => {
      const month = pattern.date.substring(0, 7);
      acc[month] = (acc[month] || 0) + pattern.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private static calculateTrend(monthlyData: Record<string, number>): { slope: number; intercept: number } {
    const points = Object.entries(monthlyData).map(([month, amount], index) => [index, amount]);
    
    if (points.length < 2) {
      return { slope: 0, intercept: points[0]?.[1] || 0 };
    }

    const n = points.length;
    const sumX = points.reduce((sum, [x]) => sum + x, 0);
    const sumY = points.reduce((sum, [, y]) => sum + y, 0);
    const sumXY = points.reduce((sum, [x, y]) => sum + x * y, 0);
    const sumXX = points.reduce((sum, [x]) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private static identifyTrendFactors(patterns: FundingPattern[], monthsAhead: number): Array<{
    factor: string;
    impact: number;
    description: string;
  }> {
    const recentPatterns = patterns.slice(-30); // Last 30 transactions
    const factors = [];

    // Seasonal patterns
    const currentMonth = new Date().getMonth();
    const targetMonth = (currentMonth + monthsAhead) % 12;
    const seasonalImpact = this.getSeasonalImpact(targetMonth);
    
    if (Math.abs(seasonalImpact) > 0.1) {
      factors.push({
        factor: 'Seasonal Pattern',
        impact: seasonalImpact,
        description: `${seasonalImpact > 0 ? 'Higher' : 'Lower'} activity expected based on seasonal trends`
      });
    }

    // Member growth impact
    const memberGrowthRate = this.calculateMemberGrowthRate(patterns);
    if (Math.abs(memberGrowthRate) > 0.05) {
      factors.push({
        factor: 'Member Growth',
        impact: memberGrowthRate,
        description: `${memberGrowthRate > 0 ? 'Growing' : 'Declining'} membership affects contributions`
      });
    }

    // Contribution frequency changes
    const frequencyTrend = this.calculateFrequencyTrend(patterns);
    if (Math.abs(frequencyTrend) > 0.1) {
      factors.push({
        factor: 'Contribution Frequency',
        impact: frequencyTrend,
        description: `${frequencyTrend > 0 ? 'Increasing' : 'Decreasing'} contribution frequency`
      });
    }

    return factors;
  }

  private static getSeasonalImpact(month: number): number {
    // Simple seasonal model - holidays might affect contributions
    const seasonalFactors = [
      0.1,  // January - New year resolutions
      0.0,  // February
      0.0,  // March
      0.0,  // April
      0.0,  // May
      0.0,  // June
      0.0,  // July
      0.0,  // August
      0.0,  // September
      0.0,  // October
      -0.1, // November - Holiday season, less giving to groups
      -0.2  // December - Holiday expenses
    ];
    return seasonalFactors[month] || 0;
  }

  private static calculateMemberGrowthRate(patterns: FundingPattern[]): number {
    const uniqueMembers = new Set(patterns.map(p => p.memberAddress));
    const recentUniqueMembers = new Set(
      patterns.slice(-Math.floor(patterns.length / 2)).map(p => p.memberAddress)
    );
    
    return recentUniqueMembers.size > uniqueMembers.size / 2 ? 0.2 : -0.1;
  }

  private static calculateFrequencyTrend(patterns: FundingPattern[]): number {
    if (patterns.length < 10) return 0;
    
    const midPoint = Math.floor(patterns.length / 2);
    const firstHalf = patterns.slice(0, midPoint);
    const secondHalf = patterns.slice(midPoint);
    
    const firstHalfFreq = firstHalf.length;
    const secondHalfFreq = secondHalf.length;
    
    return (secondHalfFreq - firstHalfFreq) / firstHalfFreq;
  }

  static assessGroupRisk(analytics: GroupAnalytics): {
    fundingRisk: 'low' | 'medium' | 'high';
    engagementRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Funding risk assessment
    const fundingVelocity = analytics.fundingPatterns.totalContributions / 30; // Per day
    const burnRate = analytics.fundingPatterns.totalExpenses / 30; // Per day
    const runwayDays = analytics.fundingPatterns.totalFunds / Math.max(burnRate, 0.001);
    
    let fundingRisk: 'low' | 'medium' | 'high' = 'low';
    if (runwayDays < 30) {
      fundingRisk = 'high';
      recommendations.push('Critical: Less than 30 days of funding remaining');
      recommendations.push('Consider emergency fundraising or expense reduction');
    } else if (runwayDays < 90) {
      fundingRisk = 'medium';
      recommendations.push('Funding runway is getting low, plan for additional contributions');
    }

    // Engagement risk assessment
    const activeRate = analytics.memberEngagement.activeMembers / analytics.memberEngagement.totalMembers;
    const avgEngagement = analytics.memberEngagement.averageEngagementScore;
    
    let engagementRisk: 'low' | 'medium' | 'high' = 'low';
    if (activeRate < 0.3 || avgEngagement < 40) {
      engagementRisk = 'high';
      recommendations.push('Low member engagement detected');
      recommendations.push('Consider member outreach or engagement initiatives');
    } else if (activeRate < 0.6 || avgEngagement < 60) {
      engagementRisk = 'medium';
      recommendations.push('Monitor member engagement trends');
    }

    // Positive recommendations
    if (fundingRisk === 'low' && engagementRisk === 'low') {
      recommendations.push('Group is performing well - consider expansion or new initiatives');
    }

    return { fundingRisk, engagementRisk, recommendations };
  }
}