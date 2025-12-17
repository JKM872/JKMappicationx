import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { Post } from '../types';
import { Flame, Calendar, CalendarDays, Globe, AlertCircle } from 'lucide-react';

interface SearchBarProps {
  onResults: (posts: Post[]) => void;
  platform?: string;
}

export interface SearchBarHandle {
  triggerSearch: (searchQuery: string) => void;
}

type RecencyFilter = 'all' | 'week' | 'month' | 'today';

export const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(function SearchBar(
  { onResults, platform: externalPlatform },
  ref
) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('');
  const [recencyFilter, setRecencyFilter] = useState<RecencyFilter>('all');
  const platform = externalPlatform || 'all';
  const abortControllerRef = useRef<AbortController | null>(null);

  const recencyOptions = [
    { id: 'today' as RecencyFilter, label: 'Today', icon: Flame },
    { id: 'week' as RecencyFilter, label: 'This Week', icon: Calendar },
    { id: 'month' as RecencyFilter, label: 'This Month', icon: CalendarDays },
    { id: 'all' as RecencyFilter, label: 'All Time', icon: Globe },
  ];

  // Expose triggerSearch method to parent
  useImperativeHandle(ref, () => ({
    triggerSearch: (searchQuery: string) => {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }));

  const filterByRecency = (posts: Post[]): Post[] => {
    const now = new Date();

    return posts.filter(post => {
      if (recencyFilter === 'all') return true;

      const postDate = post.timestamp ? new Date(post.timestamp) : null;
      if (!postDate) {
        // If no timestamp, check hoursAgo
        if (post.hoursAgo !== undefined) {
          if (recencyFilter === 'today') return post.hoursAgo <= 24;
          if (recencyFilter === 'week') return post.hoursAgo <= 168; // 7 * 24
          if (recencyFilter === 'month') return post.hoursAgo <= 720; // 30 * 24
        }
        return true; // Include if we can't determine
      }

      const diffHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);

      switch (recencyFilter) {
        case 'today': return diffHours <= 24;
        case 'week': return diffHours <= 168;
        case 'month': return diffHours <= 720;
        default: return true;
      }
    }).map(post => ({
      ...post,
      // Add "hot" indicator for posts less than 6 hours old with high engagement
      isHot: (post.hoursAgo !== undefined && post.hoursAgo < 6 && post.score > 100)
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    performSearch(query);
  };

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError('');
    setLoadingStatus('Searching...');
    onResults([]); // Clear previous results immediately

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Show progressive status updates
      const statusMessages = [
        'Searching Reddit...',
        'Searching Dev.to...',
        'Searching Twitter...',
        'Searching Threads...',
        'Processing results...'
      ];

      let statusIndex = 0;
      const statusInterval = setInterval(() => {
        if (statusIndex < statusMessages.length) {
          setLoadingStatus(statusMessages[statusIndex]);
          statusIndex++;
        }
      }, 3000);

      const res = await axios.get(`${apiUrl}/api/search`, {
        params: { query: searchQuery, limit: 50, platform }, // Request more to filter
        signal: abortControllerRef.current.signal,
        timeout: 60000 // 60 second timeout
      });

      clearInterval(statusInterval);

      if (res.data.success) {
        const posts = res.data.data;

        // Apply recency filter
        const filteredPosts = filterByRecency(posts);

        // Progressive loading - add posts in batches for smooth UX
        const batchSize = 5;
        for (let i = 0; i < filteredPosts.length; i += batchSize) {
          const batch = filteredPosts.slice(0, i + batchSize);
          onResults(batch);

          // Small delay between batches for visual effect
          if (i + batchSize < filteredPosts.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        setLoadingStatus('');
      } else {
        setError('Search failed. Please try again.');
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        // Request was cancelled, don't show error
        return;
      }
      console.error('Search failed:', err);
      setError('Failed to connect to API. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-3">
      {/* X/Twitter style search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904 1.178-1.177 1.904-2.801 1.904-4.596 0-3.59-2.91-6.5-6.5-6.5zm-8.5 6.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5c0 1.986-.682 3.815-1.824 5.262l4.781 4.781-1.414 1.414-4.781-4.781c-1.447 1.142-3.276 1.824-5.262 1.824-4.694 0-8.5-3.806-8.5-8.5z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError('');
          }}
          placeholder="Search viral posts..."
          className="w-full bg-gray-900 text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:bg-black focus:ring-2 focus:ring-[#1d9bf0] placeholder-gray-500 transition-all"
          disabled={loading}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <svg className="animate-spin h-5 w-5 text-[#1d9bf0]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {/* Recency Filter Pills */}
      <div className="flex gap-2 flex-wrap">
        {recencyOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setRecencyFilter(option.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${recencyFilter === option.id
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
              }`}
          >
            <option.icon className="w-3.5 h-3.5" />
            {option.label}
          </button>
        ))}
      </div>

      {/* Loading status indicator */}
      {loading && loadingStatus && (
        <div className="text-[#1d9bf0] text-sm bg-[#1d9bf0]/10 px-4 py-2 rounded-lg border border-[#1d9bf0]/30 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {loadingStatus}
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
    </form>
  );
});

