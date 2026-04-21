'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

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

const Icons = {
  Send: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Globe: ({ className = 'w-3 h-3' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  MessageSquare: ({ className = 'w-10 h-10' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Users: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Wifi: ({ className = 'w-3 h-3' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  WifiOff: ({ className = 'w-3 h-3' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
      <path d="M5 12.55a11 11 0 0 1 5.17-2.39" />
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  ),
  Clock: ({ className = 'w-3 h-3' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
};

function getInitials(friend: Friend): string {
  const name = friend.preferredName || friend.nickname || friend.legalName;
  return name ? name.slice(0, 2).toUpperCase() : '??';
}

function getDisplayName(friend: Friend): string {
  return friend.preferredName || friend.nickname || friend.legalName;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatConvTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return formatTime(dateStr);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentIdentityId, setCurrentIdentityId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedFriendRef = useRef<Friend | null>(null);
  const currentUserIdRef = useRef('');
  const currentIdentityIdRef = useRef('');
  const shouldScrollInstant = useRef(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => { selectedFriendRef.current = selectedFriend; }, [selectedFriend]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
  useEffect(() => { currentIdentityIdRef.current = currentIdentityId; }, [currentIdentityId]);

  const initSocket = useCallback((token: string) => {
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join_context', { context: 'online' });
    });

    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', () => setIsConnected(false));

    socket.on('new_message', (msg: Message) => {
      const activeFriend = selectedFriendRef.current;
      const myUserId = currentUserIdRef.current;

      if (activeFriend && msg.senderUserId !== myUserId && msg.senderIdentityId === activeFriend.id) {
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      if (msg.senderUserId !== currentUserIdRef.current) {
        setConversations(prev => ({
          ...prev,
          [msg.senderIdentityId]: {
            ...prev[msg.senderIdentityId],
            lastMessage: msg.message,
            lastMessageTime: msg.createdAt,
          },
        }));
      }
    });

    socket.on('typing', ({ senderIdentityId }: { senderIdentityId: string }) => {
      if (selectedFriendRef.current?.id === senderIdentityId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2500);
      }
    });

    socketRef.current = socket;
  }, [SOCKET_URL]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token) { router.push('/auth'); return; }
    if (userRaw) {
      const u = JSON.parse(userRaw);
      setCurrentUserId(u.id);
      setCurrentIdentityId(u.identityId || '');
    }
    fetchConversations(token);
    initSocket(token);

    return () => {
      socketRef.current?.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages(selectedFriend.id);
      setIsTyping(false);
    }
  }, [selectedFriend]);

  const scrollToBottom = useCallback((instant = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    if (instant) {
      container.scrollTop = container.scrollHeight;
    } else {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom(shouldScrollInstant.current);
    shouldScrollInstant.current = false;
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isTyping) scrollToBottom(false);
  }, [isTyping, scrollToBottom]);

  const fetchConversations = async (token?: string) => {
    const t = token || localStorage.getItem('token');
    try {
      setIsLoading(true);
      const [friendsRes, convsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/friends/online`, {
          headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
        }),
        fetch(`${API_BASE_URL}/messages/conversations/online`, {
          headers: { 'Authorization': `Bearer ${t}`, 'Content-Type': 'application/json' },
        }),
      ]);
      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends || []);
      }
      if (convsRes.ok) {
        const data = await convsRes.json();
        const map: { [key: string]: Friend } = {};
        data.conversations?.forEach((c: Friend) => { map[c.id] = c; });
        setConversations(map);
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
      const response = await fetch(
        `${API_BASE_URL}/messages/online/${friendIdentityId}?limit=100`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (response.ok) {
        const data = await response.json();
        shouldScrollInstant.current = true;
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedFriend || isSending) return;
    const text = messageText.trim();
    setMessageText('');

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      setIsSending(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientIdentityId: selectedFriend.id,
          message: text,
          context: 'online',
        }),
      });
      if (response.ok) {
        const data = await response.json();

        const newMsg: Message = {
          id: String(data.messageId),
          senderUserId: currentUserIdRef.current,
          senderIdentityId: String(data.senderIdentityId),
          message: text,
          createdAt: data.createdAt || new Date().toISOString(),
        };

        setMessages(prev => [...prev, newMsg]);

        if (socketRef.current?.connected) {
          socketRef.current.emit('send_message', {
            ...newMsg,
            recipientIdentityId: selectedFriend.id,
            context: 'online',
          });
        }

        setConversations(prev => ({
          ...prev,
          [selectedFriend.id]: {
            ...prev[selectedFriend.id],
            lastMessage: text,
            lastMessageTime: newMsg.createdAt,
          },
        }));
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    if (socketRef.current?.connected && selectedFriend) {
      socketRef.current.emit('typing', {
        recipientIdentityId: selectedFriend.id,
        context: 'online',
      });
    }
  };

  return (
    <div
      className="h-screen bg-[#09090f] overflow-hidden"
      style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[560px] h-[560px] rounded-full bg-emerald-950/70 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-teal-950/50 blur-[130px]" />
      </div>

      <div className="relative z-10 h-full flex flex-col max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5 flex-shrink-0">
          <div>
            <p className="text-[11px] font-semibold text-emerald-400 tracking-[0.22em] uppercase mb-1">
              Online Context
            </p>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Messages</h1>
          </div>

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={isConnected
              ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#6ee7b7' }
              : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }
            }
          >
            {isConnected ? <Icons.Wifi /> : <Icons.WifiOff />}
            {isConnected ? 'Live' : 'Reconnecting'}
          </div>
        </div>

        <div className="flex gap-4 flex-1 min-h-0">
          <div
            className="w-72 flex-shrink-0 rounded-2xl flex flex-col overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div
              className="px-5 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Conversations</p>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium text-gray-500 tabular-nums"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {friends.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                  <p className="text-gray-700 text-xs">Loading…</p>
                </div>
              ) : friends.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3 px-5 text-center">
                  <span className="text-gray-700"><Icons.Users className="w-8 h-8" /></span>
                  <p className="text-gray-600 text-xs leading-relaxed">No connections in online context yet.</p>
                </div>
              ) : (
                <div className="py-2">
                  {friends.map((friend) => {
                    const conv = conversations[friend.id];
                    const isActive = selectedFriend?.id === friend.id;
                    const initials = getInitials(friend);
                    const displayName = getDisplayName(friend);

                    return (
                      <button
                        key={friend.id}
                        onClick={() => setSelectedFriend(friend)}
                        className="w-full text-left px-4 py-3.5 flex items-center gap-3 transition-all duration-150 cursor-pointer relative"
                        style={{
                          background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
                          borderLeft: isActive ? '2px solid rgba(16,185,129,0.7)' : '2px solid transparent',
                        }}
                        onMouseEnter={e => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={e => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-xs text-white"
                          style={{ background: isActive ? 'linear-gradient(135deg,#10b981,#059669)' : 'rgba(16,185,129,0.2)' }}
                        >
                          {initials}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>
                              {displayName}
                            </p>
                            {conv?.lastMessageTime && (
                              <span className="text-[10px] text-gray-600 flex-shrink-0 ml-2">
                                {formatConvTime(conv.lastMessageTime)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {conv?.lastMessage || 'Start a conversation'}
                          </p>
                        </div>

                        {(conv?.unreadCount ?? 0) > 0 && (
                          <span
                            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                          >
                            {conv?.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {selectedFriend ? (
            <div
              className="flex-1 rounded-2xl flex flex-col min-h-0 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="px-6 py-4 flex items-center gap-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                >
                  {getInitials(selectedFriend)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{getDisplayName(selectedFriend)}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                      <Icons.Globe /> Online
                    </span>
                    {isTyping && (
                      <>
                        <span className="text-gray-700 text-[11px]">·</span>
                        <span className="text-[11px] text-gray-500 italic">typing…</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                    <span className="text-gray-700">
                      <Icons.MessageSquare className="w-10 h-10" />
                    </span>
                    <p className="text-gray-500 text-sm font-medium">No messages yet</p>
                    <p className="text-gray-700 text-xs max-w-xs leading-relaxed">
                      Send a message to start the conversation with {getDisplayName(selectedFriend)}.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderUserId === currentUserId;
                    const prevMsg = messages[idx - 1];
                    const showTimestamp =
                      !prevMsg ||
                      new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60 * 1000;

                    return (
                      <div key={msg.id}>
                        {showTimestamp && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                            <span className="text-[10px] text-gray-600 flex items-center gap-1 flex-shrink-0">
                              <Icons.Clock />
                              {formatTime(msg.createdAt)}
                            </span>
                            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                          </div>
                        )}

                        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className="max-w-[68%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words"
                            style={isMine ? {
                              background: 'linear-gradient(135deg,#10b981,#059669)',
                              borderBottomRightRadius: '6px',
                              color: '#fff',
                              boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
                            } : {
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderBottomLeftRadius: '6px',
                              color: '#e2e8f0',
                            }}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div
                      className="px-4 py-3 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderBottomLeftRadius: '6px',
                      }}
                    >
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div
                className="px-6 py-4 flex-shrink-0"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
              >
                <div
                  className="flex items-end gap-3 rounded-2xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={handleTyping}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message…"
                    rows={1}
                    className="flex-1 bg-transparent text-white placeholder-gray-600 text-sm outline-none resize-none leading-relaxed"
                    style={{ fontFamily: 'inherit', maxHeight: '120px', background: 'transparent', color: '#fff' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isSending || !messageText.trim()}
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={messageText.trim() ? {
                      background: 'linear-gradient(135deg,#10b981,#059669)',
                      border: '1px solid rgba(16,185,129,0.5)',
                      boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                      color: '#fff',
                    } : {
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#4b5563',
                    }}
                  >
                    {isSending
                      ? <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      : <Icons.Send className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
                <p className="text-[10px] text-gray-700 mt-2 text-center">
                  Enter to send · Shift + Enter for new line
                </p>
              </div>
            </div>
          ) : (
            <div
              className="flex-1 rounded-2xl flex flex-col items-center justify-center gap-4 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}
            >
              <span className="text-gray-700">
                <Icons.MessageSquare className="w-12 h-12" />
              </span>
              <div>
                <p className="text-gray-300 font-semibold mb-1">Select a conversation</p>
                <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
                  Choose a connection from the sidebar to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        .typing-dot:nth-child(1) { animation: typingBounce 1.2s infinite 0ms; }
        .typing-dot:nth-child(2) { animation: typingBounce 1.2s infinite 150ms; }
        .typing-dot:nth-child(3) { animation: typingBounce 1.2s infinite 300ms; }
      `}</style>
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
    </div>
  );
}
