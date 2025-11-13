import { Post } from '../types';

interface ResultsListProps {
  posts: Post[];
  onSelectPost?: (post: Post) => void;
}

export function ResultsList({ posts, onSelectPost }: ResultsListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No results yet. Try searching for viral posts!</p>
        <p className="text-sm mt-2">Example: "javascript", "#AI", "React hooks"</p>
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

  const formatTimeAgo = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m ago`;
    }
    if (hours < 24) {
      return `${Math.round(hours)}h ago`;
    }
    return `${Math.round(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      {posts.map((post, idx) => (
        <div
          key={idx}
          className="p-5 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all cursor-pointer"
          onClick={() => onSelectPost?.(post)}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {post.author[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <span className="font-bold text-gray-800">@{post.author}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {formatTimeAgo(post.hoursAgo)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white bg-green-500 px-3 py-1 rounded-full">
                🔥 {post.score.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                #{idx + 1}
              </span>
            </div>
          </div>

          {/* Content */}
          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {post.content}
          </p>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-1 text-red-500">
              <span>❤️</span>
              <span className="font-semibold">{formatNumber(post.likes)}</span>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <span>🔁</span>
              <span className="font-semibold">{formatNumber(post.retweets)}</span>
            </div>
            <div className="flex items-center gap-1 text-blue-500">
              <span>💬</span>
              <span className="font-semibold">{formatNumber(post.replies)}</span>
            </div>
            {post.postUrl && (
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                View Post →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
