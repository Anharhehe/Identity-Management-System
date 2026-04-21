'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Identity {
  id: string;
  legalName: string;
  preferredName: string;
  nickname: string;
  context: string;
  accountPrivacy: string;
  createdAt: string;
}

// ── SVG Icons ────────────────────────────────────────────────────────────────
const Icons = {
  Search: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Briefcase: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
  Lock: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ChevronRight: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  AlertCircle: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Users: ({ className = 'w-10 h-10' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  X: ({ className = 'w-3.5 h-3.5' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  User: ({ className = 'w-4 h-4' }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProfessionalSearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [filteredIdentities, setFilteredIdentities] = useState<Identity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublicIdentities();
  }, []);

  const fetchPublicIdentities = async () => {
    try {
      setIsLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/identities/public/professional`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch public identities');
      const data = await response.json();
      setIdentities(data.identities || []);
      setFilteredIdentities(data.identities || []);
      setError('');
    } catch (err) {
      console.error('Error fetching public identities:', err);
      setError('Failed to load public identities');
      setIdentities([]);
      setFilteredIdentities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllIdentities = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/identities/all/professional`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch identities');
      const data = await response.json();
      return data.identities || [];
    } catch (err) {
      console.error('Error fetching identities:', err);
      return [];
    }
  };

  const searchAbortRef = useRef<AbortController | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // Cancel any in-flight search request
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    if (!query.trim()) {
      // Always restore public-only list when query is cleared
      setFilteredIdentities(identities);
      return;
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/identities/all/professional`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Failed to fetch identities');
      const data = await response.json();
      const allIdentities: Identity[] = data.identities || [];
      const lowercaseQuery = query.toLowerCase();
      const filtered = allIdentities.filter((identity: Identity) =>
        identity.preferredName.toLowerCase().includes(lowercaseQuery) ||
        identity.legalName.toLowerCase().includes(lowercaseQuery) ||
        identity.nickname.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredIdentities(filtered);
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Stale request — ignore
      console.error('Error fetching identities:', err);
    }
  };

  const clearSearch = () => {
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    setSearchQuery('');
    setFilteredIdentities(identities);
  };

  return (
    <div className="min-h-screen bg-[#09090f]" style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}>

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[560px] h-[560px] rounded-full bg-purple-950/70 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-violet-950/50 blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        {/* ── Page heading ── */}
        <div className="mb-10">
          <p className="text-[11px] font-semibold text-purple-400 tracking-[0.22em] uppercase mb-2">
            Directory
          </p>
          <p className="text-gray-600 text-sm mt-3">
            Discover and connect with professional identity profiles.
          </p>
        </div>

        {/* ── Search bar ── */}
        <style>{`
          .search-input:-webkit-autofill,
          .search-input:-webkit-autofill:hover,
          .search-input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px transparent inset !important;
            -webkit-text-fill-color: white !important;
            background-color: transparent !important;
          }
        `}</style>
        <div className="relative mb-10">
          <div
            className="flex items-center gap-3 rounded-2xl px-5 py-4 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', colorScheme: 'dark' }}
            onFocusCapture={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'rgba(109,40,217,0.5)';
              el.style.background = 'rgba(109,40,217,0.06)';
            }}
            onBlurCapture={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = 'rgba(255,255,255,0.09)';
              el.style.background = 'rgba(255,255,255,0.04)';
            }}
          >
            <span className="text-gray-600 flex-shrink-0">
              <Icons.Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by preferred name, legal name, or nickname…"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              autoComplete="off"
              suppressHydrationWarning
              className="search-input flex-1 text-white placeholder-gray-600 text-sm outline-none"
              style={{ fontFamily: 'inherit', colorScheme: 'dark', backgroundColor: 'transparent', background: 'transparent', color: 'white' }}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="flex-shrink-0 text-gray-600 hover:text-gray-300 transition-colors cursor-pointer"
              >
                <Icons.X />
              </button>
            )}
          </div>
        </div>

        {/* ── States ── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            <p className="text-gray-600 text-xs tracking-widest uppercase">Loading profiles</p>
          </div>

        ) : error ? (
          <div
            className="p-5 rounded-2xl flex items-start gap-3"
            style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}
          >
            <span className="text-red-400 mt-0.5"><Icons.AlertCircle /></span>
            <div>
              <p className="text-red-300 text-sm font-medium">{error}</p>
              <button
                onClick={fetchPublicIdentities}
                className="text-red-400 hover:text-red-300 text-xs mt-1 cursor-pointer underline underline-offset-2"
              >
                Try again
              </button>
            </div>
          </div>

        ) : filteredIdentities.length === 0 ? (
          <div
            className="rounded-2xl py-24 flex flex-col items-center justify-center text-center"
            style={{ border: '1px dashed rgba(255,255,255,0.07)' }}
          >
            <span className="text-gray-700 mb-4 block">
              <Icons.Users className="w-12 h-12" />
            </span>
            <p className="text-gray-300 font-semibold mb-2">
              {searchQuery ? 'No results found' : 'No public profiles yet'}
            </p>
            <p className="text-gray-600 text-sm max-w-xs leading-relaxed">
              {searchQuery
                ? `No profiles match "${searchQuery}". Try a different search term.`
                : 'Public professional profiles will appear here once created.'}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="mt-6 px-5 py-2 rounded-xl text-sm font-medium text-purple-300 cursor-pointer transition-all"
                style={{ background: 'rgba(109,40,217,0.12)', border: '1px solid rgba(109,40,217,0.22)' }}
              >
                Clear search
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIdentities.map((identity) => (
              <ProfileCard
                key={identity.id}
                identity={identity}
                onClick={() => router.push(`/search/professional/${identity.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ identity, onClick }: { identity: Identity; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const isPrivate = identity.accountPrivacy === 'private';

  // Derive initials from preferredName
  const initials = identity.preferredName
    ? identity.preferredName.slice(0, 2).toUpperCase()
    : '??';

  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-2xl p-6 flex flex-col transition-all duration-200 cursor-pointer"
      style={{
        background: hovered ? 'rgba(109,40,217,0.07)' : 'rgba(255,255,255,0.025)',
        border: hovered ? '1px solid rgba(109,40,217,0.3)' : '1px solid rgba(255,255,255,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(109,40,217,0.12)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Card top */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#6d28d9,#7c3aed)' }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-white text-[15px] leading-tight">{identity.preferredName}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-violet-500/15 text-violet-300 border-violet-500/25">
              <Icons.Briefcase className="w-3 h-3" />
              Professional
            </span>
          </div>
        </div>

        {/* Privacy */}
        <span
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
            isPrivate
              ? 'bg-white/5 text-gray-400 border-white/10'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {isPrivate ? (
            <><Icons.Lock /> Private</>
          ) : (
            <span className="flex items-center gap-1">
              <Icons.User className="w-3 h-3" /> Public
            </span>
          )}
        </span>
      </div>

      {/* Divider */}
      <div className="w-full h-px mb-4" style={{ background: 'rgba(255,255,255,0.05)' }} />

      {/* Fields */}
      <div className="flex-1 space-y-3 mb-5">
        <Field label="Legal Name" value={identity.legalName} />
        {!isPrivate && identity.nickname && (
          <Field label="Nickname" value={identity.nickname} />
        )}
        {isPrivate && (
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <Icons.Lock className="w-3 h-3" />
            <span>Profile details are private</span>
          </div>
        )}
      </div>

      {/* CTA row */}
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-xs text-gray-600">View full profile</span>
        <span
          className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
          style={{
            background: hovered ? 'rgba(109,40,217,0.25)' : 'rgba(109,40,217,0.1)',
            border: '1px solid rgba(109,40,217,0.2)',
            color: '#c4b5fd',
          }}
        >
          <Icons.ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-gray-600 uppercase tracking-[0.15em] mb-0.5 font-medium">{label}</p>
      <p className="text-sm font-medium text-gray-200">{value}</p>
    </div>
  );
}