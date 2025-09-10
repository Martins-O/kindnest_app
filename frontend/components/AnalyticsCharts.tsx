'use client';

import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatETH, formatDate } from '@/lib/utils';

interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  color?: string;
  metadata?: any;
}

interface PieChartData {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

interface LineChartProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
  showTrend?: boolean;
  valueFormatter?: (value: number) => string;
  color?: string;
}

interface BarChartProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  orientation?: 'horizontal' | 'vertical';
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
  showLegend?: boolean;
  innerRadius?: number;
}

// Line Chart Component
export function LineChart({ 
  title, 
  data, 
  height = 200, 
  showTrend = true, 
  valueFormatter = (v) => v.toString(),
  color = 'rgb(99, 102, 241)'
}: LineChartProps) {
  const { trend, trendPercentage } = useMemo(() => {
    if (data.length < 2) return { trend: 'stable', trendPercentage: 0 };
    
    const recent = data.slice(-5);
    const firstValue = recent[0].value;
    const lastValue = recent[recent.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      trend: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
      trendPercentage: Math.abs(change)
    };
  }, [data]);

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const getPointY = (value: number) => {
    if (range === 0) return height / 2;
    return height - ((value - minValue) / range) * height;
  };

  const pathData = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = getPointY(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x}% ${y}px`;
  }).join(' ');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            {title}
          </CardTitle>
          {showTrend && (
            <div className={`flex items-center gap-1 text-sm ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 'text-slate-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
               trend === 'down' ? <TrendingDown className="h-3 w-3" /> :
               <Activity className="h-3 w-3" />}
              <span>{trendPercentage.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: height + 40 }}>
          {/* Chart Area */}
          <svg 
            className="w-full absolute inset-0" 
            style={{ height }}
            preserveAspectRatio="none"
          >
            {/* Grid Lines */}
            {[...Array(5)].map((_, i) => (
              <line
                key={i}
                x1="0%"
                y1={`${(i / 4) * 100}%`}
                x2="100%"
                y2={`${(i / 4) * 100}%`}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Area Fill */}
            <defs>
              <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            
            <path
              d={`${pathData} L 100% 100% L 0% 100% Z`}
              fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
            />
            
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            
            {/* Data Points */}
            {data.map((point, index) => (
              <circle
                key={index}
                cx={`${(index / (data.length - 1)) * 100}%`}
                cy={getPointY(point.value)}
                r="3"
                fill={color}
                stroke="white"
                strokeWidth="2"
              >
                <title>{`${point.date}: ${valueFormatter(point.value)}`}</title>
              </circle>
            ))}
          </svg>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 mt-2">
            {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((point, index) => (
              <span key={index}>{new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Bar Chart Component
export function BarChart({ 
  title, 
  data, 
  height = 200, 
  showValues = true,
  valueFormatter = (v) => v.toString(),
  orientation = 'vertical'
}: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  if (orientation === 'horizontal') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-xs text-slate-600 truncate" title={item.label || item.date}>
                  {item.label || new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="flex-1 relative">
                  <div className="w-full bg-slate-100 rounded-full h-6">
                    <div
                      className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{
                        width: `${(item.value / maxValue) * 100}%`,
                        backgroundColor: item.color || 'rgb(99, 102, 241)'
                      }}
                    >
                      {showValues && (
                        <span className="text-xs text-white font-medium">
                          {valueFormatter(item.value)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height: height + 40 }}>
          <div className="flex items-end justify-between h-full pb-6 gap-1">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full transition-all duration-500 rounded-t flex items-end justify-center relative group"
                  style={{
                    height: `${(item.value / maxValue) * height}px`,
                    backgroundColor: item.color || 'rgb(99, 102, 241)',
                    minHeight: '4px'
                  }}
                >
                  {showValues && (
                    <span className="absolute -top-6 text-xs font-medium text-slate-700">
                      {valueFormatter(item.value)}
                    </span>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {item.label || item.date}: {valueFormatter(item.value)}
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-1 text-center truncate w-full">
                  {item.label || new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pie Chart Component
export function PieChart({ 
  title, 
  data, 
  showLegend = true, 
  innerRadius = 0 
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  let cumulativePercentage = 0;

  const createArcPath = (
    centerX: number,
    centerY: number,
    radius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number
  ) => {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180);
    const endAngleRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    if (innerRadius > 0) {
      const x3 = centerX + innerRadius * Math.cos(endAngleRad);
      const y3 = centerY + innerRadius * Math.sin(endAngleRad);
      const x4 = centerX + innerRadius * Math.cos(startAngleRad);
      const y4 = centerY + innerRadius * Math.sin(startAngleRad);

      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
    } else {
      return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex ${showLegend ? 'items-start gap-6' : 'justify-center'}`}>
          {/* Chart */}
          <div className="flex-shrink-0">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const startAngle = (cumulativePercentage / 100) * 360;
                const endAngle = startAngle + (percentage / 100) * 360;

                const path = createArcPath(
                  centerX,
                  centerY,
                  radius,
                  innerRadius,
                  startAngle,
                  endAngle
                );

                cumulativePercentage += percentage;

                return (
                  <g key={index}>
                    <path
                      d={path}
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <title>{`${item.label}: ${item.percentage.toFixed(1)}%`}</title>
                    </path>
                  </g>
                );
              })}
              
              {/* Center circle for donut chart */}
              {innerRadius > 0 && (
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={innerRadius}
                  fill="white"
                />
              )}
            </svg>
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div className="text-sm">
                    <span className="text-slate-800">{item.label}</span>
                    <div className="text-xs text-slate-500">
                      {item.percentage.toFixed(1)}% • {formatETH(BigInt(Math.floor(item.value * 1e18)))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Metric Card with Sparkline
interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  trend?: ChartDataPoint[];
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  trend = [], 
  icon: Icon,
  color = 'rgb(99, 102, 241)'
}: MetricCardProps) {
  const maxValue = Math.max(...trend.map(d => d.value));
  const minValue = Math.min(...trend.map(d => d.value));
  const range = maxValue - minValue;

  const sparklinePoints = trend.map((point, index) => {
    const x = (index / (trend.length - 1)) * 100;
    const y = range === 0 ? 50 : 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg" style={{ backgroundColor: color + '20', color }}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="text-sm text-slate-600">{title}</p>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
          
          {/* Sparkline */}
          {trend.length > 1 && (
            <div className="w-20 h-12">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  points={sparklinePoints}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Change indicator */}
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Heatmap Component
interface HeatmapProps {
  title: string;
  data: Array<{
    x: string;
    y: string;
    value: number;
    label?: string;
  }>;
  colorScale?: string[];
}

export function Heatmap({ 
  title, 
  data, 
  colorScale = ['#f3f4f6', '#ddd6fe', '#c4b5fd', '#a78bfa', '#8b5cf6'] 
}: HeatmapProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  
  const xLabels = Array.from(new Set(data.map(d => d.x)));
  const yLabels = Array.from(new Set(data.map(d => d.y)));

  const getColor = (value: number) => {
    if (maxValue === minValue) return colorScale[0];
    const normalized = (value - minValue) / (maxValue - minValue);
    const index = Math.floor(normalized * (colorScale.length - 1));
    return colorScale[Math.min(index, colorScale.length - 1)];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {yLabels.map((yLabel) => (
            <div key={yLabel} className="flex items-center gap-2">
              <div className="w-16 text-xs text-slate-600 text-right">{yLabel}</div>
              <div className="flex gap-1">
                {xLabels.map((xLabel) => {
                  const dataPoint = data.find(d => d.x === xLabel && d.y === yLabel);
                  const value = dataPoint?.value || 0;
                  
                  return (
                    <div
                      key={`${xLabel}-${yLabel}`}
                      className="w-8 h-8 rounded border border-white flex items-center justify-center text-xs font-medium cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: getColor(value) }}
                      title={`${xLabel}, ${yLabel}: ${dataPoint?.label || value}`}
                    >
                      {value > 0 && value < 10 ? value.toFixed(1) : value > 0 ? Math.round(value) : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-16"></div>
            <div className="flex gap-1">
              {xLabels.map((xLabel) => (
                <div key={xLabel} className="w-8 text-xs text-slate-600 text-center">
                  {xLabel}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}