import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const PriceCard = ({ data }) => (
  <div className="bg-gray-50 rounded-lg p-3 mt-2">
    <div className="flex items-center justify-between">
      <div>
        <div className="font-semibold text-lg">${data.usd?.toFixed(6)}</div>
        <div className="text-sm text-gray-600">{data.symbol}</div>
      </div>
      {data.usd_24h_change && (
        <div className={`flex items-center space-x-1 ${data.usd_24h_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {data.usd_24h_change >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          <span className="text-sm font-medium">{Math.abs(data.usd_24h_change).toFixed(2)}%</span>
        </div>
      )}
    </div>
  </div>
);

export default PriceCard;