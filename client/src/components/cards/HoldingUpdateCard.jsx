import React from 'react';

const HoldingUpdateCard = ({ data }) => (
  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
    <div className="text-sm">
      <div className="font-medium text-green-800">{data.data?.message}</div>
      {data.portfolio && (
        <div className="mt-1 text-green-700">
          Portfolio Value: ${data.portfolio.totalValue?.toFixed(2)}
        </div>
      )}
    </div>
  </div>
);

export default HoldingUpdateCard;