'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  User, 
  Edit3, 
  Check, 
  X, 
  Star,
  Trophy,
  Calendar,
  Activity,
  Users,
  DollarSign,
  ExternalLink,
  Settings,
  Shield,
  Crown,
  Award,
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { getRelativeTime, shortenAddress } from '@/lib/utils';

interface MemberProfileProps {
  address: string;
  isOwner?: boolean;
  showEdit?: boolean;
  compact?: boolean;
  className?: string;
}

export function MemberProfile({ 
  address, 
  isOwner = false, 
  showEdit = false,
  compact = false,
  className = '' 
}: MemberProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    nickname: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    loadProfile();
  }, [address]);

  const loadProfile = async () => {
    if (!address) return;

    setLoading(true);
    try {
      // Get user activities to build profile stats
      const activitiesResult = await apiClient.getUserActivities(address, {
        limit: 100
      });
      
      const userActivities = activitiesResult.activities;
      setActivities(userActivities.slice(0, 10)); // Show recent 10

      // Calculate profile stats from activities
      const stats = calculateProfileStats(userActivities);
      
      // Get nickname from most recent activity or use shortened address
      const mostRecentActivity = userActivities.find(a => a.actor.address === address);
      const nickname = mostRecentActivity?.actor.nickname || `User ${shortenAddress(address)}`;

      // Create profile object
      const calculatedProfile = {
        address,
        nickname,
        bio: 'Member of the KindNest community',
        joinDate: userActivities.length > 0 
          ? new Date(Math.min(...userActivities.map(a => new Date(a.timestamp).getTime())))
          : new Date(),
        stats,
        reputation: calculateReputation(stats),
        badges: calculateBadges(stats),
        groups: getUniqueGroups(userActivities)
      };

      setProfile(calculatedProfile);
      setEditData({
        nickname: calculatedProfile.nickname,
        bio: calculatedProfile.bio,
        location: ''
      });

    } catch (error) {
      console.error('Error loading profile:', error);
      // Create minimal profile for users with no activity
      setProfile({
        address,
        nickname: `User ${shortenAddress(address)}`,
        bio: 'New member of the KindNest community',
        joinDate: new Date(),
        stats: {
          totalContributions: '0',
          groupsJoined: 0,
          activitiesCount: 0,
          helpedPeople: 0
        },
        reputation: { level: 'newcomer', score: 0 },
        badges: [],
        groups: []
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProfileStats = (activities: any[]) => {
    const contributions = activities
      .filter(a => a.type === 'contribution_made' && a.actor.address === address)
      .reduce((sum, a) => sum + parseFloat(a.metadata.amount || '0'), 0);

    const groupsJoined = new Set(
      activities
        .filter(a => a.actor.address === address)
        .map(a => a.groupAddress)
    ).size;

    const helpedPeople = new Set(
      activities
        .filter(a => a.actor.address === address && ['contribution_made', 'expense_added'].includes(a.type))
        .map(a => a.groupAddress)
    ).size;

    return {
      totalContributions: contributions.toFixed(4),
      groupsJoined,
      activitiesCount: activities.filter(a => a.actor.address === address).length,
      helpedPeople
    };
  };

  const calculateReputation = (stats: any) => {
    const score = stats.activitiesCount * 10 + stats.groupsJoined * 20 + parseFloat(stats.totalContributions) * 100;
    
    let level = 'newcomer';
    if (score >= 500) level = 'legend';
    else if (score >= 300) level = 'veteran';
    else if (score >= 150) level = 'trusted';
    else if (score >= 50) level = 'contributor';
    
    return { level, score: Math.floor(score) };
  };

  const calculateBadges = (stats: any) => {
    const badges = [];
    
    if (parseFloat(stats.totalContributions) > 0.1) {
      badges.push({
        id: 'generous-giver',
        name: 'Generous Giver',
        description: 'Made significant contributions',
        icon: 'heart',
        rarity: 'common',
        earnedAt: new Date()
      });
    }
    
    if (stats.groupsJoined >= 3) {
      badges.push({
        id: 'community-builder',
        name: 'Community Builder',
        description: 'Active in multiple groups',
        icon: 'users',
        rarity: 'uncommon',
        earnedAt: new Date()
      });
    }

    if (stats.activitiesCount >= 10) {
      badges.push({
        id: 'active-member',
        name: 'Active Member',
        description: 'Highly engaged community member',
        icon: 'activity',
        rarity: 'rare',
        earnedAt: new Date()
      });
    }

    return badges;
  };

  const getUniqueGroups = (activities: any[]) => {
    const groupMap = new Map();
    activities.forEach(activity => {
      if (!groupMap.has(activity.groupAddress)) {
        groupMap.set(activity.groupAddress, {
          address: activity.groupAddress,
          name: activity.groupName,
          role: 'member',
          joinedAt: activity.timestamp
        });
      }
    });
    return Array.from(groupMap.values());
  };

  const getBadgeIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      heart: DollarSign,
      users: Users,
      activity: Activity,
      trophy: Trophy,
      crown: Crown,
      shield: Shield,
      star: Star
    };
    const IconComponent = icons[iconName] || Award;
    return <IconComponent className="h-4 w-4" />;
  };

  const getReputationColor = (level: string) => {
    const colors: Record<string, string> = {
      newcomer: 'text-gray-400',
      contributor: 'text-blue-400',
      trusted: 'text-green-400',
      veteran: 'text-purple-400',
      legend: 'text-yellow-400'
    };
    return colors[level] || 'text-gray-400';
  };

  const handleSave = async () => {
    // In a real app, we'd save this to a user profile API
    setProfile(prev => ({
      ...prev,
      nickname: editData.nickname,
      bio: editData.bio
    }));
    setEditing(false);
  };

  if (loading) {
    return (
      <Card className={`bg-white border-gray-200 shadow-lg ${className}`}>
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <div className="text-gray-600 font-medium">Loading profile...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className={`bg-white border-gray-200 shadow-lg ${className}`}>
        <CardContent className="pt-12 pb-12">
          <div className="text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-600 font-medium">Profile not found</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card className={`bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-900 font-bold">{profile.nickname}</div>
              <div className="text-gray-600 text-sm font-medium">{shortenAddress(profile.address)}</div>
              <div className={`text-xs font-bold capitalize text-blue-600`}>
                {profile.reputation.level}
              </div>
            </div>
            {profile.badges.length > 0 && (
              <div className="flex gap-1">
                {profile.badges.slice(0, 2).map((badge: any) => (
                  <div key={badge.id} className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    {getBadgeIcon(badge.icon)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Header */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Member Profile
            </CardTitle>
            {isOwner && showEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => editing ? handleSave() : setEditing(!editing)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {editing ? <Check className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                {editing ? 'Save' : 'Edit'}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              
              {editing ? (
                <div className="space-y-2 w-full max-w-xs">
                  <Input
                    value={editData.nickname}
                    onChange={(e) => setEditData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="text-center bg-white/10 border-white/20 text-white"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{profile.nickname}</h2>
                  <p className="text-white/60 text-sm font-mono mb-2">{shortenAddress(profile.address)}</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    profile.reputation.level === 'legend' ? 'bg-yellow-500/20 text-yellow-300' :
                    profile.reputation.level === 'veteran' ? 'bg-purple-500/20 text-purple-300' :
                    profile.reputation.level === 'trusted' ? 'bg-green-500/20 text-green-300' :
                    profile.reputation.level === 'contributor' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    <Crown className="h-3 w-3" />
                    {profile.reputation.level} ({profile.reputation.score} pts)
                  </div>
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              {editing ? (
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell others about yourself..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white placeholder:text-white/50 resize-none"
                />
              ) : (
                <p className="text-white/80">{profile.bio}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.stats.totalContributions}</div>
                  <p className="text-white/60 text-sm">ETH Contributed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.stats.groupsJoined}</div>
                  <p className="text-white/60 text-sm">Groups Joined</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.stats.activitiesCount}</div>
                  <p className="text-white/60 text-sm">Activities</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{profile.stats.helpedPeople}</div>
                  <p className="text-white/60 text-sm">Communities Helped</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-white/60 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {getRelativeTime(profile.joinDate)}</span>
                </div>
                <button 
                  onClick={() => window.open(`https://sepolia-blockscout.lisk.com/address/${profile.address}`, '_blank')}
                  className="flex items-center gap-1 hover:text-white/80 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View on Explorer</span>
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      {profile.badges.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements ({profile.badges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.badges.map((badge: any) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400">
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{badge.name}</div>
                    <div className="text-white/60 text-sm">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {activities.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="mt-1 text-blue-400">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-white/90 text-sm">
                      {activity.metadata.description || `Performed ${activity.type.replace('_', ' ')}`}
                    </div>
                    <div className="text-white/50 text-xs mt-1">
                      in {activity.groupName} • {getRelativeTime(new Date(activity.timestamp))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Groups */}
      {profile.groups.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Groups ({profile.groups.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {profile.groups.map((group: any) => (
                <div 
                  key={group.address}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => window.open(`/groups/${group.address}`, '_blank')}
                >
                  <div>
                    <div className="text-white font-medium">{group.name}</div>
                    <div className="text-white/60 text-sm capitalize">{group.role}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-white/40" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}