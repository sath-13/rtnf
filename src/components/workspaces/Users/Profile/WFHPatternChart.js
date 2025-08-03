import React from 'react';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WFHPatternChart = ({ data }) => {
  // Dummy data for visual representation.
  const dummyData = [
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
  ];

  // In a real implementation, `data` would be computed from daily data.
  const chartData = data || dummyData;

  return (
    <Card >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" name="WFH Days">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.count > 3 ? '#ef4444' : '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: '10px', color: '#888' }}>
        * WFH pattern analysis requires daily data.
      </div>
    </Card>
  );
};

export default WFHPatternChart; 