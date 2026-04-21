'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Identity {
  id: string;
  type: string;
  legalName: string;
  preferredName: string;
  nickname?: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  createdAt: string;
  identities: Identity[];
}

interface NotificationFormData {
  identityId: string;
  identityType: string;
  title: string;
  message: string;
}

const Icons = {
  Send: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Trash: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  ChevronDown: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  ChevronUp: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  Users: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Bell: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  X: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Check: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertCircle: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  User: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  IdCard: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 9h4M14 12h4M14 15h2" />
    </svg>
  ),
  Tag: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [notificationModal, setNotificationModal] = useState<{ isOpen: boolean; identityId: string; identityType: string } | null>(null);
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '' });
  const [sendingNotification, setSendingNotification] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; identityId: string; userId: string } | null>(null);
  const [deletingIdentity, setDeletingIdentity] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
    fetchUsers(token);
  }, []);

  const fetchUsers = async (token: string) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else if (response.status === 403) {
        setError('Access denied: Admin privileges required');
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const openNotificationModal = (identityId: string, identityType: string) => {
    setNotificationModal({ isOpen: true, identityId, identityType });
    setNotificationForm({ title: '', message: '' });
    setError('');
  };

  const closeNotificationModal = () => {
    setNotificationModal(null);
    setNotificationForm({ title: '', message: '' });
  };

  const handleSendNotification = async () => {
    if (!notificationModal) return;
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      setError('Title and message are required');
      return;
    }

    try {
      setSendingNotification(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/send-notification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityId: notificationModal.identityId,
          identityType: notificationModal.identityType,
          title: notificationForm.title,
          message: notificationForm.message,
        }),
      });

      if (response.ok) {
        setSuccessMessage('Notification sent successfully!');
        closeNotificationModal();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send notification');
      }
    } catch (err) {
      setError('Error sending notification: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSendingNotification(false);
    }
  };

  const openDeleteConfirm = (identityId: string, userId: string) => {
    setDeleteConfirm({ isOpen: true, identityId, userId });
    setError('');
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteIdentity = async () => {
    if (!deleteConfirm) return;

    try {
      setDeletingIdentity(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/identities/${deleteConfirm.identityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccessMessage('Identity deleted successfully!');
        setUsers(prev =>
          prev.map(user =>
            user.id === deleteConfirm.userId
              ? { ...user, identities: user.identities.filter(id => id.id !== deleteConfirm.identityId) }
              : user
          )
        );
        closeDeleteConfirm();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete identity');
      }
    } catch (err) {
      setError('Error deleting identity: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setDeletingIdentity(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#09090f' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[560px] h-[560px] rounded-full bg-blue-950/70 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-cyan-950/50 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Icons.Users className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400 text-sm">Manage users, identities, and send notifications</p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-lg flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            <Icons.AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div
            className="mb-6 px-4 py-3 rounded-lg flex items-center gap-3"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}
          >
            <Icons.Check className="w-5 h-5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div
            className="text-center py-12 rounded-xl border"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}
          >
            <Icons.Users className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl overflow-hidden border transition-all"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {/* User Header */}
                <button
                  onClick={() => toggleUserExpand(user.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                    >
                      {user.email.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{user.email}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {user.identities.length} identit{user.identities.length === 1 ? 'y' : 'ies'} • Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {expandedUsers.has(user.id) ? (
                      <Icons.ChevronUp className="w-5 h-5" />
                    ) : (
                      <Icons.ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {/* Identities List */}
                {expandedUsers.has(user.id) && (
                  <div
                    className="px-6 py-4 space-y-3"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
                  >
                    {user.identities.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No identities</p>
                    ) : (
                      user.identities.map((identity) => (
                        <div
                          key={identity.id}
                          className="p-4 rounded-lg flex items-center justify-between"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                          <div className="flex-1">
                            <p className="text-white font-medium capitalize">{identity.type} Identity</p>
                            <div className="text-gray-400 text-xs mt-1 space-y-0.5">
                              <p className="flex items-center gap-2">
                                <Icons.User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                <span>Username: <span className="text-blue-400 font-medium">{identity.preferredName}</span></span>
                              </p>
                              <p className="flex items-center gap-2">
                                <Icons.IdCard className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <span>Legal Name: <span className="text-gray-300 font-medium">{identity.legalName}</span></span>
                              </p>
                              {identity.nickname && (
                                <p className="flex items-center gap-2">
                                  <Icons.Tag className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                  <span>Nickname: <span className="text-gray-300">{identity.nickname}</span></span>
                                </p>
                              )}
                              <p className="text-gray-600 text-[10px] mt-1">
                                ID: {identity.id.slice(0, 12)}...
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                            <button
                              onClick={() => openNotificationModal(identity.id, identity.type)}
                              className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                              style={{
                                background: 'rgba(59,130,246,0.1)',
                                border: '1px solid rgba(59,130,246,0.3)',
                                color: '#60a5fa',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                              }}
                            >
                              <Icons.Bell className="w-4 h-4" />
                              Notify
                            </button>

                            <button
                              onClick={() => openDeleteConfirm(identity.id, user.id)}
                              className="px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer"
                              style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#fca5a5',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                              }}
                            >
                              <Icons.Trash className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {notificationModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl p-6 border"
            style={{ background: '#09090f', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.Bell className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Send Notification</h2>
              </div>
              <button
                onClick={closeNotificationModal}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Sending to: <span className="text-white font-medium capitalize">{notificationModal.identityType}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title..."
                  className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeNotificationModal}
                  className="flex-1 px-4 py-2 rounded-lg text-white transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={sendingNotification}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }}
                >
                  {sendingNotification ? (
                    <>
                      <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Icons.Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-2xl p-6 border"
            style={{ background: '#09090f', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Delete Identity</h2>
              <button
                onClick={closeDeleteConfirm}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <Icons.X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this identity? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                className="flex-1 px-4 py-2 rounded-lg text-white transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteIdentity}
                disabled={deletingIdentity}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: 'rgba(239,68,68,0.8)' }}
              >
                {deletingIdentity ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Icons.Trash className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
