import React from 'react';
import PriceCard from './cards/PriceCard';
import TopCoinsCard from './cards/TopCoinsCard';
import TrendingCoinsCard from './cards/TrendingCoinsCard';
import CoinDetailsCard from './cards/CoinDetailsCard';
import ChartCard from './cards/ChartCard';
import PortfolioCard from './cards/PortfolioCard';
import HoldingUpdateCard from './cards/HoldingUpdateCard';

const MessageContent = ({ data, type }) => {
  if (!data || !type) return null;

  switch (type) {
    case 'price':
      return <PriceCard data={data} />;
    case 'top_coins':
      return <TopCoinsCard data={data} />;
    case 'trending':
      return <TrendingCoinsCard data={data} />;
    case 'coin_details':
      return <CoinDetailsCard data={data} />;
    case 'chart':
      return <ChartCard data={data} />;
    case 'portfolio_value':
      return <PortfolioCard data={data} />;
    case 'holding_added':
      return <HoldingUpdateCard data={data} />;
    default:
      return null;
  }
};

export default MessageContent;