'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { IoSearch } from 'react-icons/io5';
import { AiOutlineHeart } from 'react-icons/ai';
import { BiMessageDots } from 'react-icons/bi';
import { CgProfile } from 'react-icons/cg';
import { BiLogOut } from 'react-icons/bi';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useTheme } from '@/context/ThemeContext';
import { useLoading } from '@/context/LoadingContext';

export default function Header() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { showLoader, hideLoader } = useLoading();
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const [showFavoritesMenu, setShowFavoritesMenu] = useState(false);
  const [userIdentities, setUserIdentities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUserIdentities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/identities`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const contexts = data.identities?.map((identity: any) => identity.context) || [];
          setUserIdentities(contexts);
        }
      } catch (error) {
        console.error('Error fetching identities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserIdentities();
  }, []);

  const handleLogout = () => {
    showLoader();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => {
      router.push('/');
      setTimeout(() => hideLoader(), 1000);
    }, 800);
  };

  const handleProfile = () => {
    showLoader();
    setTimeout(() => {
      router.push('/dashboard');
      setTimeout(() => hideLoader(), 1000);
    }, 800);
  };

  const handleNavigation = (path: string) => {
    showLoader();
    setTimeout(() => {
      router.push(path);
      setTimeout(() => hideLoader(), 1000);
    }, 800);
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left Side - Logo */}
        <button
          onClick={() => handleNavigation('/')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <Image
            src="/icon.png"
            alt="IMS Logo"
            width={70}
            height={70}
            className="rounded-lg"
          />
          <h1 className="text-xl font-bold text-white"></h1>
        </button>

        {/* Right Side - Icons */}
        <div className="flex items-center gap-6">
          {/* Search Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSearchMenu(!showSearchMenu)}
              className="text-gray-300 hover:text-white transition-colors text-xl p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
              title="Search"
            >
              <IoSearch />
            </button>
            
            {/* Dropdown Menu */}
            {showSearchMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 top-full">
                <button
                  onClick={() => {
                    if (userIdentities.includes('personal')) {
                      handleNavigation('/search/personal');
                      setShowSearchMenu(false);
                    }
                  }}
                  disabled={!userIdentities.includes('personal')}
                  className={`w-full text-left px-4 py-3 transition-colors first:rounded-t-lg ${
                    userIdentities.includes('personal')
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer'
                      : 'text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  title={userIdentities.includes('personal') ? '' : 'Create a personal identity first'}
                >
                  Personal
                </button>
                <button
                  onClick={() => {
                    if (userIdentities.includes('professional')) {
                      handleNavigation('/search/professional');
                      setShowSearchMenu(false);
                    }
                  }}
                  disabled={!userIdentities.includes('professional')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    userIdentities.includes('professional')
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer'
                      : 'text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  title={userIdentities.includes('professional') ? '' : 'Create a professional identity first'}
                >
                  Professional
                </button>
                <button
                  onClick={() => {
                    if (userIdentities.includes('family')) {
                      handleNavigation('/search/family');
                      setShowSearchMenu(false);
                    }
                  }}
                  disabled={!userIdentities.includes('family')}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    userIdentities.includes('family')
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer'
                      : 'text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  title={userIdentities.includes('family') ? '' : 'Create a family identity first'}
                >
                  Family
                </button>
                <button
                  onClick={() => {
                    if (userIdentities.includes('online')) {
                      handleNavigation('/search/online');
                      setShowSearchMenu(false);
                    }
                  }}
                  disabled={!userIdentities.includes('online')}
                  className={`w-full text-left px-4 py-3 transition-colors last:rounded-b-lg ${
                    userIdentities.includes('online')
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer'
                      : 'text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  title={userIdentities.includes('online') ? '' : 'Create an online identity first'}
                >
                  Online
                </button>
              </div>
            )}
          </div>

          {/* Heart/Favorites Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFavoritesMenu(!showFavoritesMenu)}
              className="text-gray-300 hover:text-white transition-colors text-xl p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
              title="Favorites"
            >
              <AiOutlineHeart />
            </button>
            
            {/* Favorites Dropdown Menu */}
            {showFavoritesMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 top-full">
                <button
                  onClick={() => {
                    handleNavigation('/favorites/personal');
                    setShowFavoritesMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 transition-colors first:rounded-t-lg text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  title="Personal favorites"
                >
                  Personal
                </button>
                <button
                  onClick={() => {
                    handleNavigation('/favorites/professional');
                    setShowFavoritesMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 transition-colors text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  title="Professional favorites"
                >
                  Professional
                </button>
                <button
                  onClick={() => {
                    handleNavigation('/favorites/family');
                    setShowFavoritesMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 transition-colors text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  title="Family favorites"
                >
                  Family
                </button>
                <button
                  onClick={() => {
                    handleNavigation('/favorites/online');
                    setShowFavoritesMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 transition-colors last:rounded-b-lg text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                  title="Online favorites"
                >
                  Online
                </button>
              </div>
            )}
          </div>

          {/* Chat Button */}
          <button
            onClick={() => router.push('/messages')}
            className="text-gray-300 hover:text-white transition-colors text-xl p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
            title="Messages"
          >
            <BiMessageDots />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-700"></div>

          {/* Profile Button */}
          <button
            onClick={handleProfile}
            className="text-gray-300 hover:text-white transition-colors text-xl p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
            title="Profile"
          >
            <CgProfile />
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="text-gray-300 hover:text-white transition-colors text-xl p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:text-red-400 transition-colors text-xl p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
            title="Logout"
          >
            <BiLogOut />
          </button>
        </div>
      </div>
    </header>
  );
}
