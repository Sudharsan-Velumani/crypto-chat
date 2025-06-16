import React from 'react';

const TopCoinsCard = ({ data }) => (
  <div className="bg-gray-50 rounded-lg p-3 mt-2">
    <div className="space-y-2">
      {data.slice(0, 5).map((coin, index) => (
        <div key={coin.id} className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
            <div>
              <div className="font-medium text-sm">{coin.symbol}</div>
              <div className="text-xs text-gray-600">{coin.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-sm">${coin.current_price?.toFixed(2)}</div>
            {coin.price_change_percentage_24h && (
              <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TopCoinsCard;