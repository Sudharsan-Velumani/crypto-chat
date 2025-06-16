const express = require('express');
const router = express.Router();
const cryptoService = require('../services/cryptoService');
const { successResponse, errorResponse } = require('../utils/responses');

const handleRateLimit = (error, res) => {
  if (error.message.includes('rate limit') || error.message.includes('429')) {
    return res.status(429).json(errorResponse(
      'API rate limit reached. Please wait a moment and try again.',
      'RATE_LIMIT_EXCEEDED'
    ));
  }
  return res.status(500).json(errorResponse(error.message));
};


router.get('/price/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const price = await cryptoService.getCurrentPrice(coinId);
    res.json(successResponse(price));
  } catch (error) {
    handleRateLimit(error, res);
  }
});

router.post('/prices', async (req, res) => {
  try {
    const { coinIds } = req.body;
    if (!coinIds || !Array.isArray(coinIds)) {
      return res.status(400).json(errorResponse('coinIds array is required'));
    }
    const prices = await cryptoService.getMultiplePrices(coinIds);
    res.json(successResponse(prices));
  } catch (error) {
    handleRateLimit(error, res);
  }
});

router.get('/trending', async (req, res) => {
  try {
    const trending = await cryptoService.getTrendingCoins();
    res.json(successResponse(trending));
  } catch (error) {
    handleRateLimit(error, res);
  }
});

router.get('/details/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const details = await cryptoService.getCoinDetails(coinId);
    res.json(successResponse(details));
  } catch (error) {
    handleRateLimit(error, res);
  }
});

router.get('/chart/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const { days = 7 } = req.query;
    const chart = await cryptoService.getPriceChart(coinId, days);
    res.json(successResponse(chart));
  } catch (error) {
    handleRateLimit(error, res);
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json(errorResponse('Query parameter q is required'));
    }
    const results = await cryptoService.searchCoins(q);
    res.json(successResponse(results));
  } catch (error) {
    handleRateLimit(error, res);
  }
});

router.get('/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topCoins = await cryptoService.getTopCoins(limit);
    res.json(successResponse(topCoins));
  } catch (error) {
    handleRateLimit(error, res);
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json(errorResponse('Message is required'));
    }

    const response = await processCryptoQuery(message);
    res.json(successResponse(response));
  } catch (error) {
    handleRateLimit(error, res);
  }
});

async function processCryptoQuery(message) {
  const lowerMessage = message.toLowerCase();
  
  try {
    if (lowerMessage.includes('price') || lowerMessage.includes('trading') || lowerMessage.includes('worth')) {
      const coinSymbol = extractCoinSymbol(message);
      if (coinSymbol) {
        try {
          const coinId = await getCoinIdFromSymbol(coinSymbol);
          const price = await cryptoService.getCurrentPrice(coinId);
          return [{
            type: 'price',
            data: { ...price, symbol: coinSymbol.toUpperCase(), coinId },
            message: `${coinSymbol.toUpperCase()} is currently trading at $${price.usd.toFixed(6)}`
          }];
        } catch (error) {
          if (error.message.includes('rate limit')) {
            return [{
              type: 'error',
              message: `API rate limit reached. Please wait a moment and try asking about ${coinSymbol.toUpperCase()} again.`
            }];
          }
          return [{
            type: 'error',
            message: `Sorry, I couldn't find price information for ${coinSymbol.toUpperCase()}`
          }];
        }
      }
      
      try {
        const topCoins = await cryptoService.getTopCoins(5);
        return [{
          type: 'top_coins',
          data: topCoins,
          message: 'Here are the top cryptocurrencies by market cap:'
        }];
      } catch (error) {
        if (error.message.includes('rate limit')) {
          return [{
            type: 'error',
            message: 'API rate limit reached. Please wait a moment before requesting price data again.'
          }];
        }
        return [{
          type: 'error',
          message: 'Sorry, I couldn\'t fetch cryptocurrency prices right now'
        }];
      }
    }
    
    if (lowerMessage.includes('trending') || lowerMessage.includes('popular') || lowerMessage.includes('hot')) {
      try {
        const trending = await cryptoService.getTrendingCoins();
        return [{
          type: 'trending',
          data: trending,
          message: 'Here are today\'s trending cryptocurrencies:'
        }];
      } catch (error) {
        if (error.message.includes('rate limit')) {
          return [{
            type: 'error',
            message: 'API rate limit reached. Please wait a moment before requesting trending data again.'
          }];
        }
        return [{
          type: 'error',
          message: 'Sorry, I couldn\'t fetch trending coins right now'
        }];
      }
    }
    
    if (lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('history')) {
      const coinSymbol = extractCoinSymbol(message);
      if (coinSymbol) {
        try {
          const coinId = await getCoinIdFromSymbol(coinSymbol);
          const chart = await cryptoService.getPriceChart(coinId, 7);
          return [{
            type: 'chart',
            data: { chart, symbol: coinSymbol.toUpperCase(), coinId },
            message: `Here's the 7-day price chart for ${coinSymbol.toUpperCase()}:`
          }];
        } catch (error) {
          if (error.message.includes('rate limit')) {
            return [{
              type: 'error',
              message: `API rate limit reached. Please wait a moment and try asking for ${coinSymbol.toUpperCase()} chart again.`
            }];
          }
          return [{
            type: 'error',
            message: `Sorry, I couldn't fetch chart data for ${coinSymbol.toUpperCase()}`
          }];
        }
      }
    }
    
    const coinSymbol = extractCoinSymbol(message);
    if (coinSymbol) {
      try {
        const coinId = await getCoinIdFromSymbol(coinSymbol);
        const details = await cryptoService.getCoinDetails(coinId);
        return [{
          type: 'coin_details',
          data: details,
          message: `Here's information about ${details.name} (${details.symbol}):`
        }];
      } catch (error) {
        if (error.message.includes('rate limit')) {
          return [{
            type: 'error',
            message: `API rate limit reached. Please wait a moment and try asking about ${coinSymbol.toUpperCase()} again.`
          }];
        }
        return [{
          type: 'error',
          message: `Sorry, I couldn't find information about ${coinSymbol.toUpperCase()}`
        }];
      }
    }
    
    return [{
      type: 'help',
      message: `I can help you with cryptocurrency information! Try asking:
      
• "What's Bitcoin trading at?" - Get current prices
• "Show me trending coins" - See what's popular
• "ETH chart" - View price charts
• "Tell me about Solana" - Get coin details
      
What would you like to know?`
    }];
    
  } catch (error) {
    if (error.message.includes('rate limit')) {
      return [{
        type: 'error',
        message: 'API rate limit reached. Please wait a moment and try again.'
      }];
    }
    return [{
      type: 'error',
      message: `Sorry, I encountered an error: ${error.message}`
    }];
  }
}

function extractCoinSymbol(message) {
  const commonCoins = {
    'bitcoin': 'btc', 'btc': 'btc',
    'ethereum': 'eth', 'eth': 'eth',
    'cardano': 'ada', 'ada': 'ada',
    'polkadot': 'dot', 'dot': 'dot',
    'chainlink': 'link', 'link': 'link',
    'solana': 'sol', 'sol': 'sol',
    'polygon': 'matic', 'matic': 'matic',
    'dogecoin': 'doge', 'doge': 'doge',
    'shiba': 'shib', 'shib': 'shib',
    'avalanche': 'avax', 'avax': 'avax',
    'cosmos': 'atom', 'atom': 'atom',
    'ripple': 'xrp', 'xrp': 'xrp',
    'binance': 'bnb', 'bnb': 'bnb',
    'litecoin': 'ltc', 'ltc': 'ltc'
  };
  
  const lowerMessage = message.toLowerCase();
  
  for (const [name, symbol] of Object.entries(commonCoins)) {
    if (lowerMessage.includes(name)) {
      return symbol;
    }
  }
  
  return null;
}

async function getCoinIdFromSymbol(symbol) {
  const symbolToCoinId = {
    'btc': 'bitcoin',
    'eth': 'ethereum',
    'ada': 'cardano',
    'dot': 'polkadot',
    'link': 'chainlink',
    'sol': 'solana',
    'matic': 'matic-network',
    'doge': 'dogecoin',
    'shib': 'shiba-inu',
    'avax': 'avalanche-2',
    'atom': 'cosmos',
    'xrp': 'ripple',
    'bnb': 'binancecoin',
    'ltc': 'litecoin'
  };
  
  return symbolToCoinId[symbol.toLowerCase()] || symbol.toLowerCase();
}

module.exports = router;