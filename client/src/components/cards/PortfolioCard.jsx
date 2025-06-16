import React from 'react';

const PortfolioCard = ({ data }) => (
  <div className="bg-gray-50 rounded-lg p-3 mt-2">
    <div className="mb-2">
      <div className="font-semibold">Portfolio Value: ${data.totalValue?.toFixed(2)}</div>
    </div>
    {data.holdings && data.holdings.length > 0 ? (
      <div className="space-y-2">
        {data.holdings.map((holding, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <div>
              <div className="font-medium text-sm">{holding.symbol}</div>
              <div className="text-xs text-gray-600">{holding.amount} coins</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-sm">${holding.value?.toFixed(2)}</div>
              <div className="text-xs text-gray-600">${holding.price?.toFixed(6)}</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-sm text-gray-600">No holdings found</div>
    )}
  </div>
);

export default PortfolioCard;