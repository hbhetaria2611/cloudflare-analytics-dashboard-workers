import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsData } from '../types/cloudflare';
import { format } from 'date-fns';

interface BandwidthChartProps {
  data: AnalyticsData[];
  title?: string;
}

export const BandwidthChart: React.FC<BandwidthChartProps> = ({
  data,
  title = "Bandwidth Usage"
}) => {
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1000000000) {
      return `${(bytes / 1000000000).toFixed(1)}GB`;
    }
    if (bytes >= 1000000) {
      return `${(bytes / 1000000).toFixed(1)}MB`;
    }
    if (bytes >= 1000) {
      return `${(bytes / 1000).toFixed(1)}KB`;
    }
    return `${bytes}B`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          padding: '12px',
          boxShadow: 'var(--shadow)'
        }}>
          <p style={{ color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            {format(new Date(label), 'MMM dd, HH:mm')}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{
              color: entry.color,
              margin: '0',
              fontSize: '14px'
            }}>
              {entry.name}: {formatBytes(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimestamp}
              stroke="var(--text-secondary)"
              fontSize={12}
            />
            <YAxis
              stroke="var(--text-secondary)"
              fontSize={12}
              tickFormatter={formatBytes}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="bandwidth"
              stackId="1"
              stroke="var(--accent-blue)"
              fill="var(--accent-blue)"
              fillOpacity={0.6}
              name="Total Bandwidth"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};