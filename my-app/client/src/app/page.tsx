'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BiSearch, BiCalendar, BiNews, BiMessageDots } from 'react-icons/bi';

interface Article {
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  url: string;
}

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [rateLimitError, setRateLimitError] = useState(false);

  const GNEWS_API_KEY = 'a639d637ab1c4ab8fcc2097a98ce5d8d';
  const categories = ['general', 'technology', 'business', 'sports', 'health', 'entertainment'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const fetchNews = async (query?: string, category?: string, pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }
      setError('');

      if (!GNEWS_API_KEY) {
        setError('API key not configured. Please add NEXT_PUBLIC_GNEWS_API_KEY to your environment.');
        setIsLoading(false);
        return;
      }

      let url = `https://gnews.io/api/v4/`;
      const offset = (pageNum - 1) * 20;

      if (query) {
        url += `search?q=${encodeURIComponent(query)}&lang=en&max=20&skip=${offset}&apikey=${GNEWS_API_KEY}`;
      } else {
        url += `top-headlines?category=${category || 'general'}&lang=en&max=20&skip=${offset}&apikey=${GNEWS_API_KEY}`;
      }

      const response = await fetch(url);
      
      if (response.status === 429) {
        setRateLimitError(true);
        setHasMore(false);
        throw new Error('API rate limit exceeded. Please try again later.');
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const newArticles = data.articles || [];

      // If no new articles, stop loading more
      if (newArticles.length === 0) {
        setHasMore(false);
        return;
      }

      if (append) {
        setArticles((prev) => [...prev, ...newArticles]);
      } else {
        setArticles(newArticles);
      }

      setLastUpdated(new Date());
      setRateLimitError(false);
    } catch (err) {
      console.error('Error fetching news:', err);
      if (!append) {
        setError(err instanceof Error ? err.message : 'Failed to load news. Please try again later.');
        setArticles([]);
      } else {
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchNews(undefined, selectedCategory, 1, false);
  }, [selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500 && !isLoadingMore && !isLoading && hasMore) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoadingMore, isLoading, hasMore]);

  useEffect(() => {
    if (page > 1) {
      fetchNews(searchQuery || undefined, selectedCategory, page, true);
    }
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setPage(1);
      fetchNews(searchQuery, undefined, 1, false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">
      {/* Header */}
      <header className="dark:bg-gray-800 bg-white border-b dark:border-gray-700 border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BiNews className="text-3xl text-purple-600" />
              <h1 className="text-2xl font-bold dark:text-white text-gray-900">News Feed</h1>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <>
                  <nav className="flex gap-4">
                    <button
                      onClick={() => router.push('/')}
                      className="px-4 py-2 dark:text-gray-300 text-gray-700 hover:dark:text-white hover:text-gray-900 font-medium transition-colors cursor-pointer"
                    >
                      Home
                    </button>
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="px-4 py-2 dark:text-gray-300 text-gray-700 hover:dark:text-white hover:text-gray-900 font-medium transition-colors cursor-pointer"
                    >
                      Dashboard
                    </button>
                  </nav>
                  <button
                    onClick={() => router.push('/messages')}
                    className="p-2 dark:text-gray-300 text-gray-700 hover:dark:text-white hover:text-gray-900 transition-colors cursor-pointer relative"
                    title="Messages"
                  >
                    <BiMessageDots className="text-2xl" />
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <button
                  onClick={() => router.push('/auth')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <BiSearch className="absolute left-3 top-3 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search news by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 bg-gray-100 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'dark:bg-gray-700 dark:text-gray-300 bg-gray-200 text-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <p className="text-sm dark:text-gray-400 text-gray-600 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 dark:bg-red-900 dark:text-red-100 bg-red-50 text-red-700 rounded-lg border dark:border-red-700 border-red-200">
            <p className="font-semibold mb-2">⚠️ {error}</p>
            {rateLimitError && (
              <p className="text-sm">
                The free API tier allows 100 requests per day. You can upgrade your API key or try again tomorrow.
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="dark:bg-gray-800 bg-white rounded-lg overflow-hidden border dark:border-gray-700 border-gray-200 animate-pulse"
              >
                <div className="w-full h-48 dark:bg-gray-700 bg-gray-300" />
                <div className="p-4 space-y-3">
                  <div className="h-4 dark:bg-gray-700 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 dark:bg-gray-700 bg-gray-300 rounded" />
                  <div className="h-4 dark:bg-gray-700 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <BiNews className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="dark:text-gray-400 text-gray-600 text-lg">
              No news available. Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="dark:bg-gray-800 bg-white rounded-lg overflow-hidden border dark:border-gray-700 border-gray-200 hover:shadow-lg transition-shadow group cursor-pointer"
              >
                {/* Image */}
                {article.image && (
                  <div className="relative w-full h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4 flex flex-col h-full">
                  <h3 className="font-semibold dark:text-white text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="dark:text-gray-400 text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                    {article.description}
                  </p>

                  {/* Footer */}
                  <div className="border-t dark:border-gray-700 border-gray-200 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="dark:text-gray-400 text-gray-600 font-medium">
                        {article.source.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 dark:text-gray-500 text-gray-500 text-xs">
                      <BiCalendar className="text-sm" />
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Loading More Indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-8">
            <div className="animate-spin">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
            </div>
          </div>
        )}

        {/* End of News */}
        {!hasMore && articles.length > 0 && (
          <div className="text-center py-8">
            <p className="dark:text-gray-400 text-gray-600">
              You've reached the end of available news. Try a different category or search!
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="dark:bg-gray-800 dark:border-gray-700 bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center dark:text-gray-400 text-gray-600">
          <p>&copy; 2025 Identity Management System. News powered by GNews API.</p>
        </div>
      </footer>
    </div>
  );
}