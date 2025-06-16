import React from 'react';

const CoinDetailsCard = ({ data }) => (
  <div className="bg-gray-50 rounded-lg p-3 mt-2">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{data.name} ({data.symbol})</div>
        <div className="text-sm text-gray-600">Rank #{data.market_cap_rank}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-gray-600">Price</div>
          <div className="font-medium">${data.current_price?.toFixed(6)}</div>
        </div>
        <div>
          <div className="text-gray-600">24h Change</div>
          <div className={`font-medium ${data.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.price_change_percentage_24h >= 0 ? '+' : ''}{data.price_change_percentage_24h?.toFixed(2)}%
          </div>
        </div>
      </div>
      {data.description && (
        <div className="text-xs text-gray-600 mt-2">
          {data.description}
        </div>
      )}
    </div>
  </div>
);

export default CoinDetailsCard;