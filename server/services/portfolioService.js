const cryptoService = require('./cryptoService');

const portfolios = new Map();

class PortfolioService {
  constructor() {

  }

  getPortfolio(sessionId) {
    if (!portfolios.has(sessionId)) {
      portfolios.set(sessionId, new Map());
    }
    return portfolios.get(sessionId);
  }


  getHoldings(sessionId) {
    const portfolio = this.getPortfolio(sessionId);
    const holdings = [];
    
    portfolio.forEach((amount, symbol) => {
      holdings.push({
        symbol: symbol.toUpperCase(),
        amount: amount
      });
    });
    
    return holdings;
  }


  async updateHolding(sessionId, symbol, amount) {
    const portfolio = this.getPortfolio(sessionId);
    const upperSymbol = symbol.toUpperCase();
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 0) {
      throw new Error('Invalid amount. Please enter a positive number.');
    }
    
    const oldAmount = portfolio.get(upperSymbol) || 0;
    portfolio.set(upperSymbol, numAmount);
    
    const action = oldAmount === 0 ? 'Added' : 'Updated';
    
    return {
      symbol: upperSymbol,
      amount: numAmount,
      oldAmount: oldAmount,
      message: `${action} ${numAmount} ${upperSymbol} to your portfolio`
    };
  }

  removeHolding(sessionId, symbol) {
    const portfolio = this.getPortfolio(sessionId);
    const upperSymbol = symbol.toUpperCase();
    
    if (portfolio.has(upperSymbol)) {
      const amount = portfolio.get(upperSymbol);
      portfolio.delete(upperSymbol);
      return {
        symbol: upperSymbol,
        amount: amount,
        message: `Removed ${amount} ${upperSymbol} from your portfolio`
      };
    } else {
      throw new Error(`${upperSymbol} not found in your portfolio`);
    }
  }


  clearPortfolio(sessionId) {
    const portfolio = this.getPortfolio(sessionId);
    const count = portfolio.size;
    portfolio.clear();
    
    return {
      message: count > 0 ? `Cleared ${count} holdings from your portfolio` : 'Your portfolio was already empty'
    };
  }

  async getPortfolioValue(sessionId) {
    const portfolio = this.getPortfolio(sessionId);
    
    if (portfolio.size === 0) {
      return {
        totalValue: 0,
        holdings: [],
        lastUpdated: new Date().toISOString()
      };
    }
    
    try {

      const symbols = Array.from(portfolio.keys());

      const coinIds = [];
      for (const symbol of symbols) {
        const coinId = await this.getCoinIdFromSymbol(symbol);
        coinIds.push(coinId);
      }
      
      const prices = await cryptoService.getMultiplePrices(coinIds);
      
      let totalValue = 0;
      const holdings = [];
      
      symbols.forEach((symbol, index) => {
        const amount = portfolio.get(symbol);
        const coinId = coinIds[index];
        const priceData = prices[coinId];
        
        if (priceData && priceData.usd) {
          const value = amount * priceData.usd;
          totalValue += value;
          
          holdings.push({
            symbol: symbol,
            amount: amount,
            price: priceData.usd,
            value: value,
            change24h: priceData.usd_24h_change || 0
          });
        } else {
          holdings.push({
            symbol: symbol,
            amount: amount,
            price: 0,
            value: 0,
            change24h: 0,
            error: 'Price data unavailable'
          });
        }
      });
      
      return {
        totalValue: totalValue,
        holdings: holdings,
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      throw new Error(`Failed to fetch portfolio value: ${error.message}`);
    }
  }

  // Parse holding from natural language text
  parseHoldingFromText(text) {
    const patterns = [
      /i have (\d+(?:\.\d+)?)\s+(\w+)/i,
      /add (\d+(?:\.\d+)?)\s+(\w+)/i,
      /(\d+(?:\.\d+)?)\s+(\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1]);
        const symbol = match[2].toUpperCase();
        
        if (!isNaN(amount) && amount > 0) {
          return { amount, symbol };
        }
      }
    }
    
    return null;
  }

  async getCoinIdFromSymbol(symbol) {
    const symbolToCoinId = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'SOL': 'solana',
      'MATIC': 'matic-network',
      'DOGE': 'dogecoin',
      'SHIB': 'shiba-inu',
      'AVAX': 'avalanche-2',
      'ATOM': 'cosmos',
      'XRP': 'ripple',
      'BNB': 'binancecoin',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'UNI': 'uniswap',
      'AAVE': 'aave',
      'SUSHI': 'sushi',
      'COMP': 'compound-governance-token',
      'MKR': 'maker'
    };
    
    return symbolToCoinId[symbol.toUpperCase()] || symbol.toLowerCase();
  }
}

module.exports = new PortfolioService();