import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { 
  GroupAnalytics, 
  AnalyticsFilters, 
  FundingForecast,
  AnalyticsCalculator 
} from '@/lib/analytics';

interface UseGroupAnalyticsOptions {
  groupAddress: string;
  filters?: AnalyticsFilters;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function useGroupAnalytics({
  groupAddress,
  filters,
  autoRefresh = false,
  refreshInterval = 300000 // 5 minutes
}: UseGroupAnalyticsOptions) {
  const [analytics, setAnalytics] = useState<GroupAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const data = await apiClient.getGroupAnalytics(groupAddress, filters);
      setAnalytics(data);
      setLastUpdated(new Date());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(message);
      console.error('Analytics fetch error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [groupAddress, filters]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics(false); // Don't show loading on auto-refresh
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  const refresh = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    lastUpdated,
    refresh
  };
}

export function useFundingPatterns(
  groupAddress: string,
  timeframe: '7d' | '30d' | '90d' | '1y' | 'all' = '30d'
) {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getGroupFundingPatterns(groupAddress, timeframe);
        setPatterns(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch funding patterns');
      } finally {
        setLoading(false);
      }
    };

    fetchPatterns();
  }, [groupAddress, timeframe]);

  return { patterns, loading, error };
}

export function useEngagementMetrics(
  groupAddress: string,
  memberAddress?: string
) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getMemberEngagementMetrics(groupAddress, memberAddress);
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch engagement metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [groupAddress, memberAddress]);

  return { metrics, loading, error };
}

export function usePredictions(
  groupAddress: string,
  months: number = 3
) {
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getGroupPredictions(groupAddress, months);
        setPredictions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [groupAddress, months]);

  return { predictions, loading, error };
}

// Hook for comparing multiple groups
export function useGroupComparison(groupAddresses: string[]) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupAddresses.length === 0) return;

    const fetchComparison = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.compareGroups(groupAddresses);
        setComparison(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comparison data');
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [groupAddresses]);

  return { comparison, loading, error };
}

// Hook for exporting analytics data
export function useAnalyticsExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async (
    groupAddress: string,
    format: 'csv' | 'json' | 'pdf' = 'csv'
  ) => {
    try {
      setExporting(true);
      setError(null);
      
      const result = await apiClient.exportGroupAnalytics(groupAddress, format);
      
      // Trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `group-analytics-${groupAddress.slice(0, 8)}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      setError(message);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  return { exportData, exporting, error };
}

// Hook for real-time analytics updates
export function useRealTimeAnalytics(groupAddress: string) {
  const [analytics, setAnalytics] = useState<GroupAnalytics | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // In a real implementation, this would establish a WebSocket connection
    // For now, we'll simulate with polling
    const pollInterval = setInterval(async () => {
      try {
        const data = await apiClient.getGroupAnalytics(groupAddress);
        setAnalytics(data);
        setConnected(true);
      } catch (error) {
        setConnected(false);
        console.error('Real-time analytics error:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [groupAddress]);

  const disconnect = useCallback(() => {
    setConnected(false);
  }, []);

  return { analytics, connected, disconnect };
}

// Utility hooks for specific analytics calculations
export function useEngagementScore(
  memberAddress: string,
  groupAddress: string,
  refreshDeps: any[] = []
) {
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateScore = async () => {
      try {
        setLoading(true);
        const metrics = await apiClient.getMemberEngagementMetrics(groupAddress, memberAddress);
        
        if (metrics.metrics.length > 0) {
          const memberMetric = metrics.metrics.find(m => m.memberAddress === memberAddress);
          if (memberMetric) {
            const calculatedScore = AnalyticsCalculator.calculateEngagementScore(memberMetric);
            setScore(calculatedScore);
          }
        }
      } catch (error) {
        console.error('Failed to calculate engagement score:', error);
      } finally {
        setLoading(false);
      }
    };

    calculateScore();
  }, [memberAddress, groupAddress, ...refreshDeps]);

  return { score, loading };
}

export function useFundingTrend(groupAddress: string, days: number = 30) {
  const [trend, setTrend] = useState<{
    direction: 'up' | 'down' | 'stable';
    percentage: number;
    confidence: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeTrend = async () => {
      try {
        setLoading(true);
        const patterns = await apiClient.getGroupFundingPatterns(
          groupAddress, 
          days <= 7 ? '7d' : days <= 30 ? '30d' : '90d'
        );
        
        // Analyze trend from patterns
        const recent = patterns.trends.monthly.slice(-3);
        if (recent.length >= 2) {
          const firstValue = recent[0].contributions;
          const lastValue = recent[recent.length - 1].contributions;
          const change = ((lastValue - firstValue) / firstValue) * 100;
          
          setTrend({
            direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
            percentage: Math.abs(change),
            confidence: Math.min(0.9, recent.length / 3) // Higher confidence with more data points
          });
        }
      } catch (error) {
        console.error('Failed to analyze funding trend:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeTrend();
  }, [groupAddress, days]);

  return { trend, loading };
}