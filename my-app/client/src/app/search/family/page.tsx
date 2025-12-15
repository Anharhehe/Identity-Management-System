'use client';

import { useState, useEffect } from 'react';
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

export default function FamilySearchPage() {
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
      const response = await fetch(`${apiUrl}/identities/public/family`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch public identities');
      }

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
      const response = await fetch(`${apiUrl}/identities/all/family`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch identities');
      }

      const data = await response.json();
      return data.identities || [];
    } catch (err) {
      console.error('Error fetching identities:', err);
      return [];
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredIdentities(identities);
    } else {
      const allIdentities = await fetchAllIdentities();
      const lowercaseQuery = query.toLowerCase();
      const filtered = allIdentities.filter((identity: Identity) =>
        identity.preferredName.toLowerCase().includes(lowercaseQuery) ||
        identity.legalName.toLowerCase().includes(lowercaseQuery) ||
        identity.nickname.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredIdentities(filtered);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-200 rounded-lg p-8">
          <h1 className="text-4xl font-bold dark:text-white text-gray-900 mb-4">Family Identity Search</h1>
          <p className="dark:text-gray-400 text-gray-600 mb-8">
            Search and discover family identity profiles
          </p>

          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search by preferred name, legal name, or nickname..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500 bg-gray-100 border border-gray-300 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="dark:text-gray-400 text-gray-600">Loading profiles...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="dark:text-red-400 text-red-600">{error}</p>
            </div>
          ) : filteredIdentities.length === 0 ? (
            <div className="text-center py-12">
              <p className="dark:text-gray-400 text-gray-600">
                {searchQuery ? 'No profiles match your search' : 'No public profiles available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIdentities.map((identity) => (
                <button
                  key={identity.id}
                  onClick={() => router.push(`/search/family/${identity.id}`)}
                  className="dark:bg-gray-700 bg-gray-50 border dark:border-gray-600 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow text-left hover:scale-105 transform transition-transform cursor-pointer"
                >
                  <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-2">{identity.preferredName}</h3>
                  <p className="dark:text-gray-400 text-gray-600 text-sm mb-4">Family identity profile</p>
                  <div className="space-y-2">
                    <p className="dark:text-gray-300 text-gray-700 text-sm"><span className="font-semibold">Legal Name:</span> {identity.legalName}</p>
                    {identity.accountPrivacy === 'public' && identity.nickname && (
                      <p className="dark:text-gray-300 text-gray-700 text-sm"><span className="font-semibold">Nickname:</span> {identity.nickname}</p>
                    )}
                    {identity.accountPrivacy === 'public' && (
                      <p className="dark:text-gray-300 text-gray-700 text-sm"><span className="font-semibold">Context:</span> Family</p>
                    )}
                    {identity.accountPrivacy === 'private' && (
                      <p className="dark:text-orange-400 text-orange-600 text-sm font-semibold">🔒 Private Account</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
