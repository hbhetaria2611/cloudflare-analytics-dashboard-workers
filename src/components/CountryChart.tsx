import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CountryData } from '../types/cloudflare';

interface CountryChartProps {
  data: CountryData[];
  title?: string;
}

export const CountryChart: React.FC<CountryChartProps> = ({
  data,
  title = "Top Countries"
}) => {
  const topCountries = data.slice(0, 10);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '4px',
          padding: '12px',
          boxShadow: 'var(--shadow)'
        }}>
          <p style={{ color: 'var(--text-primary)', margin: '0 0 8px 0', fontWeight: '600' }}>
            {label}
          </p>
          <p style={{ color: 'var(--accent-blue)', margin: '0', fontSize: '14px' }}>
            Requests: {data.requests.toLocaleString()}
          </p>
          <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '14px' }}>
            {data.percentage.toFixed(1)}% of total
          </p>
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
      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topCountries}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              type="number"
              stroke="var(--text-secondary)"
              fontSize={12}
              tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
            />
            <YAxis
              type="category"
              dataKey="country"
              stroke="var(--text-secondary)"
              fontSize={12}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="requests"
              fill="var(--accent-green)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};