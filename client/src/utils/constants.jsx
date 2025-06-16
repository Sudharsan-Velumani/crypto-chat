import { DollarSign, TrendingUp, Wallet, BarChart3 } from 'lucide-react';

export const API_BASE = 'http://localhost:5000/api';


export const quickActions = [
  { text: "What's Bitcoin trading at?", icon: <DollarSign size={16} /> },
  { text: "Show trending coins", icon: <TrendingUp size={16} /> },
  { text: "Show my portfolio", icon: <Wallet size={16} /> },
  { text: "ETH chart", icon: <BarChart3 size={16} /> }
];