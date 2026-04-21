'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Identity {
  id: string;
  legalName: string;
  preferredName: string;
  nickname: string;
  context: string;
  accountPrivacy: string;
  createdAt: string;
}

interface FriendRequest {
  id: string;
  senderIdentityId: string;
  senderName: string;
  createdAt: string;
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  FamilyIcon: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Users: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  UserCheck: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  UserX: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="18" y1="8" x2="23" y2="13" />
      <line x1="23" y1="8" x2="18" y2="13" />
    </svg>
  ),
  Check: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronRight: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
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
  AlertCircle: ({ className = 'w-4 h-4 flex-shrink-0' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Clock: ({ className = 'w-3 h-3' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Search: ({ className = 'w-5 h-5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function FamilyFavoritesPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Identity[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

      const [friendsRes, requestsRes] = await Promise.all([
        fetch(`${apiUrl}/friends/family`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/friend-requests/family`, {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        }),
      ]);

      if (friendsRes.ok) {
        const data = await friendsRes.json();
        setFriends(data.friends || []);
      }
      if (requestsRes.ok) {
        const data = await requestsRes.json();
        setFriendRequests(data.requests || []);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Remove this connection?')) return;
    setRemovingId(friendId);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/friends/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ friendIdentityId: friendId, context: 'family' }),
      });
      if (!response.ok) throw new Error('Failed to remove friend');
      setFriends(prev => prev.filter(f => f.id !== friendId));
    } catch (err) {
      console.error('Error removing friend:', err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/friend-requests/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ requestId, context: 'family' }),
      });
      if (!response.ok) throw new Error('Failed to accept request');
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      fetchData();
    } catch (err) {
      console.error('Error accepting request:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/friend-requests/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ requestId }),
      });
      if (!response.ok) throw new Error('Failed to decline request');
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error('Error declining request:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
          <p className="text-gray-600 text-xs tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090f]" style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}>

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[560px] h-[560px] rounded-full bg-rose-950/70 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-pink-950/50 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        {/* ── Page heading ── */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-semibold text-rose-400 tracking-[0.22em] uppercase mb-2">
              Family Context
            </p>
            <h1 className="text-[2.6rem] font-bold text-white tracking-tight leading-none">
              Connections
            </h1>
          </div>

          {/* Stats pill */}
          {!isLoading && (
            <div
              className="hidden sm:flex items-center gap-5 rounded-2xl px-6 py-4"
              style={{ background: 'rgba(255,255,255,0.028)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="text-right">
                <p className="text-3xl font-bold text-white tabular-nums">{friends.length}</p>
                <p className="text-[11px] text-gray-600 mt-0.5 uppercase tracking-widest">
                  Connection{friends.length !== 1 ? 's' : ''}
                </p>
              </div>
              {friendRequests.length > 0 && (
                <>
                  <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.07)' }} />
                  <div className="text-right">
                    <p className="text-3xl font-bold text-amber-400 tabular-nums">{friendRequests.length}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 uppercase tracking-widest">
                      Pending
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <span className="text-red-400"><Icons.AlertCircle /></span>
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={fetchData}
              className="ml-auto text-red-400 hover:text-red-300 text-xs underline underline-offset-2 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Friend Requests Section ── */}
        {friendRequests.length > 0 && (
          <div className="mb-10">
            {/* Section bar */}
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-base font-semibold text-white">Pending Requests</h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums"
                style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}
              >
                {friendRequests.length}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {friendRequests.map((request) => (
                <RequestRow
                  key={request.id}
                  request={request}
                  isProcessing={processingRequestId === request.id}
                  onAccept={() => handleAcceptRequest(request.id)}
                  onDecline={() => handleDeclineRequest(request.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Connections Section ── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">Your Connections</h2>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium text-gray-500 tabular-nums"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {friends.length}
            </span>
          </div>
          <Link
            href="/search/family"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg,#be123c,#f43f5e)',
              border: '1px solid rgba(244,63,94,0.5)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(244,63,94,0.3)',
            }}
          >
            <Icons.Search className="w-4 h-4" />
            Explore Profiles
          </Link>
        </div>

        {/* ── Empty state ── */}
        {friends.length === 0 ? (
          <div
            className="rounded-2xl py-20 flex flex-col items-center justify-center text-center"
            style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
          >
            <span className="text-gray-700 mb-4 block">
              <Icons.Users className="w-12 h-12" />
            </span>
            <p className="text-gray-300 font-semibold mb-2">No connections yet</p>
            <p className="text-gray-600 text-sm mb-7 max-w-xs leading-relaxed">
              Follow family profiles to build your network and see them here.
            </p>
            <Link
              href="/search/family"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-rose-300 cursor-pointer transition-all hover:text-rose-200"
              style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)' }}
            >
              Explore Family Profiles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                isRemoving={removingId === friend.id}
                onViewProfile={() => router.push(`/search/family/${friend.id}`)}
                onRemove={() => handleRemoveFriend(friend.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Request Row ───────────────────────────────────────────────────────────────
function RequestRow({
  request,
  isProcessing,
  onAccept,
  onDecline,
}: {
  request: FriendRequest;
  isProcessing: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const initials = request.senderName
    ? request.senderName.slice(0, 2).toUpperCase()
    : '??';

  return (
    <div
      className="rounded-2xl px-6 py-4 flex items-center gap-4"
      style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.14)' }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-sm text-white"
        style={{ background: 'linear-gradient(135deg,#831843,#be123c)' }}
      >
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{request.senderName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-gray-600"><Icons.Clock className="w-3 h-3" /></span>
          <span className="text-gray-600 text-xs">
            {new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onAccept}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#6ee7b7' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.22)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.12)'; }}
        >
          <Icons.Check />
          Accept
        </button>
        <button
          onClick={onDecline}
          disabled={isProcessing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', color: '#fca5a5' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'; }}
        >
          <Icons.X />
          Decline
        </button>
      </div>
    </div>
  );
}

// ── Friend Card ───────────────────────────────────────────────────────────────
function FriendCard({
  friend,
  isRemoving,
  onViewProfile,
  onRemove,
}: {
  friend: Identity;
  isRemoving: boolean;
  onViewProfile: () => void;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isPrivate = friend.accountPrivacy === 'private';

  const initials = friend.preferredName
    ? friend.preferredName.slice(0, 2).toUpperCase()
    : '??';

  return (
    <div
      className="rounded-2xl p-6 flex flex-col transition-all duration-200"
      style={{
        background: hovered ? 'rgba(244,63,94,0.06)' : 'rgba(255,255,255,0.025)',
        border: hovered ? '1px solid rgba(244,63,94,0.28)' : '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#be123c,#f43f5e)' }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-white text-[15px] leading-tight">{friend.preferredName}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-rose-500/15 text-rose-300 border-rose-500/25">
              <Icons.FamilyIcon className="w-3 h-3" />
              Family
            </span>
          </div>
        </div>

        {/* Privacy badge */}
        <span
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            isPrivate
              ? 'bg-white/5 text-gray-400 border-white/10'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {isPrivate ? <Icons.Lock /> : <Icons.Unlock />}
          {isPrivate ? 'Private' : 'Public'}
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px mb-4" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Fields */}
      <div className="flex-1 space-y-3 mb-6">
        <Field label="Legal Name" value={friend.legalName} />
        {friend.nickname && !isPrivate && (
          <Field label="Nickname" value={friend.nickname} />
        )}
        <Field
          label="Connected Since"
          value={new Date(friend.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          muted
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={onViewProfile}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fda4af' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.22)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.1)'; }}
        >
          <Icons.ChevronRight className="w-3.5 h-3.5" />
          View Profile
        </button>
        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer disabled:opacity-50"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'; }}
        >
          {isRemoving
            ? <span className="w-3 h-3 rounded-full border-2 border-red-300/40 border-t-red-300 animate-spin" />
            : <Icons.Trash />
          }
          Remove
        </button>
      </div>
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-0.5 font-medium">{label}</p>
      <p className={`text-sm font-medium ${muted ? 'text-gray-600' : 'text-gray-200'}`}>{value}</p>
    </div>
  );
}
