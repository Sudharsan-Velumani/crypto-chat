import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartCard = ({ data }) => {
  const chartData = data.chart?.map(point => ({
    date: new Date(point.timestamp).toLocaleDateString(),
    price: point.price
  })) || [];

  return (
    <div className="bg-gray-50 rounded-lg p-3 mt-2">
      <div className="mb-2">
        <div className="font-semibold text-sm">{data.symbol} - 7 Day Chart</div>
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={10} />
            <YAxis fontSize={10} />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;