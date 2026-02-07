'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IoSend } from 'react-icons/io5';
import { BiArrowBack } from 'react-icons/bi';

interface Friend {
  id: string;
  legalName: string;
  preferredName?: string;
  nickname?: string;
  context: string;
  accountPrivacy: string;
  createdAt?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  senderUserId: string;
  senderIdentityId: string;
  message: string;
  createdAt: string;
}

export default function OnlineMessagesPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<{ [key: string]: Friend }>({});
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUserId(userData.id);
    }
    if (token) {
      fetchConversations();
    } else {
      router.push('/auth');
    }
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.id);
    }
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all friends
      const friendsResponse = await fetch(`${API_BASE_URL}/friends/online`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Fetch conversations with message history
      const conversationsResponse = await fetch(`${API_BASE_URL}/messages/conversations/online`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (friendsResponse.ok) {
        const data = await friendsResponse.json();
        setFriends(data.friends || []);
      }

      if (conversationsResponse.ok) {
        const data = await conversationsResponse.json();
        // Create a map of conversations by id for quick lookup
        const conversationsMap: { [key: string]: Friend } = {};
        data.conversations?.forEach((conv: Friend) => {
          conversationsMap[conv.id] = conv;
        });
        setConversations(conversationsMap);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (friendIdentityId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/online/${friendIdentityId}?limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedFriend) return;

    try {
      setIsSending(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientIdentityId: selectedFriend.id,
          message: messageText,
          context: 'online',
        }),
      });

      if (response.ok) {
        setMessageText('');
        await fetchMessages(selectedFriend.id);
        await fetchConversations();
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">
      <div className="max-w-6xl mx-auto px-4 py-4 h-screen flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900">Online Messages</h1>
        </div>

        <div className="flex gap-4 flex-1 overflow-hidden">
          <div className="w-72 dark:bg-gray-800 bg-gray-50 rounded-lg border dark:border-gray-700 border-gray-200 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center dark:text-gray-400 text-gray-600">Loading conversations...</div>
            ) : friends.length === 0 ? (
              <div className="p-4 text-center dark:text-gray-400 text-gray-600">No friends in online context yet</div>
            ) : (
              <div className="divide-y dark:divide-gray-700 divide-gray-200">
                {friends.map((friend) => {
                  const conversationData = conversations[friend.id];
                  return (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className={`w-full text-left p-4 transition-colors ${
                        selectedFriend?.id === friend.id
                          ? 'dark:bg-purple-900 bg-purple-100'
                          : 'dark:hover:bg-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 cursor-pointer">
                        <h3 className="dark:text-white text-gray-900 font-semibold truncate">
                          {friend.preferredName || friend.nickname || friend.legalName}
                        </h3>
                        {(conversationData?.unreadCount ?? 0) > 0 && (
                          <span className="dark:bg-red-600 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversationData?.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="dark:text-gray-400 text-gray-600 text-sm truncate cursor-pointer">
                        {conversationData?.lastMessage || 'Click to start conversation'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedFriend ? (
            <div className="flex-1 dark:bg-gray-800 bg-gray-50 rounded-lg border dark:border-gray-700 border-gray-200 flex flex-col">
              <div className="p-4 border-b dark:border-gray-700 border-gray-200">
                <h2 className="text-xl font-bold dark:text-white text-gray-900">
                  {selectedFriend.preferredName || selectedFriend.nickname || selectedFriend.legalName}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderUserId === currentUserId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderUserId === currentUserId
                          ? 'dark:bg-purple-600 bg-purple-500 text-white'
                          : 'dark:bg-gray-700 bg-gray-300 dark:text-white text-gray-900'
                      }`}
                    >
                      <p className="break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.senderUserId === currentUserId
                          ? 'text-purple-200'
                          : 'dark:text-gray-400 text-gray-600'
                      }`}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t dark:border-gray-700 border-gray-200">
                <div className="flex gap-2">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 dark:bg-gray-700 bg-white dark:text-white text-gray-900 dark:placeholder-gray-500 placeholder-gray-400 border dark:border-gray-600 border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !messageText.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <IoSend />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 dark:bg-gray-800 bg-gray-50 rounded-lg border dark:border-gray-700 border-gray-200 flex items-center justify-center">
              <p className="dark:text-gray-400 text-gray-600">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
