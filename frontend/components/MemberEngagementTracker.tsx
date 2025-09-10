'use client';

import React, { useState, useEffect, useContext, createContext } from 'react';
import { apiClient } from '@/lib/api';
import { AnalyticsCalculator } from '@/lib/analytics';

interface EngagementEvent {
  type: 'contribution' | 'vote' | 'proposal' | 'comment' | 'reaction' | 'view' | 'join' | 'leave';
  groupAddress: string;
  memberAddress: string;
  timestamp: string;
  metadata?: {
    amount?: number;
    proposalId?: string;
    commentId?: string;
    reactionType?: string;
    activityId?: string;
  };
}

interface EngagementContextType {
  trackEngagement: (event: Omit<EngagementEvent, 'timestamp'>) => Promise<void>;
  getEngagementScore: (memberAddress: string, groupAddress: string) => number;
  isTracking: boolean;
}

const EngagementContext = createContext<EngagementContextType | null>(null);

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const [engagementData, setEngagementData] = useState<Map<string, EngagementEvent[]>>(new Map());
  const [isTracking, setIsTracking] = useState(true);

  const trackEngagement = async (event: Omit<EngagementEvent, 'timestamp'>) => {
    if (!isTracking) return;

    const fullEvent: EngagementEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Store locally for immediate updates
    const key = `${event.groupAddress}-${event.memberAddress}`;
    const existing = engagementData.get(key) || [];
    setEngagementData(prev => new Map(prev).set(key, [...existing, fullEvent]));

    // Send to backend for persistent storage
    try {
      await apiClient.recordMemberActivity(
        event.groupAddress,
        event.memberAddress,
        {
          type: event.type,
          timestamp: fullEvent.timestamp,
          metadata: event.metadata
        }
      );
    } catch (error) {
      console.error('Failed to record engagement:', error);
    }
  };

  const getEngagementScore = (memberAddress: string, groupAddress: string): number => {
    const key = `${groupAddress}-${memberAddress}`;
    const events = engagementData.get(key) || [];
    
    if (events.length === 0) return 0;

    // Calculate engagement metrics
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => new Date(e.timestamp).getTime() > thirtyDaysAgo);

    const contributionEvents = recentEvents.filter(e => e.type === 'contribution');
    const voteEvents = recentEvents.filter(e => e.type === 'vote');
    const proposalEvents = recentEvents.filter(e => e.type === 'proposal');
    const commentEvents = recentEvents.filter(e => e.type === 'comment');
    const reactionEvents = recentEvents.filter(e => e.type === 'reaction');

    // Calculate response time (mock calculation)
    const avgResponseTime = calculateAverageResponseTime(recentEvents);
    const participationRate = calculateParticipationRate(recentEvents);
    const votingParticipation = voteEvents.length / Math.max(1, proposalEvents.length);

    const metrics = {
      contributionCount: contributionEvents.length,
      participationRate,
      responseTime: avgResponseTime,
      votingParticipation: Math.min(1, votingParticipation)
    };

    return AnalyticsCalculator.calculateEngagementScore(metrics);
  };

  const value: EngagementContextType = {
    trackEngagement,
    getEngagementScore,
    isTracking
  };

  return (
    <EngagementContext.Provider value={value}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagementTracker() {
  const context = useContext(EngagementContext);
  if (!context) {
    throw new Error('useEngagementTracker must be used within EngagementProvider');
  }
  return context;
}

// Higher-order component to automatically track engagement
export function withEngagementTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  eventType: EngagementEvent['type']
) {
  return function EnhancedComponent(props: P & { 
    groupAddress?: string; 
    memberAddress?: string; 
    trackingMetadata?: any;
  }) {
    const { trackEngagement } = useEngagementTracker();

    useEffect(() => {
      if (props.groupAddress && props.memberAddress) {
        trackEngagement({
          type: eventType,
          groupAddress: props.groupAddress,
          memberAddress: props.memberAddress,
          metadata: props.trackingMetadata
        });
      }
    }, [props.groupAddress, props.memberAddress, props.trackingMetadata, trackEngagement]);

    return <WrappedComponent {...props} />;
  };
}

// Hook for manual engagement tracking
export function useEngagementEvent() {
  const { trackEngagement } = useEngagementTracker();
  
  return {
    trackContribution: (groupAddress: string, memberAddress: string, amount: number) => {
      trackEngagement({
        type: 'contribution',
        groupAddress,
        memberAddress,
        metadata: { amount }
      });
    },

    trackVote: (groupAddress: string, memberAddress: string, proposalId: string) => {
      trackEngagement({
        type: 'vote',
        groupAddress,
        memberAddress,
        metadata: { proposalId }
      });
    },

    trackProposal: (groupAddress: string, memberAddress: string, proposalId: string) => {
      trackEngagement({
        type: 'proposal',
        groupAddress,
        memberAddress,
        metadata: { proposalId }
      });
    },

    trackComment: (groupAddress: string, memberAddress: string, activityId: string) => {
      trackEngagement({
        type: 'comment',
        groupAddress,
        memberAddress,
        metadata: { activityId }
      });
    },

    trackReaction: (groupAddress: string, memberAddress: string, activityId: string, reactionType: string) => {
      trackEngagement({
        type: 'reaction',
        groupAddress,
        memberAddress,
        metadata: { activityId, reactionType }
      });
    },

    trackView: (groupAddress: string, memberAddress: string, activityId?: string) => {
      trackEngagement({
        type: 'view',
        groupAddress,
        memberAddress,
        metadata: { activityId }
      });
    },

    trackJoin: (groupAddress: string, memberAddress: string) => {
      trackEngagement({
        type: 'join',
        groupAddress,
        memberAddress
      });
    },

    trackLeave: (groupAddress: string, memberAddress: string) => {
      trackEngagement({
        type: 'leave',
        groupAddress,
        memberAddress
      });
    }
  };
}

// Engagement score display component
export function EngagementScore({ 
  memberAddress, 
  groupAddress, 
  showLabel = true 
}: { 
  memberAddress: string; 
  groupAddress: string; 
  showLabel?: boolean; 
}) {
  const { getEngagementScore } = useEngagementTracker();
  const score = getEngagementScore(memberAddress, groupAddress);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Low';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(score)}`}>
        {Math.round(score)}
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500">
          {getScoreLabel(score)} Engagement
        </span>
      )}
    </div>
  );
}

// Real-time engagement feed component
export function EngagementFeed({ 
  groupAddress, 
  limit = 10 
}: { 
  groupAddress: string; 
  limit?: number; 
}) {
  const [recentEvents, setRecentEvents] = useState<EngagementEvent[]>([]);
  
  useEffect(() => {
    // In a real implementation, this would connect to a WebSocket or poll for updates
    // For now, we'll just show the concept
    const mockEvents: EngagementEvent[] = [
      {
        type: 'contribution',
        groupAddress,
        memberAddress: '0x123...abc',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        metadata: { amount: 0.5 }
      },
      {
        type: 'vote',
        groupAddress,
        memberAddress: '0x456...def',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        metadata: { proposalId: 'prop-1' }
      },
      {
        type: 'comment',
        groupAddress,
        memberAddress: '0x789...ghi',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        metadata: { activityId: 'act-1' }
      }
    ];
    
    setRecentEvents(mockEvents.slice(0, limit));
  }, [groupAddress, limit]);

  const getEventIcon = (type: EngagementEvent['type']) => {
    const icons = {
      contribution: '💰',
      vote: '🗳️',
      proposal: '📋',
      comment: '💬',
      reaction: '❤️',
      view: '👁️',
      join: '✅',
      leave: '🚪'
    };
    return icons[type] || '📈';
  };

  const getEventDescription = (event: EngagementEvent) => {
    const actions = {
      contribution: `contributed ${event.metadata?.amount ? `${event.metadata.amount} ETH` : ''}`,
      vote: 'voted on a proposal',
      proposal: 'created a proposal',
      comment: 'left a comment',
      reaction: 'reacted to an activity',
      view: 'viewed the group',
      join: 'joined the group',
      leave: 'left the group'
    };
    return actions[event.type] || 'performed an action';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-slate-800">Recent Activity</h4>
      <div className="space-y-2">
        {recentEvents.map((event, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
            <span className="text-lg">{getEventIcon(event.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 truncate">
                Member {getEventDescription(event)}
              </p>
              <p className="text-xs text-slate-500">
                {formatTimeAgo(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {recentEvents.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
}

// Utility functions
function calculateAverageResponseTime(events: EngagementEvent[]): number {
  // Mock calculation - in reality this would analyze response times to proposals/messages
  const responseEvents = events.filter(e => ['vote', 'comment'].includes(e.type));
  if (responseEvents.length === 0) return 24; // Default 24 hours
  
  // Simulate response time based on activity frequency
  return Math.max(1, 48 / responseEvents.length);
}

function calculateParticipationRate(events: EngagementEvent[]): number {
  // Mock calculation - in reality this would be based on actual participation opportunities
  const totalOpportunities = 10; // Assume 10 participation opportunities in the period
  const participationEvents = events.filter(e => 
    ['contribution', 'vote', 'proposal', 'comment'].includes(e.type)
  );
  
  return Math.min(1, participationEvents.length / totalOpportunities);
}