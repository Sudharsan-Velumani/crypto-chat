import React from 'react';
import MessageContent from './MessageContent';

const MessageBubble = ({ message }) => {
  const isUser = message.type === 'user';
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
          

          {message.data && (
            <div className="mt-3">
              <MessageContent data={message.data} type={message.responseType} />
            </div>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;