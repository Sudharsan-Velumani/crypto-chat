# Crypto Chat App

A real-time cryptocurrency chat application that allows users to interact with crypto data through natural language queries. Built with React.js + Vite frontend and Node.js + Express.js backend.

## 🚀 Features

- **Interactive Chat Interface**: Clean, mobile-friendly chat with message bubbles and timestamps
- **Voice Input**: Record voice messages with speech-to-text conversion
- **Real-time Crypto Data**:
  - Current cryptocurrency prices
  - Today's trending coins
  - Market statistics (symbol, market cap, 24h changes, descriptions)
- **Portfolio Tracking**: Record and track crypto holdings with live value updates
- **Price Charts**: 7-day price history visualization
- **Text-to-Speech**: AI assistant speaks responses aloud
- **Responsive Design**: Optimized for both desktop and mobile devices

## 🛠 Tech Stack

### Frontend
- **React.js** with **Vite** - Fast development and build tool
- **JavaScript** - Core programming language
- **CSS3** - Styling and responsive design
- **Chart.js / Recharts** - Price chart visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Axios** - HTTP client for API requests
- **CORS** - Cross-origin resource sharing

### APIs
- **CoinGecko API** - Free cryptocurrency data (prices, trends, market stats)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or **yarn**
- **Git** (for cloning the repository)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Sudharsan-Velumani/crypto-chat.git
cd crypto-chat
```

### 2. Install Dependencies

#### Backend Setup
```bash
cd server
npm install
```

#### Frontend Setup
```bash
cd client
npm install
```

### 3. Environment Configuration

#### Backend Environment Variables
Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY= <your- coingecko-api key>
```


## 🏃‍♂️ Running the Application

### Development Mode

#### 1. Start the Backend Server
```bash
cd server
npm run dev
```
The backend server will start on `http://localhost:5000`

#### 2. Start the Frontend Development Server
```bash
cd client
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Production Build

#### 1. Build the Frontend
```bash
cd client
npm run build
```

#### 2. Start the Production Server
```bash
cd client
npm start
```


## 🎯 Usage Examples

### Chat Commands
- **Price Queries**: "What's ETH trading at right now?"
- **Trending Coins**: "Show me today's trending cryptocurrencies"
- **Market Stats**: "Tell me about Bitcoin's market cap"
- **Portfolio**: "I have 2 ETH and 0.5 BTC"
- **Charts**: "Show me Bitcoin's 7-day price chart"

### Voice Features
1. Click the microphone button to record voice messages
2. Speak your crypto query naturally
3. The assistant will respond with both text and speech


## Support

For any questions or issues, please contact:
- Email: sudharsanmay10@gmail.com

## Acknowledgments

- CoinGecko for providing free cryptocurrency API
- React.js and Vite teams for excellent development tools
