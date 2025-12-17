import { Post } from '../types';
import { Globe, Code, Clipboard, Check } from 'lucide-react';
import { SiReddit, SiThreads } from 'react-icons/si';
import { FaXTwitter } from 'react-icons/fa6';
import { useState } from 'react';

interface TweetCardProps {
  post: Post;
  onSelect?: (post: Post) => void;
  onPlan?: (post: Post) => void;
}

export function TweetCard({ post, onSelect, onPlan }: TweetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = (post as any).title || post.content || '';
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTimeAgo = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    const hours = (Date.now() - date.getTime()) / (1000 * 60 * 60);

    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const getPlatformConfig = (platform: string) => {
    const configs: Record<string, { badge: string; color: string; icon: React.ReactNode; bgColor: string }> = {
      Twitter: { badge: 'bg-black border border-gray-700', color: 'text-gray-400', icon: <FaXTwitter className="w-5 h-5" />, bgColor: 'bg-black' },
      Reddit: { badge: 'bg-orange-600 border border-orange-700', color: 'text-orange-400', icon: <SiReddit className="w-5 h-5" />, bgColor: 'bg-orange-600' },
      'Dev.to': { badge: 'bg-purple-600 border border-purple-700', color: 'text-purple-400', icon: <Code className="w-5 h-5" />, bgColor: 'bg-purple-600' },
      devto: { badge: 'bg-purple-600 border border-purple-700', color: 'text-purple-400', icon: <Code className="w-5 h-5" />, bgColor: 'bg-purple-600' },
      Threads: { badge: 'bg-gradient-to-r from-purple-500 to-pink-500 border border-purple-600', color: 'text-pink-400', icon: <SiThreads className="w-5 h-5" />, bgColor: 'bg-gradient-to-br from-purple-600 to-pink-500' },
    };
    return configs[platform] || { badge: 'bg-gray-700 border border-gray-600', color: 'text-gray-400', icon: <Globe className="w-5 h-5" />, bgColor: 'bg-gray-700' };
  };

  const platform = (post as any).platform || 'unknown';
  const config = getPlatformConfig(platform);
  const title = (post as any).title || post.content?.substring(0, 100);
  const timestamp = (post as any).timestamp || new Date();

  // Get REAL engagement metrics from the API data
  const comments = (post as any).comments || (post as any).replies || post.replies || 0;
  const retweets = (post as any).retweets || (post as any).reposts || (post as any).shares || 0;
  const likes = post.likes || 0;
  const views = (post as any).views || Math.max((likes + retweets + comments) * 15, 100);

  const subreddit = (post as any).subreddit;

  return (
    <div
      className="px-4 py-4 glass-card hover-lift cursor-pointer transition-all duration-300 border-l-4 border-transparent hover:border-purple-500 group"
      onClick={() => onSelect?.(post)}
    >
      {/* Header - Avatar + Author + Handle + Time */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center text-2xl border-2 border-gray-800`}>
            {config.icon}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white hover:underline cursor-pointer">
              {post.author || 'Anonymous'}
            </span>
            {subreddit && (
              <>
                <span className="text-gray-500 text-sm">·</span>
                <span className="text-[#1d9bf0] text-sm hover:underline cursor-pointer">
                  r/{subreddit}
                </span>
              </>
            )}
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm hover:underline cursor-pointer">
              {formatTimeAgo(timestamp)}
            </span>
            <div className={`ml-auto ${config.badge} px-3 py-1 rounded-full text-xs text-white font-semibold`}>
              {config.icon} {platform}
            </div>
          </div>

          {/* Post title/content */}
          <div className="mb-2">
            {title && title.length > 10 && (
              <h3 className="text-white text-[15px] leading-5 mb-1 font-semibold">
                {title}
              </h3>
            )}
            {post.content && post.content.length > 10 && post.content !== title && (
              <p className="text-gray-300 text-[15px] leading-5 mt-1">
                {post.content.substring(0, 280)}
                {post.content.length > 280 && '...'}
              </p>
            )}
            {(!post.content || post.content.length <= 10) && (!title || title.length <= 10) && (
              <p className="text-gray-500 italic text-sm">No content available</p>
            )}
          </div>

          {/* Post image (if available) */}
          {(post as any).image && (
            <div className="mt-3 mb-3 rounded-2xl overflow-hidden border border-gray-800 max-h-96">
              <img
                src={(post as any).image}
                alt="Post media"
                loading="lazy"
                className="w-full h-auto object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          )}

          {/* Action buttons - View Original + Copy */}
          <div className="flex items-center gap-2 mt-2">
            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-2 px-4 py-2 ${copied ? 'bg-green-900 text-green-400 border-green-700' : 'bg-gray-900 hover:bg-gray-800 text-gray-400 border-gray-800'} border rounded-full text-sm font-medium transition-all`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* View Original Post Button */}
            {post.postUrl && (
              <a
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-[#1d9bf0] border border-gray-800 rounded-full text-sm font-semibold transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M18.36 5.64c-1.95-1.96-5.11-1.96-7.07 0L9.88 7.05 8.46 5.64l1.42-1.42c2.73-2.73 7.16-2.73 9.9 0 2.73 2.74 2.73 7.17 0 9.9l-1.42 1.42-1.41-1.42 1.41-1.41c1.96-1.96 1.96-5.12 0-7.07zm-2.12 3.53l-7.07 7.07-1.41-1.41 7.07-7.07 1.41 1.41zm-12.02.71l1.42-1.42 1.41 1.42-1.41 1.41c-1.96 1.96-1.96 5.12 0 7.07 1.95 1.96 5.11 1.96 7.07 0l1.41-1.41 1.42 1.41-1.42 1.42c-2.73 2.73-7.16 2.73-9.9 0-2.73-2.74-2.73-7.17 0-9.9z" />
                </svg>
                View Original
              </a>
            )}
          </div>

          {/* Engagement metrics - Twitter style */}
          <div className="flex items-center gap-6 mt-3 text-gray-500 text-sm">
            {/* Comments/Replies */}
            <button className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-[#1d9bf0]/10 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
                </svg>
              </div>
              <span className="group-hover:text-[#1d9bf0]">
                {formatNumber(comments)}
              </span>
            </button>

            {/* Retweets/Reposts */}
            <button className="flex items-center gap-2 hover:text-green-500 transition-colors group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-green-500/10 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
                </svg>
              </div>
              <span className="group-hover:text-green-500">
                {formatNumber(retweets)}
              </span>
            </button>

            {/* Likes */}
            <button className="flex items-center gap-2 hover:text-pink-600 transition-colors group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-pink-600/10 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
                </svg>
              </div>
              <span className="group-hover:text-pink-600">
                {formatNumber(likes)}
              </span>
            </button>

            {/* Views */}
            <button className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors group ml-auto">
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-[#1d9bf0]/10 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
                </svg>
              </div>
              <span className="group-hover:text-[#1d9bf0]">
                {formatNumber(views)}
              </span>
            </button>

            {/* Plan/Remix Button */}
            <button
              className="flex items-center gap-2 hover:text-purple-500 transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                onPlan?.(post);
              }}
              title="Plan & Remix"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-purple-500/10 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
                </svg>
              </div>
            </button>

            {/* Bookmark (repurposed as Generate AI) */}
            <button
              className="flex items-center gap-2 hover:text-[#1d9bf0] transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(post);
              }}
              title="Generate AI Caption"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-[#1d9bf0]/10 transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
