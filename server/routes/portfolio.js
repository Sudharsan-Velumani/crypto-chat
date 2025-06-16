const express = require('express');
const router = express.Router();
const portfolioService = require('../services/portfolioService');
const { successResponse, errorResponse } = require('../utils/responses');

router.get('/value/:sessionId?', async (req, res) => {
  try {
    const sessionId = req.params.sessionId || 'default';
    const portfolio = await portfolioService.getPortfolioValue(sessionId);
    res.json(successResponse(portfolio));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.get('/holdings/:sessionId?', async (req, res) => {
  try {
    const sessionId = req.params.sessionId || 'default';
    const holdings = portfolioService.getHoldings(sessionId);
    res.json(successResponse(holdings));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/holding', async (req, res) => {
  try {
    const { sessionId = 'default', symbol, amount } = req.body;
    
    if (!symbol || amount === undefined) {
      return res.status(400).json(errorResponse('Symbol and amount are required'));
    }
    
    const result = await portfolioService.updateHolding(sessionId, symbol, amount);
    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.delete('/holding', async (req, res) => {
  try {
    const { sessionId = 'default', symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json(errorResponse('Symbol is required'));
    }
    
    const result = portfolioService.removeHolding(sessionId, symbol);
    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.delete('/clear/:sessionId?', async (req, res) => {
  try {
    const sessionId = req.params.sessionId || 'default';
    const result = portfolioService.clearPortfolio(sessionId);
    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json(errorResponse('Message is required'));
    }

    const response = await processPortfolioQuery(message, sessionId);
    res.json(successResponse(response));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
});

async function processPortfolioQuery(message, sessionId) {
  const lowerMessage = message.toLowerCase();
  
  const holdingPattern = portfolioService.parseHoldingFromText(message);
  if (holdingPattern) {
    try {
      const result = await portfolioService.updateHolding(sessionId, holdingPattern.symbol, holdingPattern.amount);
      const portfolio = await portfolioService.getPortfolioValue(sessionId);
      return [{
        type: 'holding_added',
        data: result,
        portfolio: portfolio,
        message: `${result.message}! Your portfolio is now worth ${portfolio.totalValue.toFixed(2)}.`
      }];
    } catch (error) {
      return [{
        type: 'error',
        message: `${error.message}`
      }];
    }
  }

  if (lowerMessage.includes('portfolio') || lowerMessage.includes('holdings') || lowerMessage.includes('value') || lowerMessage.includes('worth')) {
    try {
      const portfolio = await portfolioService.getPortfolioValue(sessionId);
      return [{
        type: 'portfolio_value',
        data: portfolio,
        message: portfolio.holdings.length > 0 
          ? `💼 Your portfolio is worth ${portfolio.totalValue.toFixed(2)}`
          : "Your portfolio is empty. Add some holdings by saying something like 'I have 2 ETH'"
      }];
    } catch (error) {
      return [{
        type: 'error',
        message: `${error.message}`
      }];
    }
  }

  if (lowerMessage.includes('remove') || lowerMessage.includes('sell') || lowerMessage.includes('delete')) {
    const symbols = extractSymbolsFromMessage(message);
    if (symbols.length > 0) {
      try {
        const results = [];
        for (const symbol of symbols) {
          const result = portfolioService.removeHolding(sessionId, symbol);
          results.push(result);
        }
        const portfolio = await portfolioService.getPortfolioValue(sessionId);
        return [{
          type: 'holding_removed',
          data: results,
          portfolio: portfolio,
          message: `Removed holdings. Your portfolio is now worth ${portfolio.totalValue.toFixed(2)}.`
        }];
      } catch (error) {
        return [{
          type: 'error',
          message: `${error.message}`
        }];
      }
    }
  }

  if (lowerMessage.includes('clear') || lowerMessage.includes('reset')) {
    try {
      const result = portfolioService.clearPortfolio(sessionId);
      return [{
        type: 'portfolio_cleared',
        data: result,
        message: `${result.message}`
      }];
    } catch (error) {
      return [{
        type: 'error',
        message: `${error.message}`
      }];
    }
  }

  return [{
    type: 'help',
    message: `I can help you track your crypto portfolio! Try:
    
• "I have 2 ETH" - Add holdings
• "Show my portfolio" - View current value
• "Remove BTC" - Remove a holding
• "Clear portfolio" - Start fresh
    
What would you like to do? `
  }];
}

function extractSymbolsFromMessage(message) {
  const commonSymbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'SOL', 'MATIC', 'DOGE', 'SHIB', 'AVAX', 'ATOM', 'XRP', 'BNB', 'LTC', 'BCH'];
  const words = message.toUpperCase().split(/\s+/);
  
  const foundSymbols = [];
  
  for (const word of words) {
    const cleanWord = word.replace(/[^A-Z]/g, '');
    if (commonSymbols.includes(cleanWord)) {
      foundSymbols.push(cleanWord);
    }
  }
  
  return foundSymbols;
}

module.exports = router;