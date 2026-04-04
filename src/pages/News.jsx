import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Filter,
  Globe2,
  Newspaper,
  RefreshCw,
  Search,
  Filter as FilterIcon,
  Clock,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Plus
} from 'lucide-react';
import { fetchNews } from '../services/api';

// News Categories Component
const NewsCategories = ({ onCategorySelect, activeCategory }) => {
  const categories = [
    { name: 'Elections', icon: Globe2, color: 'text-blue-500' },
    { name: 'Voting', icon: FilterIcon, color: 'text-green-500' },
    { name: 'Politics', icon: Newspaper, color: 'text-purple-500' }
  ];

  return (
    <div className="flex justify-center space-x-4 mb-6">
      {categories.map((category) => (
        <button
          key={category.name}
          className={`
            flex flex-col items-center justify-center 
            p-3 rounded-xl group transition-all duration-300 
            ${activeCategory === category.name.toLowerCase()
              ? 'bg-gray-100 shadow-md'
              : 'hover:bg-gray-50'}
          `}
          onClick={() => onCategorySelect(category.name.toLowerCase())}
        >
          <category.icon
            className={`
              ${category.color} 
              w-6 h-6 mb-2 
              group-hover:scale-110 transition-transform
            `}
          />
          <span className="text-xs font-medium text-gray-700">
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
};

// News Search Component
const NewsSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-6">
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search political news..."
          className="
            w-full pl-12 pr-4 py-3 
            border border-gray-200 
            rounded-full 
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-300
            text-sm
            shadow-sm focus:shadow-md
          "
        />
        <button
          type="submit"
          className="
            absolute right-2 top-1/2 -translate-y-1/2 
            bg-blue-500 text-white 
            rounded-full 
            px-4 py-2 
            text-xs
            hover:bg-blue-600 
            transition-colors
            shadow-md hover:shadow-lg
          "
        >
          Search
        </button>
      </div>
    </form>
  );
};

// Article Card Component
const ArticleCard = ({ article, onReadMore }) => {
  return (
    <div className="
      bg-white 
      rounded-xl 
      shadow-lg 
      hover:shadow-xl 
      transition-all 
      duration-300 
      transform 
      hover:-translate-y-2 
      overflow-hidden
      border border-gray-100
    ">
      {/* Article Image (Placeholder if missing) */}
      <div
        className="h-48 bg-gray-200 bg-cover bg-center"
        style={{
          backgroundImage: article.urlToImage
            ? `url(${article.urlToImage})`
            : article.image_url 
              ? `url(${article.image_url})` 
              : 'linear-gradient(to right, #f0f0f0, #e0e0e0)'
        }}
      />

      <div className="p-5">
        <div className="flex items-center mb-3">
          <Clock className="text-gray-400 mr-2" size={16} />
          <span className="text-xs text-gray-500">
            {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Recent'}
          </span>
        </div>

        <h3 className="
          font-bold text-lg 
          text-gray-800 
          mb-3 
          line-clamp-2 
          hover:text-blue-600
        ">
          {article.title}
        </h3>

        <p className="
          text-sm 
          text-gray-600 
          mb-4 
          line-clamp-3
        ">
          {article.description}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <TrendingUp className="text-green-500 mr-2" size={16} />
            <span className="text-xs text-gray-500">
              {article.source?.name || 'News Source'}
            </span>
          </div>

          <button
            onClick={onReadMore}
            className="
              flex items-center 
              bg-blue-50 text-blue-600 
              px-3 py-2 
              rounded-full 
              text-xs 
              font-medium
              hover:bg-blue-100
              transition-colors
            "
          >
            <BookOpen className="mr-2" size={14} />
            Read More
          </button>
        </div>
      </div>
    </div>
  );
};

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('politics');
  const [nextPage, setNextPage] = useState(1); // nextPage token or number

  const getNewsData = async (searchQuery = 'elections', append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      
      setError(null);
      // If append is true, use the current nextPage value, else reset to 1
      const pageToFetch = append ? nextPage : 1;
      
      const data = await fetchNews(searchQuery, pageToFetch);
      
      if (append) {
        setArticles(prev => [...prev, ...(data.articles || [])]);
      } else {
        setArticles(data.articles || []);
      }
      
      setNextPage(data.nextPage || null);
      setLoading(false);
      setLoadingMore(false);
    } catch (err) {
      console.error('Error in News component:', err);
      setError(err.message || 'Failed to fetch news');
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    getNewsData(category);
  }, [category]);

  const handleCategorySelect = (selectedCategory) => {
    setArticles([]); // Clear existing
    setCategory(selectedCategory);
    getNewsData(selectedCategory, false);
  };

  const handleSearch = (query) => {
    setArticles([]); // Clear existing
    getNewsData(query, false);
  };

  const handleReadMore = (url) => {
    if (url) window.open(url, '_blank');
  };

  if (error) return (
    <div className="
      flex flex-col items-center justify-center mt-14
      min-h-screen 
      bg-gray-100 
      text-center 
      p-4
    ">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <p className="text-red-500 text-lg font-semibold mb-2">
        News Fetch Error
      </p>
      <p className="text-gray-600 max-w-md">
        {error}. There might be a problem with the API key or internet connection.
      </p>
      <button 
        onClick={() => getNewsData(category)}
        className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className=" mt-14
      min-h-screen 
      bg-gray-50 
      py-12 
      px-4 
      sm:px-6 
      lg:px-8
    ">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="
            text-4xl 
            font-extrabold 
            text-gray-900 
            mb-4 
            tracking-tight
          ">
            Political News Hub
          </h1>
          <p className="
            text-xl 
            text-gray-600 
            max-w-2xl 
            mx-auto
          ">
            Stay informed with real-time political insights and international developments
          </p>
        </div>

        <NewsSearch onSearch={handleSearch} />
        <NewsCategories
          onCategorySelect={handleCategorySelect}
          activeCategory={category}
        />

        {loading ? (
          <div className="flex justify-center items-center min-h-[40vh]">
            <RefreshCw className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6">
              {articles.map((article, index) => (
                <ArticleCard
                  key={`${article.url}-${index}`}
                  article={article}
                  onReadMore={() => handleReadMore(article?.url || article?.link)}
                />
              ))}
            </div>

            {nextPage && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => getNewsData(category, true)}
                  disabled={loadingMore}
                  className="
                    flex items-center gap-2
                    bg-white text-blue-600 border-2 border-blue-600
                    hover:bg-blue-50
                    px-8 py-3 
                    rounded-full 
                    font-bold
                    transition-all duration-300
                    shadow-md hover:shadow-lg
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                >
                  {loadingMore ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                  {loadingMore ? 'Loading...' : 'Load More Articles'}
                </button>
              </div>
            )}

            {!nextPage && articles.length > 0 && (
              <p className="text-center text-gray-500 mt-12 bg-gray-100 py-3 rounded-xl mx-auto max-w-xs">
                No more articles to show
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default News;
