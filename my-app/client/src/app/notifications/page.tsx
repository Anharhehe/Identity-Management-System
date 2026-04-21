'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  userId: string;
  identityId: string;
  title: string;
  message: string;
  identityType: string;
  isRead: boolean;
  createdAt: string;
  sentBy: string;
}

const Icons = {
  X: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Trash: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Bell: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  AlertCircle: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Briefcase: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  User: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Users: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Globe: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  ArrowLeft: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
};

const contextConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  professional: { icon: <Icons.Briefcase />, color: 'text-violet-400' },
  personal: { icon: <Icons.User />, color: 'text-sky-400' },
  family: { icon: <Icons.Users />, color: 'text-rose-400' },
  online: { icon: <Icons.Globe />, color: 'text-emerald-400' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingDone, setMarkingDone] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth');
        return;
      }
      await fetchNotifications(token);
    };
    checkAuthAndFetch();
  }, []);

  const fetchNotifications = async (token: string) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Error loading notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsDone = async (notificationId: string) => {
    try {
      setMarkingDone(notificationId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/mark-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as done:', err);
    } finally {
      setMarkingDone(null);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      setDeleting(notificationId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090f]" style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}>
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[560px] h-[560px] rounded-full bg-purple-950/70 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-violet-950/50 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
            title="Go back"
          >
            <Icons.ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[11px] font-semibold text-purple-400 tracking-[0.22em] uppercase mb-2">
              Inbox
            </p>
            <h1 className="text-[2.6rem] font-bold text-white tracking-tight leading-none flex items-center gap-3">
              <Icons.Bell className="w-8 h-8 text-purple-400" />
              Notifications
            </h1>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">Loading notifications...</p>
          </div>
        ) : error ? (
          <div
            className="p-6 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Icons.AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 gap-3 rounded-xl border"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }}
          >
            <Icons.Bell className="w-12 h-12 opacity-20" />
            <div className="text-center">
              <p className="text-gray-300 font-semibold mb-1">No notifications</p>
              <p className="text-gray-500 text-sm">You're all caught up!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 rounded-xl border transition-all ${
                  notif.isRead
                    ? 'bg-white/[0.02] border-white/[0.04]'
                    : 'bg-white/[0.05] border-white/[0.08]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notif.isRead ? 'bg-white/[0.05]' : 'bg-purple-500/15'
                  }`}>
                    <div className={contextConfig[notif.identityType]?.color || 'text-gray-400'}>
                      {contextConfig[notif.identityType]?.icon}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {notif.identityType} Identity • from {notif.sentBy}
                        </p>
                      </div>
                    </div>

                    <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-500' : 'text-gray-300'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-600 mt-3">
                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsDone(notif.id)}
                        disabled={markingDone === notif.id}
                        className="p-2 rounded-lg transition-all text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        title="Mark as done"
                      >
                        <Icons.Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      disabled={deleting === notif.id}
                      className="p-2 rounded-lg transition-all text-red-400 hover:bg-red-500/10 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
