'use client';

import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiLoader } from 'react-icons/fi';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hi! 👋 Welcome to IMS Support. How can I help you today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to use the chatbot');
        setIsLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();

      // Add bot response
      const botMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: data.reply || 'Sorry, I could not generate a response. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again later or contact support.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          color: '#c4b5fd'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Chat with IMS Support"
      >
        {isOpen ? (
          <FiX className="w-6 h-6" />
        ) : (
          <FiMessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 w-96 h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transform transition-all duration-300"
          style={{
            background: 'rgba(15, 15, 23, 0.95)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, rgba(109, 40, 217, 0.15), rgba(124, 58, 237, 0.15))',
              borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                }}
              >
                <FiMessageCircle className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">IMS Support</h3>
                <p className="text-gray-400 text-xs">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Messages Container */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-lg text-sm leading-relaxed ${
                    msg.type === 'user'
                      ? 'text-white rounded-br-none'
                      : 'text-gray-200 rounded-bl-none'
                  }`}
                  style={{
                    background:
                      msg.type === 'user'
                        ? 'linear-gradient(135deg, #6d28d9, #7c3aed)'
                        : 'rgba(139, 92, 246, 0.15)',
                    border:
                      msg.type === 'user'
                        ? '1px solid rgba(139, 92, 246, 0.4)'
                        : '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="px-4 py-3 rounded-lg rounded-bl-none flex items-center gap-2"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <FiLoader className="w-4 h-4 text-purple-400 animate-spin" />
                  <span className="text-gray-400 text-sm">Thinking...</span>
                </div>
              </div>
            )}

            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm text-red-300"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div
            className="px-4 py-4 border-t"
            style={{
              borderColor: 'rgba(139, 92, 246, 0.2)',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 rounded-lg text-sm text-white placeholder-gray-400 border transition-colors cursor-text disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  color: '#ffffff',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.currentTarget.style.color = '#ffffff';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="p-2 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#c4b5fd',
                }}
                title="Send message"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Styles for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }

        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.05);
        }

        div::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </>
  );
}
