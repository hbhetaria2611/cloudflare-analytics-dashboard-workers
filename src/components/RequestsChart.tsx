import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsData } from '../types/cloudflare';
import { format } from 'date-fns';

interface RequestsChartProps {
  data: AnalyticsData[];
  title?: string;
}

export const RequestsChart: React.FC<RequestsChartProps> = ({
  data,
  title = "Requests Over Time"
}) => {
  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
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
              {entry.name}: {entry.value.toLocaleString()}
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
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="requests"
              stroke="var(--accent-blue)"
              strokeWidth={2}
              dot={false}
              name="Total Requests"
            />
            <Line
              type="monotone"
              dataKey="cachedRequests"
              stroke="var(--accent-green)"
              strokeWidth={2}
              dot={false}
              name="Cached Requests"
            />
            <Line
              type="monotone"
              dataKey="uncachedRequests"
              stroke="var(--accent-orange)"
              strokeWidth={2}
              dot={false}
              name="Uncached Requests"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};