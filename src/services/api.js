import axios from 'axios';
import { mockNewsArticles, mockAiResponse } from './mockData';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

// Create Election
export const createElection = async (electionData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/create-election`, electionData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating election:', error);
    throw error;
  }
};

// Fetch All Elections
export const fetchElections = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/all-election`);
    return response.data;
  } catch (error) {
    console.error('Error fetching elections:', error);
    throw error;
  }
};

// Fetch Single Election by ID
export const fetchElectionById = async (id) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/election/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching election details:', error);
    throw error;
  }
};

// Update Election
export const updateElection = async (id, electionData) => {
  try {
    const response = await axios.put(`${BACKEND_URL}/update-election/${id}`, electionData, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating election:', error);
    throw error;
  }
};

// Delete Election
export const deleteElection = async (id) => {
  try {
    const response = await axios.delete(`${BACKEND_URL}/delete-election/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting election:', error);
    throw error;
  }
};

export const submitVote = async (voteData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/vote`, voteData, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('user.token')}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw error;
  }
};

// AI Response with Live or Mock Fallback
export const getAiResponse = async (userInput) => {
  if (BACKEND_URL) {
    try {
      const response = await axios.post(`${BACKEND_URL}/getAiResponse`,
        { userInput },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('user.token')}` }
        }
      );
      return response.data;
    } catch (error) {
      console.warn('Real AI API failed, using mock:', error.message);
    }
  }
  return { response: mockAiResponse };
};

/**
 * Integrated News Fetching with Pagination support
 * @param {string} searchQuery - Search query
 * @param {string|number} page - Page number (NewsAPI) or NextPage Token (NewsData.io)
 */
export const fetchNews = async (searchQuery = 'elections OR politics', page = 1) => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'YOUR_REAL_NEWS_API_KEY_HERE') {
    return { articles: mockNewsArticles, totalResults: mockNewsArticles.length };
  }

  try {
    // 1. NewsData.io (detecting 'pub_' prefix)
    if (NEWS_API_KEY.startsWith('pub_')) {
      const response = await axios.get('https://newsdata.io/api/1/news', {
        params: {
          apikey: NEWS_API_KEY,
          q: searchQuery,
          language: 'en',
          page: page !== 1 ? page : undefined // Pass nextPage token if not first page
        }
      });

      if (response.data.status === 'success') {
        return {
          articles: response.data.results.map(item => ({
            title: item.title,
            description: item.description || item.content || 'No description available.',
            urlToImage: item.image_url,
            publishedAt: item.pubDate,
            source: { name: item.source_id || 'News' },
            url: item.link
          })),
          nextPage: response.data.nextPage, // NewsData.io uses nextPage tokens
          totalResults: response.data.totalResults
        };
      }
    } 
    // 2. NewsAPI.org
    else {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: searchQuery,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 12,
          page: page,
          apiKey: NEWS_API_KEY
        }
      });

      if (response.data.status === 'ok') {
        return {
          articles: response.data.articles,
          totalResults: response.data.totalResults,
          nextPage: response.data.totalResults > page * 12 ? page + 1 : null
        };
      }
    }
  } catch (error) {
    console.error('News fetch error:', error.response?.data?.message || error.message);
  }

  return { articles: mockNewsArticles, totalResults: mockNewsArticles.length };
};