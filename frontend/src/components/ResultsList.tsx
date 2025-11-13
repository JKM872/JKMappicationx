import { Post } from '../types';

interface ResultsListProps {
  posts: Post[];
  onSelectPost?: (post: Post) => void;
  loading?: boolean;
}

export function ResultsList({ posts, onSelectPost, loading = false }: ResultsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">🔍 No results yet. Try searching for viral posts!</p>
        <p className="text-sm mt-2">Example: "javascript", "AI", "React"</p>
      </div>
    );
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTimeAgo = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    const hours = (Date.now() - date.getTime()) / (1000 * 60 * 60);
    
    if (hours < 1) {
      return `${Math.round(hours * 60)}m ago`;
    }
    if (hours < 24) {
      return `${Math.round(hours)}h ago`;
    }
    return `${Math.round(hours / 24)}d ago`;
  };

  const platformConfig = {
    reddit: { name: '🤖 Reddit', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-500' },
    devto: { name: '👨‍💻 Dev.to', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-600' },
    hackernews: { name: '⚡ Hacker News', color: 'bg-amber-50 border-amber-200', badge: 'bg-amber-600' },
    rss: { name: '📰 RSS Feed', color: 'bg-gray-50 border-gray-200', badge: 'bg-gray-600' },
  };

  return (
    <div className="space-y-3">
      {posts.map((post, idx) => {
        const platform = (post as any).platform || 'rss';
        const config = platformConfig[platform as keyof typeof platformConfig] || platformConfig.rss;
        
        return (
          <div
            key={post.id || idx}
            className={`block p-4 border rounded-lg hover:shadow-lg transition-all cursor-pointer ${config.color}`}
            onClick={() => onSelectPost?.(post)}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white mb-2 ${config.badge}`}>
                  {config.name}
                </span>
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2">
                  {(post as any).title || post.content?.substring(0, 100)}
                </h3>
              </div>
              <span className="ml-2 text-lg font-bold text-green-600 whitespace-nowrap">
                {post.score?.toFixed(0) || '0'}
              </span>
            </div>

            {/* Content */}
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {post.content}
            </p>

            {/* Stats */}
            <div className="flex gap-4 text-xs text-gray-600">
              <span>👤 {post.author}</span>
              <span>❤️ {formatNumber(post.likes || 0)}</span>
              <span>💬 {formatNumber((post as any).comments || post.replies || 0)}</span>
              <span>📅 {formatTimeAgo((post as any).timestamp || new Date())}</span>
            </div>

            {/* View Link */}
            {post.postUrl && (
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                View Post →
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
