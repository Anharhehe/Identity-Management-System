'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BiSearch } from 'react-icons/bi';
import { MdNewspaper } from 'react-icons/md';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  source: string;
  publishedAt: string;
  category?: string;
}

const DEFAULT_CATEGORIES = ['General', 'Technology', 'Business', 'Sports', 'Health', 'Entertainment'];

// Mock news data as fallback
const MOCK_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Neurosurgeon reveals 5 simple habits to rebuild brain health from zero',
    description: 'Discover 5 simple habits recommended by neurosurgeon Dr. Jay Jagannathan to enhance brain health and resilience.',
    image: 'https://via.placeholder.com/300x200?text=Brain+Health',
    url: '#',
    source: 'Health Daily',
    publishedAt: new Date().toISOString(),
    category: 'Health',
  },
  {
    id: '2',
    title: 'PlayStation Portal\'s Latest Update Proves Sony Needs a Real Handheld Console Again',
    description: 'Cloud gaming remains the future, but Sony needs a real handheld console to compete properly.',
    image: 'https://via.placeholder.com/300x200?text=PlayStation',
    url: '#',
    source: 'Tech Review',
    publishedAt: new Date().toISOString(),
    category: 'Technology',
  },
  {
    id: '3',
    title: 'Sunderland pay tribute to club legend Gary Rowell after sad passing before Newcastle Unit',
    description: 'Sunderland have paid tribute to Gary Rowell after the club legend passed away at the age of 68.',
    image: 'https://via.placeholder.com/300x200?text=Football',
    url: '#',
    source: 'Sports Today',
    publishedAt: new Date().toISOString(),
    category: 'Sports',
  },
];

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [news, setNews] = useState<NewsArticle[]>(MOCK_NEWS);
  const [filteredNews, setFilteredNews] = useState<NewsArticle[]>(MOCK_NEWS);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      // Try multiple news sources
      const sources = [
        'https://newsapi.org/v2/top-headlines?country=us&apiKey=d0e44f85c0fa46a8ba02f4b86a8cad77',
        'https://newsdata.io/api/1/news?apikey=pub_335dac47f51ae25a84d9c4f5e4c8f8a0db8d9&language=en',
      ];

      for (const source of sources) {
        try {
          const response = await fetch(source);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
              const mappedArticles = data.articles.map((article: any, index: number) => ({
                id: `${article.url || article.link}-${index}`,
                title: article.title,
                description: article.description || article.content || '',
                image: article.urlToImage || article.image_url || 'https://via.placeholder.com/300x200?text=News',
                url: article.url || article.link || '#',
                source: article.source?.name || article.source || 'News Source',
                publishedAt: article.publishedAt || article.pubDate || new Date().toISOString(),
                category: 'general',
              }));
              
              setNews(mappedArticles);
              setFilteredNews(mappedArticles);
              setLastUpdated(new Date().toLocaleTimeString());
              return;
            }
          }
        } catch (error) {
          console.log(`Source failed, trying next...`);
          continue;
        }
      }
      
      // If all APIs fail, use mock data
      console.log('Using mock data as fallback');
      setNews(MOCK_NEWS);
      setFilteredNews(MOCK_NEWS);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews(MOCK_NEWS);
      setFilteredNews(MOCK_NEWS);
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category.toLowerCase());
    handleSearch(searchQuery, category.toLowerCase());
  };

  const handleSearch = (query: string, category?: string) => {
    setSearchQuery(query);
    const cat = category || selectedCategory;
    filterNews(news, cat, query);
  };

  const filterNews = (articles: NewsArticle[], category: string, query: string) => {
    let filtered = articles;

    if (query.trim()) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredNews(filtered);
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-white">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* News Feed Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MdNewspaper className="text-3xl text-purple-600" />
            <h1 className="text-3xl font-bold dark:text-white text-gray-900">News Feed</h1>
          </div>

          {/* Search Bar with Button */}
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <BiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 dark:text-gray-400 text-gray-600 text-xl" />
              <input
                type="text"
                placeholder="Search news by keyword..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3 dark:bg-gray-800 bg-white dark:text-white text-gray-900 dark:border-gray-700 border-gray-300 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <button
              onClick={() => handleSearch(searchQuery)}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {DEFAULT_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  selectedCategory === category.toLowerCase()
                    ? 'bg-purple-600 text-white'
                    : 'dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Last Updated */}
          <p className="dark:text-gray-400 text-gray-600 text-sm">
            {lastUpdated && `Last updated: ${lastUpdated}`}
          </p>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="dark:text-gray-400 text-gray-600">Loading news...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.length > 0 ? (
              filteredNews.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark:bg-gray-800 bg-gray-50 rounded-lg overflow-hidden border dark:border-gray-700 border-gray-200 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full hover:-translate-y-1"
                >
                  {article.image && (
                    <div className="w-full h-48 overflow-hidden bg-gray-300">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-base font-bold dark:text-white text-gray-900 mb-2 line-clamp-3">
                      {article.title}
                    </h3>
                    <p className="dark:text-gray-400 text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                      {article.description}
                    </p>
                    <div className="flex justify-between items-center text-xs dark:text-gray-500 text-gray-500 pt-3 border-t dark:border-gray-700 border-gray-200">
                      <span className="font-medium">{article.source}</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </a>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="dark:text-gray-400 text-gray-600 text-lg">No news found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        {!isAuthenticated && (
          <>
            <div className="mt-20 mb-16">
              <h2 className="text-4xl font-bold dark:text-white text-gray-900 mb-8 text-center">
                About IMS
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="dark:bg-gray-800 bg-gray-50 rounded-lg p-8 border dark:border-gray-700 border-gray-200">
                  <div className="text-4xl mb-4">🔐</div>
                  <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-3">Secure Authentication</h3>
                  <p className="dark:text-gray-400 text-gray-600">
                    Your account is protected with bcrypt password hashing and JWT token authentication.
                  </p>
                </div>

                <div className="dark:bg-gray-800 bg-gray-50 rounded-lg p-8 border dark:border-gray-700 border-gray-200">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-3">Multiple Identities</h3>
                  <p className="dark:text-gray-400 text-gray-600">
                    Create different identity profiles for professional, personal, family, and online contexts.
                  </p>
                </div>

                <div className="dark:bg-gray-800 bg-gray-50 rounded-lg p-8 border dark:border-gray-700 border-gray-200">
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-xl font-semibold dark:text-white text-gray-900 mb-3">Easy Management</h3>
                  <p className="dark:text-gray-400 text-gray-600">
                    Easily create, edit, view, and delete your identity profiles from your dashboard.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-3xl font-bold dark:text-white text-gray-900 mb-6">Ready to get started?</h3>
                <button
                  onClick={() => router.push('/auth')}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Create Your Account
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}