'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiSettings } from 'react-icons/fi';

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

// ── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Briefcase: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  User: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Users: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Globe: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Lock: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  Edit: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Plus: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  X: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  AlertCircle: ({ className = 'w-4 h-4 flex-shrink-0' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  IdCard: ({ className = 'w-10 h-10' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <circle cx="8" cy="12" r="2" />
      <path d="M14 9h4M14 12h4M14 15h2" />
    </svg>
  ),
  Mail: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Calendar: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Bell: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
};

// ── Context config ───────────────────────────────────────────────────────────
const contextConfig: Record<string, { icon: React.ReactNode; pill: string; iconBg: string }> = {
  professional: {
    icon: <Icons.Briefcase />,
    pill: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    iconBg: 'bg-violet-500/15 border-violet-500/20 text-violet-300',
  },
  personal: {
    icon: <Icons.User />,
    pill: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
    iconBg: 'bg-sky-500/15 border-sky-500/20 text-sky-300',
  },
  family: {
    icon: <Icons.Users />,
    pill: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
    iconBg: 'bg-rose-500/15 border-rose-500/20 text-rose-300',
  },
  online: {
    icon: <Icons.Globe />,
    pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    iconBg: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300',
  },
};

// ── Dashboard ────────────────────────────────────────────────────────────────
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
      if (!token || !userData) { router.push('/auth'); return; }
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch identities');
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
    if (!confirm('Are you sure you want to delete this identity profile?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/identities/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to delete identity');
      setIdentities(identities.filter(i => i.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete identity');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          <p className="text-gray-600 text-xs tracking-widest uppercase">Loading</p>
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

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        {/* ── Page heading ── */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-semibold text-purple-400 tracking-[0.22em] uppercase mb-2">
              Identity Management
            </p>
            <h1 className="text-[2.6rem] font-bold text-white tracking-tight leading-none">
              Dashboard
            </h1>
          </div>
          {/* Notifications & Settings Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/settings')}
              className="p-3 rounded-xl transition-all hover:scale-110 cursor-pointer"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#c4b5fd'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
              }}
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/notifications')}
              className="p-3 rounded-xl transition-all hover:scale-110 cursor-pointer"
              style={{
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.3)',
                color: '#c4b5fd'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
              }}
              title="Notifications"
            >
              <Icons.Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── User info card ── */}
        {user && (
          <div
            className="rounded-2xl p-6 mb-6 flex items-center gap-5"
            style={{ background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-950/50">
              <span className="text-white font-bold text-lg leading-none">{user.email.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-600"><Icons.Mail /></span>
                <span className="text-white text-sm font-medium truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600"><Icons.Calendar /></span>
                <span className="text-gray-500 text-xs">
                  Member since{' '}
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right hidden sm:block pl-4" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-4xl font-bold text-white tabular-nums">{identities.length}</p>
              <p className="text-[11px] text-gray-600 mt-0.5 uppercase tracking-widest">Profile{identities.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <span className="text-red-400"><Icons.AlertCircle /></span>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* ── Section bar ── */}
        <div className="flex items-center justify-between mb-6 mt-10">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">Your Profiles</h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium text-gray-500 tabular-nums"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {identities.length}
            </span>
          </div>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={showCreateForm
              ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }
              : { background: 'linear-gradient(135deg,#6d28d9,#7c3aed)', border: '1px solid rgba(109,40,217,0.5)', color: '#fff', boxShadow: '0 4px 20px rgba(109,40,217,0.3)' }
            }
          >
            {showCreateForm
              ? <><Icons.X /> Cancel</>
              : <><Icons.Plus /> New Profile</>}
          </button>
        </div>

        {/* ── Form ── */}
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

        {/* ── Cards ── */}
        {identities.length === 0 ? (
          <div
            className="rounded-2xl py-20 flex flex-col items-center justify-center text-center"
            style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <span className="text-gray-700 mb-4 block"><Icons.IdCard className="w-12 h-12" /></span>
            <p className="text-gray-300 font-semibold mb-2">No profiles yet</p>
            <p className="text-gray-600 text-sm mb-7 max-w-xs leading-relaxed">
              Create a profile to organise how you present yourself across different contexts.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-purple-300 cursor-pointer transition-all hover:text-purple-200"
              style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.25)' }}
            >
              Create your first profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {identities.map(identity => {
              const ctx = contextConfig[identity.context] ?? contextConfig.personal;
              return (
                <IdentityCard
                  key={identity.id}
                  identity={identity}
                  ctx={ctx}
                  onEdit={() => { setEditingId(identity.id); setShowCreateForm(true); }}
                  onDelete={() => handleDeleteIdentity(identity.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Identity Card ────────────────────────────────────────────────────────────
function IdentityCard({
  identity,
  ctx,
  onEdit,
  onDelete,
}: {
  identity: Identity;
  ctx: { icon: React.ReactNode; pill: string; iconBg: string };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl p-6 flex flex-col transition-all duration-200 cursor-default"
      style={{
        background: hovered ? 'rgba(109,40,217,0.06)' : 'rgba(255,255,255,0.025)',
        border: hovered ? '1px solid rgba(109,40,217,0.28)' : '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${ctx.iconBg}`}>
            {ctx.icon}
          </div>
          <div>
            <p className="font-semibold text-white text-[15px] leading-tight">{identity.preferredName}</p>
            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${ctx.pill}`}>
              {identity.context}
            </span>
          </div>
        </div>

        <span
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            identity.accountPrivacy === 'public'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-white/5 text-gray-400 border-white/10'
          }`}
        >
          {identity.accountPrivacy === 'public' ? <Icons.Unlock /> : <Icons.Lock />}
          {identity.accountPrivacy}
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px mb-4" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Fields */}
      <div className="flex-1 space-y-3 mb-6">
        <Field label="Legal Name" value={identity.legalName} />
        {identity.nickname && <Field label="Nickname" value={identity.nickname} />}
        <Field
          label="Created"
          value={new Date(identity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          muted
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer"
          style={{ background: 'rgba(109,40,217,0.1)', border: '1px solid rgba(109,40,217,0.2)', color: '#c4b5fd' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(109,40,217,0.22)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(109,40,217,0.1)'; }}
        >
          <Icons.Edit /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'; }}
        >
          <Icons.Trash /> Delete
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-0.5 font-medium">{label}</p>
      <p className={`text-sm font-medium ${muted ? 'text-gray-600' : 'text-gray-200'}`}>{value}</p>
    </div>
  );
}

// ── Identity Form ────────────────────────────────────────────────────────────
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
    context: identity?.context || ('personal' as const),
    accountPrivacy: identity?.accountPrivacy || ('private' as const),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) { setErrors(data.errors || [data.error || 'An error occurred']); return; }
      onSuccess();
    } catch (error) {
      console.error('Form error:', error);
      setErrors(['Network error. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const baseInputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'white',
    width: '100%',
    padding: '10px 14px',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    fontFamily: 'inherit',
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = 'rgba(109,40,217,0.6)';
      e.currentTarget.style.background = 'rgba(109,40,217,0.07)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
    },
  };

  return (
    <div
      className="rounded-2xl p-7 mb-8"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(109,40,217,0.22)',
        boxShadow: '0 0 80px rgba(109,40,217,0.06)',
      }}
    >
      <h3 className="text-base font-semibold text-white mb-6">
        {editingId ? 'Edit Identity Profile' : 'Create New Identity Profile'}
      </h3>

      {errors.length > 0 && (
        <div
          className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <span className="text-red-400 mt-0.5"><Icons.AlertCircle /></span>
          <ul className="text-red-300 text-sm space-y-1">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2">
              Legal Name <span className="text-purple-500">*</span>
            </label>
            <input
              type="text"
              name="legalName"
              value={formData.legalName}
              onChange={handleChange}
              placeholder="Your full legal name"
              style={baseInputStyle}
              disabled={isLoading}
              required
              {...focusHandlers}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2">
              Preferred Name <span className="text-purple-500">*</span>
              <span className="ml-2 normal-case tracking-normal text-gray-700 text-[10px] font-normal">no spaces · unique</span>
            </label>
            <input
              type="text"
              name="preferredName"
              value={formData.preferredName}
              onChange={(e) => {
                const value = e.target.value.replace(/\s/g, '');
                setFormData(prev => ({ ...prev, preferredName: value }));
                if (errors.length > 0) setErrors([]);
              }}
              placeholder="How you prefer to be called"
              style={baseInputStyle}
              disabled={isLoading}
              required
              {...focusHandlers}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2">
              Nickname
              <span className="ml-2 normal-case tracking-normal text-gray-700 text-[10px] font-normal">optional</span>
            </label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
              placeholder="Optional nickname"
              style={baseInputStyle}
              disabled={isLoading}
              {...focusHandlers}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2">
              Context <span className="text-purple-500">*</span>
            </label>
            <select
              name="context"
              value={formData.context}
              onChange={handleChange}
              style={{ ...baseInputStyle, cursor: 'pointer', backgroundColor: '#1a1025', colorScheme: 'dark' }}
              disabled={isLoading}
              required
              {...focusHandlers}
            >
              <option value="professional" style={{ background: '#1a1025', color: '#e2e8f0' }}>Professional</option>
              <option value="personal" style={{ background: '#1a1025', color: '#e2e8f0' }}>Personal</option>
              <option value="family" style={{ background: '#1a1025', color: '#e2e8f0' }}>Family</option>
              <option value="online" style={{ background: '#1a1025', color: '#e2e8f0' }}>Online</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-2">
              Account Privacy <span className="text-purple-500">*</span>
            </label>
            <select
              name="accountPrivacy"
              value={formData.accountPrivacy}
              onChange={handleChange}
              style={{ ...baseInputStyle, cursor: 'pointer', backgroundColor: '#1a1025', colorScheme: 'dark' }}
              disabled={isLoading}
              required
              {...focusHandlers}
            >
              <option value="private" style={{ background: '#1a1025', color: '#e2e8f0' }}>Private</option>
              <option value="public" style={{ background: '#1a1025', color: '#e2e8f0' }}>Public</option>
            </select>
          </div>

        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity cursor-pointer disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg,#6d28d9,#7c3aed)',
            border: '1px solid rgba(109,40,217,0.4)',
            boxShadow: '0 4px 20px rgba(109,40,217,0.3)',
          }}
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Saving…
            </>
          ) : editingId ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}