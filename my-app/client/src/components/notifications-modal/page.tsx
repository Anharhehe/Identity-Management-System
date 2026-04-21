'use client';

import { useState, useEffect } from 'react';

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
};

const contextConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  professional: { icon: <Icons.Briefcase />, color: 'text-violet-400' },
  personal: { icon: <Icons.User />, color: 'text-sky-400' },
  family: { icon: <Icons.Users />, color: 'text-rose-400' },
  online: { icon: <Icons.Globe />, color: 'text-emerald-400' },
};

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [markingDone, setMarkingDone] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      if (!token) return;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred Background */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl border shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
        style={{ background: 'rgba(9,9,15,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-3">
            <Icons.Bell className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <p className="text-gray-400 text-sm">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="px-6 py-8 flex items-start gap-3">
              <Icons.AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 gap-3"
              style={{ color: 'rgba(156,163,175,0.6)' }}
            >
              <Icons.Bell className="w-12 h-12 opacity-40" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all ${
                    notif.isRead
                      ? 'bg-white/[0.02] border-white/[0.04]'
                      : 'bg-white/[0.05] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notif.isRead ? 'bg-white/[0.05]' : 'bg-purple-500/15'
                    }`}>
                      <div className={contextConfig[notif.identityType]?.color || 'text-gray-400'}>
                        {contextConfig[notif.identityType]?.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <p className={`font-semibold ${notif.isRead ? 'text-gray-400' : 'text-white'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">
                            {notif.identityType} Identity
                          </p>
                        </div>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${notif.isRead ? 'text-gray-500' : 'text-gray-300'}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsDone(notif.id)}
                          disabled={markingDone === notif.id}
                          className="p-2 rounded-lg transition-all text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
                          title="Mark as done"
                        >
                          <Icons.Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        disabled={deleting === notif.id}
                        className="p-2 rounded-lg transition-all text-red-400 hover:bg-red-500/10 disabled:opacity-50"
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
    </div>
  );
}
