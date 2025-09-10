'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  Calendar,
  Download,
  AlertTriangle,
  Info,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { 
  GroupAnalytics as GroupAnalyticsType, 
  AnalyticsFilters, 
  AnalyticsCalculator,
  FundingPattern,
  MemberEngagementMetric
} from '@/lib/analytics';
import { formatETH, formatDate, shortenAddress } from '@/lib/utils';

interface GroupAnalyticsProps {
  groupAddress: string;
  userAddress?: string;
  isAdmin?: boolean;
}

export function GroupAnalytics({ groupAddress, userAddress, isAdmin = false }: GroupAnalyticsProps) {
  const [analytics, setAnalytics] = useState<GroupAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeframe: '30d',
    memberType: 'all',
    transactionType: 'all'
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'funding' | 'engagement' | 'predictions'>('overview');
  const [exporting, setExporting] = useState(false);

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, [groupAddress, filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - in production this would call the API
      const mockAnalytics = generateMockAnalytics(groupAddress);
      setAnalytics(mockAnalytics);
      
      // Real API call would be:
      // const data = await apiClient.getGroupAnalytics(groupAddress, filters);
      // setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      setExporting(true);
      await apiClient.exportGroupAnalytics(groupAddress, format);
      // Handle download
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-40 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Analytics Unavailable</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Group Analytics</h2>
          <p className="text-slate-600">Insights and trends for {analytics.groupName}</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterControls filters={filters} onFiltersChange={setFilters} />
          {isAdmin && (
            <Button
              onClick={() => handleExport('csv')}
              loading={exporting}
              variant="outline"
              className="text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button onClick={fetchAnalytics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'funding', label: 'Funding Patterns', icon: DollarSign },
            { id: 'engagement', label: 'Member Engagement', icon: Users },
            { id: 'predictions', label: 'Predictions', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab analytics={analytics} />}
      {activeTab === 'funding' && <FundingPatternsTab analytics={analytics} />}
      {activeTab === 'engagement' && <EngagementTab analytics={analytics} />}
      {activeTab === 'predictions' && <PredictionsTab analytics={analytics} />}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ analytics }: { analytics: GroupAnalyticsType }) {
  const riskAssessment = analytics.predictiveAnalytics.riskAssessment;
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Funds"
          value={formatETH(BigInt(Math.floor(analytics.fundingPatterns.totalFunds * 1e18)))}
          change={+12.5}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          title="Active Members"
          value={analytics.memberEngagement.activeMembers.toString()}
          change={+5.2}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Avg Contribution"
          value={formatETH(BigInt(Math.floor(analytics.fundingPatterns.averageContribution * 1e18)))}
          change={-2.1}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Engagement Score"
          value={Math.round(analytics.memberEngagement.averageEngagementScore).toString()}
          change={+8.3}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Risk Assessment */}
      {(riskAssessment.fundingRisk !== 'low' || riskAssessment.engagementRisk !== 'low') && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <RiskIndicator
                label="Funding Risk"
                level={riskAssessment.fundingRisk}
              />
              <RiskIndicator
                label="Engagement Risk"
                level={riskAssessment.engagementRisk}
              />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">Recommendations:</h4>
              <ul className="space-y-1">
                {riskAssessment.recommendations.map((rec, index) => (
                  <li key={index} className="text-amber-700 text-sm flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Trends */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Funding Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.fundingPatterns.monthlyTrend.slice(-6).map((trend, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">{trend.month}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${trend.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.netFlow >= 0 ? '+' : ''}{formatETH(BigInt(Math.floor(trend.netFlow * 1e18)))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.fundingPatterns.topContributors.slice(0, 5).map((contributor, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-medium">{contributor.memberNickname}</span>
                    <div className="text-xs text-slate-500">{shortenAddress(contributor.memberAddress)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatETH(BigInt(Math.floor(contributor.totalAmount * 1e18)))}</div>
                    <div className="text-xs text-slate-500">{contributor.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Funding Patterns Tab Component
function FundingPatternsTab({ analytics }: { analytics: GroupAnalyticsType }) {
  const { fundingPatterns } = analytics;

  return (
    <div className="space-y-6">
      {/* Funding Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Contributions</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatETH(BigInt(Math.floor(fundingPatterns.totalContributions * 1e18)))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatETH(BigInt(Math.floor(fundingPatterns.totalExpenses * 1e18)))}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Net Flow</p>
                <p className={`text-2xl font-bold ${
                  (fundingPatterns.totalContributions - fundingPatterns.totalExpenses) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatETH(BigInt(Math.floor((fundingPatterns.totalContributions - fundingPatterns.totalExpenses) * 1e18)))}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fundingPatterns.categoryBreakdown.map((category, index) => (
              <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-800">{category.category}</p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatETH(BigInt(Math.floor(category.amount * 1e18)))}
                </p>
                <p className="text-xs text-slate-500">{category.percentage.toFixed(1)}% • {category.count} transactions</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Funding Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fundingPatterns.monthlyTrend.map((trend, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-600">Month</p>
                  <p className="font-semibold">{trend.month}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Contributions</p>
                  <p className="font-semibold text-green-600">
                    {formatETH(BigInt(Math.floor(trend.contributions * 1e18)))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Expenses</p>
                  <p className="font-semibold text-red-600">
                    {formatETH(BigInt(Math.floor(trend.expenses * 1e18)))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Net Flow</p>
                  <p className={`font-semibold ${trend.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.netFlow >= 0 ? '+' : ''}{formatETH(BigInt(Math.floor(trend.netFlow * 1e18)))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Member Engagement Tab Component
function EngagementTab({ analytics }: { analytics: GroupAnalyticsType }) {
  const { memberEngagement } = analytics;

  return (
    <div className="space-y-6">
      {/* Engagement Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{memberEngagement.totalMembers}</p>
            <p className="text-sm text-slate-600">Total Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{memberEngagement.activeMembers}</p>
            <p className="text-sm text-slate-600">Active Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-slate-800">{Math.round(memberEngagement.averageEngagementScore)}</p>
            <p className="text-sm text-slate-600">Avg Engagement</p>
          </CardContent>
        </Card>
      </div>

      {/* Member Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Member Engagement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {memberEngagement.memberMetrics.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {member.memberNickname.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{member.memberNickname}</p>
                    <p className="text-sm text-slate-500">{shortenAddress(member.memberAddress)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{member.contributionCount}</p>
                    <p className="text-slate-500">Contributions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{Math.round(member.participationRate * 100)}%</p>
                    <p className="text-slate-500">Participation</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{Math.round(member.engagementScore)}</p>
                    <p className="text-slate-500">Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Predictions Tab Component
function PredictionsTab({ analytics }: { analytics: GroupAnalyticsType }) {
  const { predictiveAnalytics } = analytics;

  return (
    <div className="space-y-6">
      {/* Funding Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Next Month Prediction</h4>
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <p className="text-3xl font-bold text-indigo-600">
                  {formatETH(BigInt(Math.floor(predictiveAnalytics.fundingPrediction.nextMonthPrediction * 1e18)))}
                </p>
                <p className="text-sm text-slate-600 mb-2">Expected contributions</p>
                <div className="flex items-center justify-center gap-2">
                  <div className={`flex items-center gap-1 text-xs ${
                    predictiveAnalytics.fundingPrediction.trend === 'increasing' ? 'text-green-600' :
                    predictiveAnalytics.fundingPrediction.trend === 'decreasing' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {predictiveAnalytics.fundingPrediction.trend === 'increasing' ? <TrendingUp className="h-3 w-3" /> :
                     predictiveAnalytics.fundingPrediction.trend === 'decreasing' ? <TrendingDown className="h-3 w-3" /> :
                     <Activity className="h-3 w-3" />}
                    {predictiveAnalytics.fundingPrediction.trend}
                  </div>
                  <span className="text-xs text-slate-500">
                    ({Math.round(predictiveAnalytics.fundingPrediction.confidence * 100)}% confidence)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Key Factors</h4>
              <div className="space-y-3">
                {predictiveAnalytics.fundingPrediction.factors.map((factor, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member Growth Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Member Growth Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                +{predictiveAnalytics.memberGrowth.predictedNewMembers}
              </p>
              <p className="text-sm text-slate-600">Expected new members</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                -{predictiveAnalytics.memberGrowth.predictedChurn}
              </p>
              <p className="text-sm text-slate-600">Expected member churn</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}: { 
  title: string; 
  value: string; 
  change: number; 
  icon: React.ComponentType<{ className?: string }>; 
  color: string; 
}) {
  const colorClasses = {
    green: 'text-green-600 bg-green-100',
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <div className={`flex items-center gap-1 text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskIndicator({ label, level }: { label: string; level: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[level]}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{label}</span>
        <span className="text-sm capitalize">{level}</span>
      </div>
    </div>
  );
}

function FilterControls({ 
  filters, 
  onFiltersChange 
}: { 
  filters: AnalyticsFilters; 
  onFiltersChange: (filters: AnalyticsFilters) => void; 
}) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-slate-400" />
      <select
        value={filters.timeframe}
        onChange={(e) => onFiltersChange({ ...filters, timeframe: e.target.value as any })}
        className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
      >
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
        <option value="90d">Last 90 days</option>
        <option value="1y">Last year</option>
        <option value="all">All time</option>
      </select>
    </div>
  );
}

// Mock data generator (remove in production)
function generateMockAnalytics(groupAddress: string): GroupAnalyticsType {
  const now = new Date();
  const monthsBack = 6;
  
  return {
    groupAddress,
    groupName: "Healthcare Support Circle",
    timeframe: {
      start: new Date(now.getFullYear(), now.getMonth() - monthsBack, 1).toISOString(),
      end: now.toISOString()
    },
    fundingPatterns: {
      totalFunds: 15.75,
      totalContributions: 45.20,
      totalExpenses: 29.45,
      averageContribution: 0.85,
      contributionFrequency: 12.5,
      monthlyTrend: Array.from({ length: monthsBack }, (_, i) => ({
        month: new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1)
          .toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        contributions: Math.random() * 10 + 2,
        expenses: Math.random() * 8 + 1,
        netFlow: Math.random() * 6 - 2
      })),
      topContributors: [
        { memberAddress: '0x123...abc', memberNickname: 'Alice', totalAmount: 8.5, percentage: 18.8 },
        { memberAddress: '0x456...def', memberNickname: 'Bob', totalAmount: 6.2, percentage: 13.7 },
        { memberAddress: '0x789...ghi', memberNickname: 'Carol', totalAmount: 4.8, percentage: 10.6 }
      ],
      categoryBreakdown: [
        { category: 'Medical', amount: 15.2, percentage: 51.6, count: 8 },
        { category: 'Pharmacy', amount: 8.1, percentage: 27.5, count: 12 },
        { category: 'Equipment', amount: 4.6, percentage: 15.6, count: 3 },
        { category: 'Other', amount: 1.55, percentage: 5.3, count: 2 }
      ]
    },
    memberEngagement: {
      totalMembers: 24,
      activeMembers: 18,
      averageEngagementScore: 73.5,
      memberMetrics: [
        {
          memberAddress: '0x123...abc',
          memberNickname: 'Alice',
          joinedAt: '2024-01-15T10:00:00Z',
          totalContributions: 8.5,
          contributionCount: 12,
          lastActivity: '2024-01-20T14:30:00Z',
          engagementScore: 92,
          averageContribution: 0.71,
          participationRate: 0.85,
          responseTime: 2.5,
          votingParticipation: 0.90
        },
        {
          memberAddress: '0x456...def',
          memberNickname: 'Bob',
          joinedAt: '2024-01-10T16:00:00Z',
          totalContributions: 6.2,
          contributionCount: 8,
          lastActivity: '2024-01-19T09:15:00Z',
          engagementScore: 78,
          averageContribution: 0.78,
          participationRate: 0.72,
          responseTime: 4.2,
          votingParticipation: 0.75
        }
      ],
      engagementTrend: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        activeMembers: Math.floor(Math.random() * 5) + 15,
        newMembers: Math.random() > 0.8 ? 1 : 0,
        churnedMembers: Math.random() > 0.9 ? 1 : 0
      }))
    },
    predictiveAnalytics: {
      fundingPrediction: {
        nextMonthPrediction: 7.8,
        confidence: 0.76,
        trend: 'increasing',
        factors: [
          'Recent increase in member contributions',
          'Seasonal healthcare expense patterns',
          'Growing member engagement'
        ]
      },
      memberGrowth: {
        predictedNewMembers: 3,
        predictedChurn: 1,
        confidenceInterval: [2, 5]
      },
      riskAssessment: {
        fundingRisk: 'low',
        engagementRisk: 'medium',
        recommendations: [
          'Monitor member engagement trends',
          'Consider member retention initiatives',
          'Funding levels are healthy'
        ]
      }
    }
  };
}