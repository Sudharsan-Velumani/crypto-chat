const axios = require('axios');

const BASE_URL = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';

class CryptoService {
  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CryptoChat/1.0'
      }
    });


    this.cache = new Map();
    this.cacheTimeout = 60000; 
    
    // Rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 1100; 
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Cache helper
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  
  async makeRequestWithRetry(requestFn, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.waitForRateLimit();
        return await requestFn();
      } catch (error) {
        console.log(`API request attempt ${attempt} failed:`, error.response?.status, error.message);
        
        if (error.response?.status === 429) {
          const backoffTime = Math.min(1000 * Math.pow(2, attempt), 10000);
          console.log(`Rate limited, waiting ${backoffTime}ms before retry ${attempt}/${maxRetries}`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          
          if (attempt === maxRetries) {
            throw new Error('API rate limit exceeded. Please try again in a few moments.');
          }
          continue;
        }
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async getCurrentPrice(coinId) {
    const cacheKey = `price_${coinId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.makeRequestWithRetry(async () => {
        return await this.client.get(`/simple/price`, {
          params: {
            ids: coinId,
            vs_currencies: 'usd',
            include_24hr_change: true,
            include_market_cap: true,
            include_24hr_vol: true
          }
        });
      });

      const data = response.data[coinId];
      if (!data) {
        throw new Error(`No price data found for ${coinId}`);
      }

      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch price for ${coinId}: ${error.message}`);
    }
  }

  async getMultiplePrices(coinIds) {
    const cacheKey = `prices_${coinIds.sort().join(',')}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {

      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < coinIds.length; i += batchSize) {
        batches.push(coinIds.slice(i, i + batchSize));
      }

      let allData = {};
      
      for (const batch of batches) {
        const response = await this.makeRequestWithRetry(async () => {
          return await this.client.get(`/simple/price`, {
            params: {
              ids: batch.join(','),
              vs_currencies: 'usd',
              include_24hr_change: true,
              include_market_cap: true
            }
          });
        });
        
        allData = { ...allData, ...response.data };
        
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      this.setCachedData(cacheKey, allData);
      return allData;
    } catch (error) {
      throw new Error(`Failed to fetch prices: ${error.message}`);
    }
  }

  async getTrendingCoins() {
    const cacheKey = 'trending_coins';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {

      const trendingResponse = await this.makeRequestWithRetry(async () => {
        return await this.client.get('/search/trending');
      });
      
      const trendingCoinIds = trendingResponse.data.coins.slice(0, 10).map(coin => coin.item.id);
      
      const marketResponse = await this.makeRequestWithRetry(async () => {
        return await this.client.get('/coins/markets', {
          params: {
            vs_currency: 'usd',
            ids: trendingCoinIds.join(','),
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          }
        });
      });

      const descriptionPromises = trendingCoinIds.slice(0, 5).map(async (coinId) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          const response = await this.makeRequestWithRetry(async () => {
            return await this.client.get(`/coins/${coinId}`, {
              params: {
                localization: false,
                tickers: false,
                market_data: false,
                community_data: false,
                developer_data: false,
                sparkline: false
              }
            });
          });
          return {
            id: coinId,
            description: response.data.description?.en?.split('.')[0] + '.' || 'No description available'
          };
        } catch (error) {
          return {
            id: coinId,
            description: 'Description not available'
          };
        }
      });

      const descriptions = await Promise.all(descriptionPromises);

      const descriptionMap = {};
      descriptions.forEach((desc) => {
        if (desc) {
          descriptionMap[desc.id] = desc.description;
        }
      });

      const enrichedTrendingCoins = marketResponse.data.map((coin, index) => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        total_volume: coin.total_volume,
        description: descriptionMap[coin.id] || 'Description not available',
        trending_rank: index + 1
      }));

      this.setCachedData(cacheKey, enrichedTrendingCoins);
      return enrichedTrendingCoins;
    } catch (error) {
      throw new Error(`Failed to fetch trending coins: ${error.message}`);
    }
  }

  async getCoinDetails(coinId) {
    const cacheKey = `details_${coinId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.makeRequestWithRetry(async () => {
        return await this.client.get(`/coins/${coinId}`, {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false
          }
        });
      });
      
      const coin = response.data;
      const details = {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image?.large,
        current_price: coin.market_data?.current_price?.usd,
        market_cap: coin.market_data?.market_cap?.usd,
        market_cap_rank: coin.market_data?.market_cap_rank,
        price_change_24h: coin.market_data?.price_change_24h,
        price_change_percentage_24h: coin.market_data?.price_change_percentage_24h,
        total_volume: coin.market_data?.total_volume?.usd,
        description: coin.description?.en?.split('.')[0] + '.' || 'No description available'
      };

      this.setCachedData(cacheKey, details);
      return details;
    } catch (error) {
      throw new Error(`Failed to fetch coin details for ${coinId}: ${error.message}`);
    }
  }

  async getPriceChart(coinId, days = 7) {
    const cacheKey = `chart_${coinId}_${days}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.makeRequestWithRetry(async () => {
        return await this.client.get(`/coins/${coinId}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: days <= 1 ? 'hourly' : 'daily'
          }
        });
      });
      
      const chartData = response.data.prices.map(([timestamp, price]) => ({
        timestamp,
        price: parseFloat(price.toFixed(6)),
        date: new Date(timestamp).toISOString()
      }));

      this.setCachedData(cacheKey, chartData);
      return chartData;
    } catch (error) {
      throw new Error(`Failed to fetch chart data for ${coinId}: ${error.message}`);
    }
  }

  async searchCoins(query) {
    const cacheKey = `search_${query.toLowerCase()}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.makeRequestWithRetry(async () => {
        return await this.client.get('/search', {
          params: { query }
        });
      });
      
      const results = response.data.coins.slice(0, 10).map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol.toUpperCase(),
        thumb: coin.thumb,
        market_cap_rank: coin.market_cap_rank
      }));

      this.setCachedData(cacheKey, results);
      return results;
    } catch (error) {
      throw new Error(`Failed to search coins: ${error.message}`);
    }
  }

  async getTopCoins(limit = 10) {
    const cacheKey = `top_coins_${limit}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.makeRequestWithRetry(async () => {
        return await this.client.get('/coins/markets', {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: limit,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          }
        });
      });
      
      const topCoins = response.data.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        total_volume: coin.total_volume
      }));

      this.setCachedData(cacheKey, topCoins);
      return topCoins;
    } catch (error) {
      throw new Error(`Failed to fetch top coins: ${error.message}`);
    }
  }
}

module.exports = new CryptoService();