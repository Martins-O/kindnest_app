'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Activity, 
  Filter, 
  RefreshCw, 
  ExternalLink,
  TrendingUp,
  Users,
  Clock,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  ArrowUp,
  DollarSign,
  UserPlus,
  FileText,
  Award,
  Target
} from 'lucide-react';
import { apiClient, type ActivityItem } from '@/lib/api';
import { getRelativeTime, shortenAddress } from '@/lib/utils';

interface ActivityFeedProps {
  groupAddress?: string;
  userAddress?: string;
  title?: string;
  limit?: number;
  showStats?: boolean;
  showFilters?: boolean;
  className?: string;
}

export function ActivityFeed({ 
  groupAddress, 
  userAddress, 
  title = 'Activity Feed',
  limit = 20,
  showStats = false,
  showFilters = false,
  className = ''
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    types: string[];
    since: Date | null;
  }>({
    types: [],
    since: null
  });
  const [stats, setStats] = useState<{
    totalActivities: number;
    typeBreakdown: Record<string, number>;
    lastActivity: Date | null;
  }>({
    totalActivities: 0,
    typeBreakdown: {},
    lastActivity: null
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const activityTypes = [
    { value: 'member_joined', label: 'Members', icon: UserPlus },
    { value: 'expense_added', label: 'Expenses', icon: FileText },
    { value: 'proposal_created', label: 'Proposals', icon: FileText },
    { value: 'contribution_made', label: 'Contributions', icon: DollarSign },
    { value: 'achievement_earned', label: 'Achievements', icon: Award },
    { value: 'milestone_reached', label: 'Milestones', icon: Target }
  ];

  const loadActivities = async (reset = false) => {
    if (!groupAddress && !userAddress) return;

    setLoading(true);
    setError(null);
    
    try {
      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        limit,
        type: filters.types.length > 0 ? filters.types.join(',') : undefined,
        since: filters.since?.toISOString(),
        userAddress: userAddress // For permission checking
      };

      const result = groupAddress 
        ? await apiClient.getGroupActivities(groupAddress, params)
        : await apiClient.getUserActivities(userAddress!, params);

      if (reset) {
        setActivities(result.activities);
        setPage(2);
      } else {
        setActivities(prev => [...prev, ...result.activities]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(result.pagination.page < result.pagination.totalPages);
      
      if (showStats && groupAddress) {
        const statsData = await apiClient.getActivityStats(
          groupAddress, 
          filters.since?.toISOString()
        );
        setStats({
          totalActivities: statsData.totalActivities,
          typeBreakdown: statsData.activityBreakdown.reduce((acc, item) => {
            acc[item.type] = item.count;
            return acc;
          }, {} as Record<string, number>),
          lastActivity: statsData.lastActivity ? new Date(statsData.lastActivity) : null
        });
      }
    } catch (err) {
      console.error('Failed to load activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(true);
  }, [groupAddress, userAddress, filters]);

  const refreshActivities = () => {
    loadActivities(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadActivities(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const typeMap: Record<string, any> = {
      member_joined: UserPlus,
      member_left: Users,
      expense_added: FileText,
      expense_approved: FileText,
      contribution_made: DollarSign,
      proposal_created: FileText,
      achievement_earned: Award,
      milestone_reached: Target,
      group_created: Users
    };
    
    const IconComponent = typeMap[type] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatActivityMessage = (activity: ActivityItem): string => {
    const { type, actor, metadata } = activity;
    
    switch (type) {
      case 'member_joined':
        return `${actor.nickname} joined the group`;
      case 'contribution_made':
        return `${actor.nickname} contributed ${metadata.amount} ${metadata.currency || 'ETH'}`;
      case 'expense_added':
        return `${actor.nickname} added an expense: ${metadata.description || 'New expense'}`;
      case 'proposal_created':
        return `${actor.nickname} created a proposal: ${metadata.title || metadata.description || 'New proposal'}`;
      case 'achievement_earned':
        return `${actor.nickname} earned an achievement: ${metadata.achievementType}`;
      case 'group_created':
        return `${actor.nickname} created the group`;
      default:
        return metadata.description || `${actor.nickname} performed an action`;
    }
  };

  const getActivityColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      member_joined: 'text-green-400',
      contribution_made: 'text-blue-400',
      expense_added: 'text-orange-400',
      proposal_created: 'text-purple-400',
      achievement_earned: 'text-yellow-400',
      group_created: 'text-indigo-400'
    };
    
    return colorMap[type] || 'text-gray-400';
  };

  const openTransaction = (txHash: string) => {
    window.open(`https://sepolia-blockscout.lisk.com/tx/${txHash}`, '_blank');
  };

  return (
    <div className={`space-y-8 ${className} bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6`}>
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/50 shadow-xl rounded-3xl">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              {title}
            </CardTitle>
            <div className="flex gap-3">
              {showFilters && (
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-lg rounded-xl px-4 font-semibold"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={refreshActivities}
                loading={loading}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-lg rounded-xl px-4 font-semibold"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      {showStats && stats.totalActivities > 0 && (
        <Card className="bg-white/80 backdrop-blur-lg border-white/50 shadow-xl rounded-3xl">
          <CardContent className="pt-8 pb-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-6 text-center shadow-lg border border-white/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{stats.totalActivities}</div>
                <p className="text-slate-600 text-sm font-semibold">Total Activities</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 text-center shadow-lg border border-white/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.lastActivity ? getRelativeTime(stats.lastActivity) : 'None'}
                </div>
                <p className="text-slate-600 text-sm font-semibold">Last Activity</p>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl p-6 text-center shadow-lg border border-white/50">
                <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  {Object.keys(stats.typeBreakdown).length}
                </div>
                <p className="text-slate-600 text-sm font-semibold">Activity Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/50 shadow-xl rounded-3xl">
        <CardContent className="p-0">
          {loading && activities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Activity className="h-8 w-8 text-white animate-spin" />
              </div>
              <div className="text-slate-700 font-semibold text-lg">Loading activities...</div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div className="text-red-600 mb-6 font-semibold text-lg">{error}</div>
              <Button onClick={refreshActivities} variant="outline" className="bg-white border-red-300 text-red-600 hover:bg-red-50 rounded-xl px-6 font-semibold">
                Try Again
              </Button>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div className="text-slate-700 font-semibold text-lg">No activities yet</div>
              <p className="text-slate-500 text-sm mt-3 font-medium">
                Activity will appear here as members interact with the group
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <div 
                  key={activity.id}
                  className={`p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                    index === 0 ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-700 text-sm">
                        {formatActivityMessage(activity)}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(new Date(activity.timestamp))}
                        </span>
                        
                        {activity.metadata.txHash && (
                          <button
                            onClick={() => openTransaction(activity.metadata.txHash!)}
                            className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View TX
                          </button>
                        )}
                        
                        <span className="capitalize text-slate-400">
                          {activity.privacy}
                        </span>
                      </div>
                      
                      {/* Interaction buttons */}
                      <div className="flex items-center gap-4 mt-3">
                        <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
                          <Heart className="h-3 w-3" />
                          <span className="text-xs">{activity.interactions?.reactions?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors">
                          <MessageCircle className="h-3 w-3" />
                          <span className="text-xs">{activity.interactions?.comments?.length || 0}</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-slate-500 hover:text-white p-1 h-auto"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="p-6 text-center border-t border-slate-100">
                  <Button
                    onClick={loadMore}
                    loading={loading}
                    variant="outline"
                    size="lg"
                    className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-lg rounded-2xl px-8 py-3 font-semibold"
                  >
                    <ArrowUp className="h-5 w-5 mr-3 rotate-180" />
                    Load More Activities
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}