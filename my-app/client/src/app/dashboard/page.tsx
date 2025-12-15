'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Identity {
  id: string;
  legalName: string;
  preferredName: string;
  nickname: string;
  context: 'professional' | 'personal' | 'family' | 'online';
  accountPrivacy: 'private' | 'public';
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
        setUser(JSON.parse(userData));
        await fetchIdentities(token);
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchIdentities = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/identities`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch identities');
      }

      const data = await response.json();
      setIdentities(data.identities || []);
    } catch (err) {
      console.error('Fetch identities error:', err);
      setError('Failed to load identities');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleDeleteIdentity = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('Are you sure you want to delete this identity profile?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/identities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete identity');
      }

      setIdentities(identities.filter(i => i.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete identity');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-purple-700 flex items-center justify-center">
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold dark:text-white text-gray-900">Dashboard</h1>
            <h3 className="  dark:text-white text-gray-900">Manage your profile</h3>
        </div>
        <div className="max-w-6xl mx-auto">
          {/* User Info */}
          {user && (
            <div className="dark:bg-gray-800 dark:border-gray-700 bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold dark:text-white text-gray-900 mb-4">User Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="dark:text-gray-400 text-gray-600 text-sm">Email</p>
                  <p className="dark:text-white text-gray-900 font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="dark:text-gray-400 text-gray-600 text-sm">Member Since</p>
                  <p className="dark:text-white text-gray-900 font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Create Identity Button */}
        <div className="mb-8">
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingId(null);
            }}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {showCreateForm ? 'Cancel' : '+ Create New Identity'}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <IdentityForm
            onSuccess={() => {
              setShowCreateForm(false);
              const token = localStorage.getItem('token');
              if (token) fetchIdentities(token);
            }}
            editingId={editingId}
            identity={editingId ? identities.find(i => i.id === editingId) : undefined}
          />
        )}

          {/* Identities List */}
          <div>
            <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-6">Your Identity Profiles ({identities.length})</h2>
            {identities.length === 0 ? (
            <div className="dark:bg-gray-800 dark:border-gray-700 bg-white border border-gray-200 rounded-lg p-8 text-center">
              <p className="dark:text-gray-400 text-gray-600 mb-4">No identity profiles yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-purple-400 hover:text-purple-300 font-semibold"
              >
                Create your first identity
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {identities.map(identity => (
                <div key={identity.id} className="dark:bg-gray-800 dark:border-gray-700 bg-white border border-gray-200 rounded-lg p-6 hover:border-purple-500 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-1">{identity.preferredName}</h3>
                      <span className="inline-block px-3 py-1 bg-purple-600/30 text-purple-300 text-xs font-semibold rounded-full">
                        {identity.context}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="dark:text-gray-400 text-gray-600 text-xs uppercase tracking-wider">Legal Name</p>
                      <p className="dark:text-white text-gray-900 font-medium">{identity.legalName}</p>
                    </div>
                    {identity.nickname && (
                      <div>
                        <p className="dark:text-gray-400 text-gray-600 text-xs uppercase tracking-wider">Nickname</p>
                        <p className="dark:text-white text-gray-900 font-medium">{identity.nickname}</p>
                      </div>
                    )}
                    <div>
                      <p className="dark:text-gray-400 text-gray-600 text-xs uppercase tracking-wider">Created</p>
                      <p className="dark:text-white text-gray-900 text-sm">
                        {new Date(identity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setEditingId(identity.id);
                        setShowCreateForm(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteIdentity(identity.id)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
      </div>
    </div>
  );
}

interface IdentityFormProps {
  onSuccess: () => void;
  editingId?: string | null;
  identity?: Identity;
}

function IdentityForm({ onSuccess, editingId, identity }: IdentityFormProps) {
  const [formData, setFormData] = useState({
    legalName: identity?.legalName || '',
    preferredName: identity?.preferredName || '',
    nickname: identity?.nickname || '',
    context: identity?.context || 'personal' as const,
    accountPrivacy: identity?.accountPrivacy || 'private' as const,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const method = editingId ? 'PUT' : 'POST';
      const endpoint = editingId ? `/identities/${editingId}` : '/identities';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors([data.error || 'An error occurred']);
        }
        return;
      }

      onSuccess();
    } catch (error) {
      console.error('Form error:', error);
      setErrors(['Network error. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-6">
        {editingId ? 'Edit Identity Profile' : 'Create New Identity Profile'}
      </h3>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <ul className="text-red-300 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Legal Name *</label>
          <input
            type="text"
            name="legalName"
            value={formData.legalName}
            onChange={handleChange}
            placeholder="Your full legal name"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Name * <span className="text-xs text-gray-400">(no spaces, unique)</span></label>
          <input
            type="text"
            name="preferredName"
            value={formData.preferredName}
            onChange={(e) => {
              const value = e.target.value.replace(/\s/g, '');
              setFormData(prev => ({
                ...prev,
                preferredName: value
              }));
              if (errors.length > 0) {
                setErrors([]);
              }
            }}
            placeholder="How you prefer to be called"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nickname</label>
          <input
            type="text"
            name="nickname"
            value={formData.nickname}
            onChange={handleChange}
            placeholder="Optional nickname"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Context *</label>
          <select
            name="context"
            value={formData.context}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            disabled={isLoading}
            required
          >
            <option value="professional">Professional</option>
            <option value="personal">Personal</option>
            <option value="family">Family</option>
            <option value="online">Online</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Account Privacy *</label>
          <select
            name="accountPrivacy"
            value={formData.accountPrivacy}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            disabled={isLoading}
            required
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            {isLoading ? 'Saving...' : editingId ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
