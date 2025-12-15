'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BiMessageDots } from 'react-icons/bi';

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

export default function ProfessionalProfilePage() {
  const params = useParams();
  const router = useRouter();
  const identityId = params.id as string;

  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [buttonState, setButtonState] = useState<'follow' | 'message' | 'send-request' | 'request-sent'>('follow');
  const [actionLoading, setActionLoading] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    fetchIdentityProfile();
  }, [identityId]);

  useEffect(() => {
    if (identity) {
      checkFriendshipStatus();
    }
  }, [identity]);

  const checkFriendshipStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/friends/check/${identityId}/professional`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFriend(data.isFriend);
        if (data.isFriend) {
          setButtonState('message');
        }
      }
    } catch (err) {
      console.error('Error checking friendship:', err);
      setIsFriend(false);
    }
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
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setIdentity(data.identity);
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/friends/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          friendIdentityId: identityId,
          context: 'professional',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to follow');
      }

      saveButtonState('message');
    } catch (err) {
      console.error('Error following:', err);
      alert('Failed to follow this user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/friend-requests/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientIdentityId: identityId,
          context: 'professional',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send request');
      }

      saveButtonState('request-sent');
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Failed to send friend request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfollow = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/friends/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          friendIdentityId: identityId,
          context: 'professional',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unfollow');
      }

      saveButtonState('follow');
    } catch (err) {
      console.error('Error unfollowing:', err);
      alert('Failed to unfollow this user');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-white flex items-center justify-center">
        <p className="dark:text-gray-400 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (error || !identity) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="dark:text-red-400 text-red-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPublic = identity.accountPrivacy === 'public';

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">
      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="dark:bg-gray-800 bg-white border dark:border-gray-700 border-gray-200 rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold dark:text-white text-gray-900 mb-2">
              {identity.preferredName}
            </h1>
            <p className="dark:text-gray-400 text-gray-600">Professional Identity</p>
          </div>

          <div className="space-y-6">
            {/* Always show these */}
            <div className="dark:bg-gray-700 bg-gray-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="dark:text-gray-400 text-gray-600 text-sm">Legal Name</p>
                  <p className="dark:text-white text-gray-900 font-medium">{identity.legalName}</p>
                </div>
                <div>
                  <p className="dark:text-gray-400 text-gray-600 text-sm">Preferred Name</p>
                  <p className="dark:text-white text-gray-900 font-medium">{identity.preferredName}</p>
                </div>
              </div>
            </div>

            {/* Show additional info if public OR if private but is friend */}
            {(isPublic || isFriend) && (
              <>
                {identity.nickname && (
                  <div className="dark:bg-gray-700 bg-gray-50 rounded-lg p-6">
                    <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                      Additional Information
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <p className="dark:text-gray-400 text-gray-600 text-sm">Nickname</p>
                        <p className="dark:text-white text-gray-900 font-medium">{identity.nickname}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="dark:bg-gray-700 bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
                    Profile Status
                  </h2>
                  <p className={`font-medium ${isPublic ? 'dark:text-green-400 text-green-600' : 'dark:text-blue-400 text-blue-600'}`}>
                    {isPublic ? 'Public Profile' : 'Private Profile (Friend)'}
                  </p>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {isPublic ? (
                buttonState === 'message' ? (
                  <div className="space-y-3">
                    <button
                      onClick={() => {}}
                      className="w-full py-3 rounded-lg font-semibold cursor-pointer transition-colors bg-green-600 text-white hover:bg-green-700"
                    >
                      <BiMessageDots className="inline mr-2" />
                      Message
                    </button>
                    <button
                      onClick={handleUnfollow}
                      disabled={actionLoading}
                      className="w-full py-3 rounded-lg font-semibold cursor-pointer transition-colors bg-red-600 text-white hover:bg-red-700"
                    >
                      Unfollow
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-lg font-semibold cursor-pointer transition-colors bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Follow
                  </button>
                )
              ) : isFriend ? (
                <div className="space-y-3">
                  <button
                    onClick={() => {}}
                    className="w-full py-3 rounded-lg font-semibold cursor-pointer transition-colors bg-green-600 text-white hover:bg-green-700"
                  >
                    <BiMessageDots className="inline mr-2" />
                    Message
                  </button>
                  <button
                    onClick={handleUnfollow}
                    disabled={actionLoading}
                    className="w-full py-3 rounded-lg font-semibold cursor-pointer transition-colors bg-red-600 text-white hover:bg-red-700"
                  >
                    Unfollow
                  </button>
                </div>
              ) : buttonState === 'request-sent' ? (
                <button
                  disabled
                  className="w-full py-3 rounded-lg font-semibold cursor-not-allowed transition-colors bg-blue-600 text-white opacity-75"
                >
                  ✓ Request Sent
                </button>
              ) : (
                <button
                  onClick={handleSendRequest}
                  disabled={actionLoading}
                  className="w-full py-3 rounded-lg font-semibold cursor-pointer transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                  Send Friend Request
                </button>
              )
            }
            </div>

            {!isPublic && !isFriend && (
              <div className="dark:bg-gray-700 bg-gray-50 rounded-lg p-6">
                <p className="dark:text-gray-400 text-gray-600 text-sm">
                  🔒 This is a private profile. Limited information is visible.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
