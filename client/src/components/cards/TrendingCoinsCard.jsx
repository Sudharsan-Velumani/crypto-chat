import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const TrendingCoinsCard = ({ data }) => {
  const formatMarketCap = (marketCap) => {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 mt-2 max-w-full">
      <div className="space-y-3">
        {data.slice(0, 5).map((coin, index) => (
          <div key={coin.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
            {/* Header with rank and basic info */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                  #{coin.trending_rank || index + 1}
                </span>
                <div>
                  <div className="font-bold text-sm text-gray-900">{coin.symbol}</div>
                  <div className="text-xs text-gray-600">{coin.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{formatPrice(coin.current_price)}</div>
                <div className="text-xs text-gray-500">
                  Rank #{coin.market_cap_rank || 'N/A'}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <div className="text-xs text-gray-500 font-medium">Market Cap</div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatMarketCap(coin.market_cap)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">24h Change</div>
                <div className={`text-sm font-semibold flex items-center space-x-1 ${
                  coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {coin.price_change_percentage_24h >= 0 ? (
                    <ArrowUp size={12} />
                  ) : (
                    <ArrowDown size={12} />
                  )}
                  <span>
                    {coin.price_change_percentage_24h ? 
                      `${Math.abs(coin.price_change_percentage_24h).toFixed(2)}%` : 
                      'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {coin.description && coin.description !== 'Description not available' && (
              <div className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
                <span className="font-medium text-gray-700">About: </span>
                {coin.description.length > 100 ? 
                  `${coin.description.substring(0, 100)}...` : 
                  coin.description
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCoinsCard;