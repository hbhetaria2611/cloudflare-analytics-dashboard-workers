import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { StatusCodeData } from '../types/cloudflare';

interface StatusCodesChartProps {
  data: StatusCodeData[];
  title?: string;
}

const STATUS_COLORS = {
  '200': 'var(--accent-green)',
  '201': 'var(--accent-green)',
  '204': 'var(--accent-green)',
  '301': 'var(--accent-blue)',
  '302': 'var(--accent-blue)',
  '304': 'var(--accent-blue)',
  '400': 'var(--accent-orange)',
  '401': 'var(--accent-orange)',
  '403': 'var(--accent-orange)',
  '404': 'var(--accent-orange)',
  '500': 'var(--accent-red)',
  '502': 'var(--accent-red)',
  '503': 'var(--accent-red)',
};

export const StatusCodesChart: React.FC<StatusCodesChartProps> = ({
  data,
  title = "HTTP Status Codes"
}) => {
  const getStatusColor = (status: string): string => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'var(--text-secondary)';
  };

  const CustomTooltip = ({ active, payload }: any) => {
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
            Status {data.status}
          </p>
          <p style={{ color: payload[0].color, margin: '0', fontSize: '14px' }}>
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

  const CustomLegend = ({ payload }: any) => {
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '16px'
      }}>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: entry.color,
              borderRadius: '2px'
            }} />
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {entry.payload.status} ({entry.payload.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div style={{ height: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="requests"
              nameKey="status"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};