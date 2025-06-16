import React, { useState, useEffect, useRef,useCallback } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  Loader2,
  DollarSign
} from 'lucide-react';
import MessageBubble from './components/MessageBubble';
import { useSpeech } from './hooks/useSpeech';
import { API_BASE, quickActions } from './utils/constants';

const App = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm your crypto assistant. I can help you check prices, see trending coins, track your portfolio, and show price charts. What would you like to know? 🚀",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);


  const handleTranscript = useCallback((transcript) => {
    setInputValue(transcript);
  }, []);

  const {
    isRecording,
    isSpeaking,
    recognition,
    speak,
    toggleSpeaking,
    toggleRecording
  } = useSpeech(handleTranscript);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const sendMessage = async (messageText = inputValue) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {

      const isPortfolioQuery = messageText.toLowerCase().includes('portfolio') || 
                               messageText.toLowerCase().includes('holdings') || 
                               messageText.toLowerCase().includes('i have') ||
                               messageText.toLowerCase().includes('remove') ||
                               messageText.toLowerCase().includes('clear');

      const endpoint = isPortfolioQuery ? '/portfolio/chat' : '/crypto/chat';
      const payload = isPortfolioQuery ? 
        { message: messageText, sessionId } : 
        { message: messageText };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success && data.data) {
        const responses = Array.isArray(data.data) ? data.data : [data.data];
        
        responses.forEach((responseData, index) => {
          setTimeout(() => {
            const assistantMessage = {
              id: Date.now() + index,
              type: 'assistant',
              content: responseData.message,
              data: responseData.data,
              responseType: responseData.type,
              timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
            
            if (index === responses.length - 1) {
              setTimeout(() => speak(responseData.message), 500);
            }
          }, index * 100);
        });
      } else {
        throw new Error(data.error?.message || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now(),
        type: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">CryptoChat</h1>
          </div>
          <button
            onClick={toggleSpeaking}
            className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 max-w-xs">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => sendMessage(action.text)}
                className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {action.icon}
                <span>{action.text}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about crypto prices, trends, or manage your portfolio..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={toggleRecording}
              disabled={!recognition}
              className={`p-3 rounded-full transition-colors ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!recognition ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;