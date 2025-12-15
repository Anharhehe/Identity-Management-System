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

export default function PersonalFavoritesPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Identity[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      // Fetch friends
      const friendsResponse = await fetch(`${apiUrl}/friends/personal`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Fetch friend requests
      const requestsResponse = await fetch(`${apiUrl}/friend-requests/personal`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        setFriends(friendsData.friends || []);
      }

      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json();
        setFriendRequests(requestsData.requests || []);
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
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/friends/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          friendIdentityId: friendId,
          context: 'personal',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      setFriends(friends.filter(friend => friend.id !== friendId));
    } catch (err) {
      console.error('Error removing friend:', err);
      alert('Failed to remove friend');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/friend-requests/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
          context: 'personal',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept request');
      }

      setFriendRequests(friendRequests.filter(req => req.id !== requestId));
      fetchData();
    } catch (err) {
      console.error('Error accepting request:', err);
      alert('Failed to accept request');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/friend-requests/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline request');
      }

      setFriendRequests(friendRequests.filter(req => req.id !== requestId));
    } catch (err) {
      console.error('Error declining request:', err);
      alert('Failed to decline request');
    }
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold dark:text-white text-gray-900 mb-2">
            Personal Friends
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Your friends in personal context
          </p>
        </div>

        {/* Friend Requests Section */}
        {friendRequests.length > 0 && (
          <div className="mb-8 dark:bg-blue-900 bg-blue-50 border dark:border-blue-700 border-blue-200 rounded-lg p-6">
            <h2 className="text-2xl font-bold dark:text-blue-100 text-blue-900 mb-4">
              Friend Requests ({friendRequests.length})
            </h2>
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="dark:bg-blue-800 bg-white rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="dark:text-white text-gray-900 font-semibold">
                      {request.senderName}
                    </p>
                    <p className="dark:text-blue-300 text-blue-600 text-sm">
                      Sent {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium cursor-pointer"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Friend Requests Message */}
        {!friendRequests.length && !isLoading && (
          <div className="mb-8 dark:bg-blue-900 bg-blue-50 border dark:border-blue-700 border-blue-200 rounded-lg p-6">
            <p className="dark:text-blue-100 text-blue-900 text-center">
              No follow requests at the moment
            </p>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="dark:text-gray-400 text-gray-600">Loading friends...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="dark:text-red-400 text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-12">
            <p className="dark:text-gray-400 text-gray-600 mb-4">
              No friends in personal context yet. Start following people!
            </p>
            <Link
              href="/search/personal"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Explore Personal Profiles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold dark:text-white text-gray-900">
                      {friend.preferredName}
                    </h3>
                    <p className="dark:text-gray-400 text-gray-600 text-sm">
                      Personal
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="text-red-500 hover:text-red-700 text-xl transition-colors cursor-pointer"
                    title="Remove friend"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="dark:text-gray-300 text-gray-700 text-sm">
                    <span className="font-semibold">Legal Name:</span> {friend.legalName}
                  </p>
                  {friend.nickname && (
                    <p className="dark:text-gray-300 text-gray-700 text-sm">
                      <span className="font-semibold">Nickname:</span> {friend.nickname}
                    </p>
                  )}
                  <p className="dark:text-gray-400 text-gray-600 text-xs">
                    Friends since {new Date(friend.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => router.push(`/search/personal/${friend.id}`)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
