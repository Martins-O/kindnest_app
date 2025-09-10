'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Brain, 
  Zap,
  Calendar,
  Users,
  DollarSign,
  Activity,
  Info,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FundingForecast, 
  GroupAnalytics, 
  AnalyticsCalculator,
  FundingPattern
} from '@/lib/analytics';
import { formatETH, formatDate } from '@/lib/utils';
import { apiClient } from '@/lib/api';

interface PredictiveAnalyticsProps {
  groupAddress: string;
  analytics?: GroupAnalytics;
  timeframe?: number; // months to predict
}

interface Scenario {
  name: string;
  description: string;
  probability: number;
  fundingImpact: number;
  membershipImpact: number;
  timeframe: string;
  actions: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface FundingAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  timeframe: string;
  recommendedActions: string[];
  estimatedImpact?: number;
}

export function PredictiveAnalytics({ 
  groupAddress, 
  analytics, 
  timeframe = 6 
}: PredictiveAnalyticsProps) {
  const [forecast, setForecast] = useState<FundingForecast | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [alerts, setAlerts] = useState<FundingAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  useEffect(() => {
    generatePredictions();
  }, [groupAddress, analytics, timeframe]);

  const generatePredictions = async () => {
    try {
      setLoading(true);
      
      // Generate mock predictions (in production, this would call the API)
      const mockForecast = generateMockForecast(groupAddress, timeframe);
      const mockScenarios = generateMockScenarios();
      const mockAlerts = generateFundingAlerts(analytics);
      
      setForecast(mockForecast);
      setScenarios(mockScenarios);
      setAlerts(mockAlerts);
      
      // Real API call would be:
      // const predictions = await apiClient.getGroupPredictions(groupAddress, timeframe);
    } catch (error) {
      console.error('Failed to generate predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fundingTrend = useMemo(() => {
    if (!forecast) return 'stable';
    
    const predictions = forecast.predictions;
    if (predictions.length < 2) return 'stable';
    
    const recent = predictions.slice(-2);
    const trend = recent[1].predictedContributions - recent[0].predictedContributions;
    
    if (trend > 0.1) return 'increasing';
    if (trend < -0.1) return 'decreasing';
    return 'stable';
  }, [forecast]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Funding Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <FundingAlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Funding Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Funding Forecast - Next {timeframe} Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forecast && <FundingForecastChart forecast={forecast} trend={fundingTrend} />}
        </CardContent>
      </Card>

      {/* Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            Potential Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario, index) => (
              <ScenarioCard
                key={index}
                scenario={scenario}
                isSelected={selectedScenario === scenario.name}
                onSelect={() => setSelectedScenario(
                  selectedScenario === scenario.name ? null : scenario.name
                )}
              />
            ))}
          </div>
          {selectedScenario && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <ScenarioDetails 
                scenario={scenarios.find(s => s.name === selectedScenario)!} 
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictive Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Member Growth Prediction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MemberGrowthPrediction analytics={analytics} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Optimization Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OptimizationSuggestions analytics={analytics} />
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Risk Assessment Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RiskAssessmentMatrix analytics={analytics} />
        </CardContent>
      </Card>
    </div>
  );
}

function FundingAlertCard({ alert }: { alert: FundingAlert }) {
  const colors = {
    critical: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800'
  };

  const icons = {
    critical: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icons[alert.type];

  return (
    <Card className={`border-l-4 ${colors[alert.type]}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{alert.title}</h4>
              <span className="text-xs bg-white/50 px-2 py-1 rounded-full">
                {alert.timeframe}
              </span>
            </div>
            <p className="text-sm mb-3">{alert.description}</p>
            {alert.recommendedActions.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Recommended Actions:</p>
                <ul className="text-xs space-y-1">
                  {alert.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FundingForecastChart({ 
  forecast, 
  trend 
}: { 
  forecast: FundingForecast; 
  trend: string; 
}) {
  const maxValue = Math.max(
    ...forecast.predictions.map(p => Math.max(p.predictedContributions, p.predictedExpenses))
  );

  const trendIcon = trend === 'increasing' ? TrendingUp : 
                   trend === 'decreasing' ? TrendingDown : Activity;
  const trendColor = trend === 'increasing' ? 'text-green-600' : 
                    trend === 'decreasing' ? 'text-red-600' : 'text-blue-600';

  return (
    <div className="space-y-4">
      {/* Trend Indicator */}
      <div className={`flex items-center gap-2 ${trendColor}`}>
        {React.createElement(trendIcon, { className: "h-4 w-4" })}
        <span className="text-sm font-medium capitalize">
          {trend} trend detected
        </span>
      </div>

      {/* Chart Data */}
      <div className="space-y-3">
        {forecast.predictions.map((prediction, index) => {
          const contributionHeight = (prediction.predictedContributions / maxValue) * 100;
          const expenseHeight = (prediction.predictedExpenses / maxValue) * 100;

          return (
            <div key={index} className="flex items-end gap-2 h-16">
              <div className="flex-1">
                <div className="text-xs text-slate-600 mb-1">{prediction.date}</div>
                <div className="flex gap-1 h-12 items-end">
                  <div className="flex-1 relative">
                    <div 
                      className="bg-green-200 rounded-t transition-all duration-300"
                      style={{ height: `${contributionHeight}%` }}
                      title={`Predicted contributions: ${formatETH(BigInt(Math.floor(prediction.predictedContributions * 1e18)))}`}
                    ></div>
                    <div 
                      className="bg-red-200 rounded-t transition-all duration-300"
                      style={{ height: `${expenseHeight}%` }}
                      title={`Predicted expenses: ${formatETH(BigInt(Math.floor(prediction.predictedExpenses * 1e18)))}`}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-green-600 font-medium">
                  +{formatETH(BigInt(Math.floor(prediction.predictedContributions * 1e18)))}
                </div>
                <div className="text-red-600">
                  -{formatETH(BigInt(Math.floor(prediction.predictedExpenses * 1e18)))}
                </div>
                <div className="text-slate-500 text-xs">
                  {Math.round(prediction.confidence * 100)}% conf
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scenarios */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-sm font-semibold text-green-800">Optimistic</p>
          <p className="text-lg font-bold text-green-600">
            {formatETH(BigInt(Math.floor(forecast.scenarios.optimistic.amount * 1e18)))}
          </p>
          <p className="text-xs text-green-600">
            {Math.round(forecast.scenarios.optimistic.probability * 100)}% chance
          </p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-semibold text-blue-800">Realistic</p>
          <p className="text-lg font-bold text-blue-600">
            {formatETH(BigInt(Math.floor(forecast.scenarios.realistic.amount * 1e18)))}
          </p>
          <p className="text-xs text-blue-600">
            {Math.round(forecast.scenarios.realistic.probability * 100)}% chance
          </p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <p className="text-sm font-semibold text-orange-800">Pessimistic</p>
          <p className="text-lg font-bold text-orange-600">
            {formatETH(BigInt(Math.floor(forecast.scenarios.pessimistic.amount * 1e18)))}
          </p>
          <p className="text-xs text-orange-600">
            {Math.round(forecast.scenarios.pessimistic.probability * 100)}% chance
          </p>
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ 
  scenario, 
  isSelected, 
  onSelect 
}: { 
  scenario: Scenario; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${scenario.color}`}>
          <scenario.icon className="h-4 w-4 text-white" />
        </div>
        <h4 className="font-semibold text-slate-800 mb-2">{scenario.name}</h4>
        <p className="text-sm text-slate-600 mb-3">{scenario.description}</p>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500">{scenario.timeframe}</span>
          <span className="font-semibold">{Math.round(scenario.probability * 100)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ScenarioDetails({ scenario }: { scenario: Scenario }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-slate-800 flex items-center gap-2">
        <scenario.icon className="h-4 w-4" />
        {scenario.name} - Detailed Analysis
      </h4>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-sm font-medium text-slate-700 mb-2">Expected Impact</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Funding Impact:</span>
              <span className={scenario.fundingImpact >= 0 ? 'text-green-600' : 'text-red-600'}>
                {scenario.fundingImpact >= 0 ? '+' : ''}{scenario.fundingImpact}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Member Impact:</span>
              <span className={scenario.membershipImpact >= 0 ? 'text-green-600' : 'text-red-600'}>
                {scenario.membershipImpact >= 0 ? '+' : ''}{scenario.membershipImpact}%
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-slate-700 mb-2">Recommended Actions</h5>
          <ul className="space-y-1 text-sm">
            {scenario.actions.map((action, index) => (
              <li key={index} className="flex items-start gap-1">
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MemberGrowthPrediction({ analytics }: { analytics?: GroupAnalytics }) {
  if (!analytics) return <div className="text-center text-slate-500">No data available</div>;

  const { memberGrowth } = analytics.predictiveAnalytics;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Users className="h-6 w-6 text-green-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-600">+{memberGrowth.predictedNewMembers}</p>
          <p className="text-xs text-slate-600">New members</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <Users className="h-6 w-6 text-red-600 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-600">-{memberGrowth.predictedChurn}</p>
          <p className="text-xs text-slate-600">Member churn</p>
        </div>
      </div>
      
      <div className="text-sm text-slate-600">
        <p>Expected net growth: <span className="font-semibold">
          +{memberGrowth.predictedNewMembers - memberGrowth.predictedChurn} members
        </span></p>
        <p className="text-xs mt-1">
          Confidence interval: {memberGrowth.confidenceInterval[0]} - {memberGrowth.confidenceInterval[1]} members
        </p>
      </div>
    </div>
  );
}

function OptimizationSuggestions({ analytics }: { analytics?: GroupAnalytics }) {
  const suggestions = [
    {
      title: "Increase Contribution Frequency",
      description: "Set up automated monthly contributions",
      impact: "15-25% funding increase",
      effort: "Low",
      icon: Calendar
    },
    {
      title: "Member Engagement Campaign", 
      description: "Launch initiatives to boost participation",
      impact: "20-30% engagement boost",
      effort: "Medium",
      icon: Users
    },
    {
      title: "Expense Optimization",
      description: "Review and optimize recurring expenses",
      impact: "10-15% cost savings",
      effort: "Low",
      icon: DollarSign
    }
  ];

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion, index) => (
        <div key={index} className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <suggestion.icon className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-slate-800 text-sm">{suggestion.title}</h5>
              <p className="text-xs text-slate-600 mt-1">{suggestion.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-green-600 font-medium">{suggestion.impact}</span>
                <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{suggestion.effort} effort</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RiskAssessmentMatrix({ analytics }: { analytics?: GroupAnalytics }) {
  if (!analytics) return <div className="text-center text-slate-500">No data available</div>;

  const { riskAssessment } = analytics.predictiveAnalytics;
  
  const riskLevels = [
    { 
      category: 'Funding Risk', 
      level: riskAssessment.fundingRisk,
      description: 'Risk of running out of funds'
    },
    { 
      category: 'Engagement Risk', 
      level: riskAssessment.engagementRisk,
      description: 'Risk of losing active members'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        {riskLevels.map((risk, index) => (
          <div key={index} className="p-4 border border-slate-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-semibold text-slate-800">{risk.category}</h5>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(risk.level)}`}>
                {risk.level}
              </span>
            </div>
            <p className="text-sm text-slate-600">{risk.description}</p>
          </div>
        ))}
      </div>

      {riskAssessment.recommendations.length > 0 && (
        <div className="pt-4 border-t">
          <h5 className="font-semibold text-slate-800 mb-2">Risk Mitigation Strategies</h5>
          <ul className="space-y-1">
            {riskAssessment.recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Mock data generators
function generateMockForecast(groupAddress: string, months: number): FundingForecast {
  const predictions = Array.from({ length: months }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() + i + 1);
    
    return {
      date: date.toISOString().substring(0, 7),
      predictedContributions: Math.random() * 5 + 2,
      predictedExpenses: Math.random() * 4 + 1,
      confidence: Math.max(0.5, 1 - (i * 0.1)),
      factors: [
        { factor: 'Seasonal Pattern', impact: Math.random() * 0.4 - 0.2, description: 'Historical seasonal trends' },
        { factor: 'Member Growth', impact: Math.random() * 0.3, description: 'Growing membership base' },
        { factor: 'Economic Conditions', impact: Math.random() * 0.2 - 0.1, description: 'General economic climate' }
      ]
    };
  });

  return {
    groupAddress,
    predictions,
    scenarios: {
      optimistic: { amount: 25, probability: 0.25 },
      realistic: { amount: 18, probability: 0.50 },
      pessimistic: { amount: 12, probability: 0.25 }
    }
  };
}

function generateMockScenarios(): Scenario[] {
  return [
    {
      name: "Growth Acceleration",
      description: "Rapid member growth with increased contributions",
      probability: 0.3,
      fundingImpact: 25,
      membershipImpact: 40,
      timeframe: "3-6 months",
      actions: [
        "Launch referral program",
        "Increase community outreach",
        "Optimize onboarding process"
      ],
      icon: TrendingUp,
      color: "bg-green-500"
    },
    {
      name: "Steady State",
      description: "Continued stable growth at current pace",
      probability: 0.5,
      fundingImpact: 5,
      membershipImpact: 10,
      timeframe: "Ongoing",
      actions: [
        "Maintain current strategies",
        "Monitor key metrics",
        "Regular member check-ins"
      ],
      icon: Activity,
      color: "bg-blue-500"
    },
    {
      name: "Market Downturn",
      description: "Economic pressures reduce contributions",
      probability: 0.2,
      fundingImpact: -15,
      membershipImpact: -5,
      timeframe: "6-12 months",
      actions: [
        "Implement cost reduction measures",
        "Focus on core activities",
        "Strengthen community bonds"
      ],
      icon: TrendingDown,
      color: "bg-orange-500"
    }
  ];
}

function generateFundingAlerts(analytics?: GroupAnalytics): FundingAlert[] {
  if (!analytics) return [];

  const alerts: FundingAlert[] = [];
  
  // Check funding runway
  const runway = analytics.fundingPatterns.totalFunds / (analytics.fundingPatterns.totalExpenses / 30);
  if (runway < 60) {
    alerts.push({
      id: 'funding-runway',
      type: runway < 30 ? 'critical' : 'warning',
      title: runway < 30 ? 'Critical: Funding Low' : 'Warning: Funding Runway Short',
      description: `Current funding will last approximately ${Math.round(runway)} days at current expense rate.`,
      timeframe: `${Math.round(runway)} days`,
      recommendedActions: [
        'Launch emergency fundraising campaign',
        'Review and reduce non-essential expenses',
        'Reach out to major contributors'
      ]
    });
  }

  // Check engagement trends
  if (analytics.memberEngagement.averageEngagementScore < 50) {
    alerts.push({
      id: 'engagement-low',
      type: 'warning',
      title: 'Low Member Engagement Detected',
      description: 'Member engagement scores are below healthy thresholds.',
      timeframe: 'Current',
      recommendedActions: [
        'Survey members for feedback',
        'Plan community engagement activities',
        'Review communication channels'
      ]
    });
  }

  return alerts;
}