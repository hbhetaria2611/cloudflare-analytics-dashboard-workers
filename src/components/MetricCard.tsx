import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'text-[var(--accent-blue)]',
    green: 'text-[var(--accent-green)]',
    orange: 'text-[var(--accent-orange)]',
    red: 'text-[var(--accent-red)]',
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="card">
      <div className="metric-label">{title}</div>
      <div className={`metric-value ${colorClasses[color]}`}>
        {formatValue(value)}
      </div>
      {subtitle && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          {subtitle}
        </div>
      )}
      {trend && (
        <div style={{
          color: trend.isPositive ? 'var(--accent-green)' : 'var(--accent-red)',
          fontSize: '12px',
          marginTop: '4px'
        }}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
};