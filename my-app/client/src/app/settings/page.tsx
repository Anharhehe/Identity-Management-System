'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiSettings, FiArrowLeft, FiAlertCircle, FiCheck, FiMail, FiUser, FiLock, FiTrash2, FiX } from 'react-icons/fi';

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (!token || !userData) {
        router.push('/auth');
        return;
      }
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setEditForm({
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          email: parsedUser.email || '',
        });
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!editForm.email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const updatedUser = { ...user, ...data.user };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setSuccessMessage('Profile updated successfully!');
        setIsEditingProfile(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsEditingPassword(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Error changing password: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user?.email) {
      setError('Email does not match');
      return;
    }

    try {
      setIsDeletingAccount(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError('Error deleting account: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-gray-600 text-xs tracking-widest uppercase">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090f]" style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}>
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[560px] h-[560px] rounded-full bg-purple-950/70 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-violet-950/50 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg transition-all hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer"
            title="Go back"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[11px] font-semibold text-purple-400 tracking-[0.22em] uppercase mb-2">
              User Account
            </p>
            <h1 className="text-[2.6rem] font-bold text-white tracking-tight leading-none flex items-center gap-3">
              <FiSettings className="w-8 h-8 text-purple-400" />
              Settings
            </h1>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div
            className="mb-6 px-4 py-3 rounded-lg flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div
            className="mb-6 px-4 py-3 rounded-lg flex items-center gap-3"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7' }}
          >
            <FiCheck className="w-5 h-5 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Profile Section */}
        <div
          className="rounded-xl overflow-hidden border mb-6"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-purple-400">
                <FiUser className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-semibold">Profile Information</p>
                <p className="text-gray-500 text-sm">Update your name and email</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsEditingProfile(!isEditingProfile);
                setError('');
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{
                background: isEditingProfile ? 'rgba(255,255,255,0.08)' : 'rgba(109,40,217,0.15)',
                border: isEditingProfile ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(109,40,217,0.3)',
                color: isEditingProfile ? '#9ca3af' : '#c4b5fd',
              }}
              onMouseEnter={(e) => {
                if (!isEditingProfile) {
                  e.currentTarget.style.background = 'rgba(109,40,217,0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isEditingProfile) {
                  e.currentTarget.style.background = 'rgba(109,40,217,0.15)';
                }
              }}
            >
              {isEditingProfile ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingProfile && (
            <div
              className="px-6 py-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
            >
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    placeholder="Enter your first name"
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    placeholder="Enter your last name"
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="w-full px-4 py-2 rounded-lg text-white font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  style={{
                    background: 'linear-gradient(135deg,#6d28d9,#7c3aed)',
                    border: '1px solid rgba(109,40,217,0.4)',
                  }}
                >
                  {isSubmittingEdit ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div
          className="rounded-xl overflow-hidden border mb-6"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-4">
              <div className="text-purple-400">
                <FiLock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-semibold">Password</p>
                <p className="text-gray-500 text-sm">Change your password</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsEditingPassword(!isEditingPassword);
                setError('');
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{
                background: isEditingPassword ? 'rgba(255,255,255,0.08)' : 'rgba(109,40,217,0.15)',
                border: isEditingPassword ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(109,40,217,0.3)',
                color: isEditingPassword ? '#9ca3af' : '#c4b5fd',
              }}
              onMouseEnter={(e) => {
                if (!isEditingPassword) {
                  e.currentTarget.style.background = 'rgba(109,40,217,0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isEditingPassword) {
                  e.currentTarget.style.background = 'rgba(109,40,217,0.15)';
                }
              }}
            >
              {isEditingPassword ? 'Cancel' : 'Change'}
            </button>
          </div>

          {isEditingPassword && (
            <div
              className="px-6 py-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}
            >
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="w-full px-4 py-2 rounded-lg text-white font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  style={{
                    background: 'linear-gradient(135deg,#6d28d9,#7c3aed)',
                    border: '1px solid rgba(109,40,217,0.4)',
                  }}
                >
                  {isSubmittingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Delete Account Section */}
        <div
          className="rounded-xl overflow-hidden border"
          style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-red-400">
                <FiTrash2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-semibold">Delete Account</p>
                <p className="text-gray-500 text-sm">Permanently delete your account and all data</p>
              </div>
            </div>
            <button
              onClick={() => setDeleteConfirm(!deleteConfirm)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
              style={{
                background: deleteConfirm ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.15)',
                border: deleteConfirm ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(239,68,68,0.3)',
                color: deleteConfirm ? '#9ca3af' : '#fca5a5',
              }}
              onMouseEnter={(e) => {
                if (!deleteConfirm) {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                }
              }}
              onMouseLeave={(e) => {
                if (!deleteConfirm) {
                  e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                }
              }}
            >
              {deleteConfirm ? 'Cancel' : 'Delete'}
            </button>
          </div>

          {deleteConfirm && (
            <div
              className="px-6 py-6"
              style={{ borderTop: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.03)' }}
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <p className="text-red-300 text-sm font-medium mb-2">Warning: This action cannot be undone</p>
                <p className="text-red-300/80 text-xs">All your profiles, messages, and account data will be permanently deleted.</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type your email to confirm: <span className="text-red-400 font-semibold">{user?.email}</span>
                </label>
                <input
                  type="text"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirm(false);
                    setDeleteEmail('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-white transition-all cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount || deleteEmail !== user?.email}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'rgba(239,68,68,0.8)' }}
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
