import { useState } from 'react';
import axios from 'axios';
import { Post } from '../types';

interface SearchBarProps {
  onResults: (posts: Post[]) => void;
}

export function SearchBar({ onResults }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.get(`${apiUrl}/api/search`, {
        params: { query, limit: 30, platform },
      });

      if (res.data.success) {
        onResults(res.data.data);
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err) {
      console.error('Search failed:', err);
      setError('Failed to connect to API. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError('');
            }}
            placeholder="Enter niche, hashtag, or keyword... (e.g., #javascript, AI, React)"
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 text-sm"
            disabled={loading}
          />
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-gray-800 text-sm bg-white"
            disabled={loading}
          >
            <option value="all">🌐 All Platforms</option>
            <option value="twitter">𝕏 Twitter</option>
            <option value="reddit">🤖 Reddit</option>
            <option value="devto">👨‍💻 Dev.to</option>
          </select>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </span>
            ) : (
              '🔍 Search'
            )}
          </button>
        </div>
        
        {error && (
          <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded border border-red-200">
            ⚠️ {error}
          </div>
        )}
      </form>
    </div>
  );
}
