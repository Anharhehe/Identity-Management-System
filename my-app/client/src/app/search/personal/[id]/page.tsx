'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Identity {
  id: string;
  userId: string;
  legalName: string;
  preferredName: string;
  nickname: string;
  context: string;
  accountPrivacy: string;
  createdAt: string;
}

const Icons = {
  ArrowLeft: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  User: ({ className = 'w-3 h-3' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Lock: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Unlock: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  ),
  MessageCircle: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  UserPlus: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  UserMinus: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  ),
  Check: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  AlertCircle: ({ className = 'w-8 h-8' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Send: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Calendar: ({ className = 'w-4 h-4' }: { className?: string } = {}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

export default function PersonalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const identityId = params.id as string;

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonState, setButtonState] = useState<'follow' | 'message' | 'send-request' | 'request-sent'>('follow');
  const [actionLoading, setActionLoading] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => { fetchIdentityProfile(); }, [identityId]);
  useEffect(() => { if (identity) checkFriendshipStatus(); }, [identity]);

  const checkFriendshipStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/friends/check/${identityId}/personal`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIsFriend(data.isFriend);
        if (data.isFriend) setButtonState('message');
      }
    } catch (err) { console.error('Error checking friendship:', err); }
  };

  const saveButtonState = (state: 'follow' | 'message' | 'send-request' | 'request-sent') => {
    localStorage.setItem(`button-state-${identityId}`, state);
    setButtonState(state);
  };

  const fetchIdentityProfile = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/identities/profile/${identityId}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setIdentity(data.identity);
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally { setIsLoading(false); }
  };

  const handleFollow = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/friends/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ friendIdentityId: identityId, context: 'personal' }),
      });
      if (!response.ok) throw new Error('Failed to follow');
      saveButtonState('message');
    } catch (err) { console.error('Error following:', err); alert('Failed to follow this user'); }
    finally { setActionLoading(false); }
  };

  const handleSendRequest = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/friend-requests/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ recipientIdentityId: identityId, context: 'personal' }),
      });
      if (!response.ok) throw new Error('Failed to send request');
      saveButtonState('request-sent');
    } catch (err) { console.error('Error sending request:', err); alert('Failed to send friend request'); }
    finally { setActionLoading(false); }
  };

  const handleUnfollow = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/friends/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ friendIdentityId: identityId, context: 'personal' }),
      });
      if (!response.ok) throw new Error('Failed to unfollow');
      saveButtonState('follow');
    } catch (err) { console.error('Error unfollowing:', err); alert('Failed to unfollow this user'); }
    finally { setActionLoading(false); }
  };

  const handleMessage = () => router.push(`/messages/personal`);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
          <p className="text-gray-600 text-xs tracking-widest uppercase">Loading profile</p>
        </div>
      </div>
    );
  }

  if (error || !identity) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center px-6">
        <div className="rounded-2xl p-10 text-center max-w-sm w-full" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="text-red-400 flex justify-center mb-4"><Icons.AlertCircle /></span>
          <p className="text-gray-300 font-medium mb-1">Profile unavailable</p>
          <p className="text-gray-600 text-sm mb-6">{error || 'This profile could not be found.'}</p>
          <button onClick={() => router.back()} className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all" style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)', border: '1px solid rgba(14,165,233,0.4)' }}>
            <Icons.ArrowLeft /> Go back
          </button>
        </div>
      </div>
    );
  }

  const isPublic = identity.accountPrivacy === 'public';
  const showFullProfile = isPublic || isFriend;
  const initials = identity.preferredName?.slice(0, 2).toUpperCase() ?? '??';

  return (
    <div className="min-h-screen bg-[#09090f]" style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[560px] h-[560px] rounded-full bg-sky-950/70 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-blue-950/50 blur-[130px]" />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer mb-8 group">
          <span className="group-hover:-translate-x-0.5 transition-transform"><Icons.ArrowLeft /></span>
          Back to search
        </button>

        <div className="rounded-2xl p-8 mb-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white mb-5 shadow-xl shadow-sky-950/50" style={{ background: 'linear-gradient(135deg,#0284c7,#0ea5e9)' }}>
              {initials}
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">{identity.preferredName}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-sky-500/15 text-sky-300 border-sky-500/25">
                <Icons.User className="w-3 h-3" /> Personal
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                isPublic ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-gray-400 border-white/10'
              }`}>
                {isPublic ? <Icons.Unlock /> : <Icons.Lock />}
                {isPublic ? 'Public Profile' : 'Private Profile'}
              </span>
              {isFriend && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-sky-500/10 text-sky-400 border-sky-500/20">
                  <Icons.Check className="w-3 h-3" /> Connected
                </span>
              )}
            </div>
          </div>

          <div className="w-full h-px mb-7" style={{ background: 'rgba(255,255,255,0.06)' }} />

          <div className="space-y-4">
            <InfoRow label="Legal Name" value={identity.legalName} />
            <InfoRow label="Preferred Name" value={identity.preferredName} />
            {showFullProfile && identity.nickname && (<InfoRow label="Nickname" value={identity.nickname} />)}
            {identity.createdAt && (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] font-medium mb-0.5">Member Since</p>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icons.Calendar />
                    <span>{new Date(identity.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isPublic && !isFriend && (
            <>
              <div className="w-full h-px my-6" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="flex items-start gap-3 rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="text-gray-500 mt-0.5 flex-shrink-0"><Icons.Lock className="w-4 h-4" /></span>
                <p className="text-gray-500 text-sm leading-relaxed">This is a private profile. Send a friend request to see full details.</p>
              </div>
            </>
          )}
        </div>

        <div className="space-y-3">
          {isPublic ? (
            buttonState === 'message' ? (
              <>
                <ActionButton onClick={handleMessage} icon={<Icons.MessageCircle />} label="Message" variant="primary" />
                <ActionButton onClick={handleUnfollow} icon={<Icons.UserMinus />} label="Unfollow" disabled={actionLoading} variant="danger" />
              </>
            ) : (
              <ActionButton onClick={handleFollow} icon={<Icons.UserPlus />} label="Follow" disabled={actionLoading} loading={actionLoading} variant="primary" />
            )
          ) : isFriend ? (
            <>
              <ActionButton onClick={handleMessage} icon={<Icons.MessageCircle />} label="Message" variant="primary" />
              <ActionButton onClick={handleUnfollow} icon={<Icons.UserMinus />} label="Unfollow" disabled={actionLoading} variant="danger" />
            </>
          ) : buttonState === 'request-sent' ? (
            <ActionButton icon={<Icons.Check />} label="Request Sent" disabled variant="muted" />
          ) : (
            <ActionButton onClick={handleSendRequest} icon={<Icons.Send />} label="Send Friend Request" disabled={actionLoading} loading={actionLoading} variant="secondary" />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] font-medium mb-0.5">{label}</p>
      <p className="text-gray-200 text-sm font-medium">{value}</p>
    </div>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'muted';

function ActionButton({ onClick, icon, label, disabled, loading, variant }: {
  onClick?: () => void; icon: React.ReactNode; label: string;
  disabled?: boolean; loading?: boolean; variant: ButtonVariant;
}) {
  const [hovered, setHovered] = useState(false);
  const styles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: hovered ? 'linear-gradient(135deg,#0369a1,#0284c7)' : 'linear-gradient(135deg,#0284c7,#0ea5e9)',
      border: '1px solid rgba(14,165,233,0.5)', color: '#fff',
      boxShadow: hovered ? '0 6px 24px rgba(14,165,233,0.35)' : '0 4px 16px rgba(14,165,233,0.25)',
    },
    secondary: {
      background: hovered ? 'rgba(14,165,233,0.15)' : 'rgba(14,165,233,0.08)',
      border: '1px solid rgba(14,165,233,0.25)', color: '#7dd3fc',
    },
    danger: {
      background: hovered ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.07)',
      border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5',
    },
    muted: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280', cursor: 'not-allowed' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      style={styles[variant]} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      {loading ? <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> : icon}
      {label}
    </button>
  );
}

