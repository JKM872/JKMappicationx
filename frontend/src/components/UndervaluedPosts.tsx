import { useState, useEffect } from 'react';
import { Gem, TrendingUp, Heart, MessageCircle, Users, ExternalLink, RefreshCw, Sparkles } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { SiReddit, SiThreads } from 'react-icons/si';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UndervaluedPost {
    post_id: string;
    author: string;
    platform: string;
    content: string;
    title?: string;
    likes: number;
    comments: number;
    shares?: number;
    author_followers: number;
    engagement_rate: number;
    undervalue_score: number;
    postUrl?: string;
}

export function UndervaluedPosts() {
    const [posts, setPosts] = useState<UndervaluedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [platform, setPlatform] = useState<string>('');

    useEffect(() => {
        fetchUndervaluedPosts();
    }, [platform]);

    const fetchUndervaluedPosts = async () => {
        setLoading(true);
        try {
            const url = platform
                ? `${API_BASE}/api/analytics/undervalued?platform=${platform}&limit=15`
                : `${API_BASE}/api/analytics/undervalued?limit=15`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setPosts(data.data);
            }
        } catch (error) {
            console.error('Error fetching undervalued posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const getPlatformIcon = (platformName: string) => {
        switch (platformName.toLowerCase()) {
            case 'twitter':
                return <FaXTwitter className="w-4 h-4" />;
            case 'reddit':
                return <SiReddit className="w-4 h-4" />;
            case 'threads':
                return <SiThreads className="w-4 h-4" />;
            default:
                return <Sparkles className="w-4 h-4" />;
        }
    };

    const getPlatformColor = (platformName: string): string => {
        switch (platformName.toLowerCase()) {
            case 'twitter':
                return 'bg-blue-900/30 border-blue-700/50 text-blue-400';
            case 'reddit':
                return 'bg-orange-900/30 border-orange-700/50 text-orange-400';
            case 'threads':
                return 'bg-gray-900/30 border-gray-600/50 text-white';
            case 'dev.to':
                return 'bg-purple-900/30 border-purple-700/50 text-purple-400';
            default:
                return 'bg-gray-800/30 border-gray-700/50 text-gray-400';
        }
    };

    const getScoreBadge = (score: number) => {
        if (score >= 10000) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-600 to-amber-500 text-white flex items-center gap-1">
                    <Gem className="w-3 h-3" /> Legendary
                </span>
            );
        } else if (score >= 5000) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center gap-1">
                    <Gem className="w-3 h-3" /> Epic
                </span>
            );
        } else if (score >= 2000) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white flex items-center gap-1">
                    <Gem className="w-3 h-3" /> Rare
                </span>
            );
        }
        return (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-700 text-gray-300 flex items-center gap-1">
                <Gem className="w-3 h-3" /> Common
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-7 w-40 bg-white/5 rounded skeleton mb-2"></div>
                        <div className="h-4 w-80 bg-white/5 rounded skeleton"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-10 w-32 bg-white/5 rounded-lg skeleton"></div>
                        <div className="h-10 w-10 bg-white/5 rounded-lg skeleton"></div>
                    </div>
                </div>

                {/* Info Banner Skeleton */}
                <div className="bg-purple-900/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-white/10 rounded skeleton"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-48 bg-white/10 rounded skeleton"></div>
                            <div className="h-4 w-full bg-white/5 rounded skeleton"></div>
                            <div className="h-4 w-3/4 bg-white/5 rounded skeleton"></div>
                        </div>
                    </div>
                </div>

                {/* Posts Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="rounded-xl p-4 border border-white/10 bg-gray-900/50">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-white/10 rounded skeleton"></div>
                                    <div className="w-6 h-6 bg-white/10 rounded skeleton"></div>
                                    <div className="h-4 w-20 bg-white/10 rounded skeleton"></div>
                                </div>
                                <div className="h-6 w-16 bg-purple-500/20 rounded-full skeleton"></div>
                            </div>
                            {/* Content */}
                            <div className="space-y-2 mb-4">
                                <div className="h-4 w-full bg-white/5 rounded skeleton"></div>
                                <div className="h-4 w-5/6 bg-white/5 rounded skeleton"></div>
                                <div className="h-4 w-4/6 bg-white/5 rounded skeleton"></div>
                            </div>
                            {/* Stats */}
                            <div className="flex gap-4">
                                <div className="h-4 w-12 bg-white/10 rounded skeleton"></div>
                                <div className="h-4 w-12 bg-white/10 rounded skeleton"></div>
                                <div className="h-4 w-12 bg-white/10 rounded skeleton"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Gem className="w-6 h-6 text-purple-400" />
                        Hidden Gems
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Posts with high engagement from accounts with smaller followings — learn from the best underdog content
                    </p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All Platforms</option>
                        <option value="Twitter">Twitter/X</option>
                        <option value="Reddit">Reddit</option>
                        <option value="Threads">Threads</option>
                        <option value="Dev.to">Dev.to</option>
                    </select>
                    <button
                        onClick={fetchUndervaluedPosts}
                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-purple-300">Why Hidden Gems Matter</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            These posts achieved exceptional engagement despite having smaller audiences. They represent content
                            strategies that work regardless of follower count — perfect for learning what makes content go viral.
                        </p>
                    </div>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post, idx) => (
                    <div
                        key={post.post_id}
                        className={`rounded-xl p-4 border ${getPlatformColor(post.platform)} bg-gray-900/50 backdrop-blur-sm hover:scale-[1.02] transition-all duration-200`}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-600">#{idx + 1}</span>
                                <div className="flex items-center gap-1.5">
                                    {getPlatformIcon(post.platform)}
                                    <span className="text-sm font-medium">@{post.author}</span>
                                </div>
                            </div>
                            {getScoreBadge(post.undervalue_score)}
                        </div>

                        {/* Content */}
                        <div className="mb-4">
                            {post.title && (
                                <h4 className="font-semibold text-white mb-1 line-clamp-1">{post.title}</h4>
                            )}
                            <p className="text-gray-300 text-sm line-clamp-3">{post.content}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                                <div className="flex items-center justify-center gap-1 text-pink-400">
                                    <Heart className="w-3 h-3" />
                                    <span className="text-sm font-semibold">{formatNumber(post.likes)}</span>
                                </div>
                                <p className="text-xs text-gray-500">Likes</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                                <div className="flex items-center justify-center gap-1 text-blue-400">
                                    <MessageCircle className="w-3 h-3" />
                                    <span className="text-sm font-semibold">{formatNumber(post.comments)}</span>
                                </div>
                                <p className="text-xs text-gray-500">Comments</p>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                                <div className="flex items-center justify-center gap-1 text-gray-400">
                                    <Users className="w-3 h-3" />
                                    <span className="text-sm font-semibold">{formatNumber(post.author_followers)}</span>
                                </div>
                                <p className="text-xs text-gray-500">Followers</p>
                            </div>
                        </div>

                        {/* Undervalue Score */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-700/50">
                            <div>
                                <p className="text-xs text-gray-500">Undervalue Score</p>
                                <p className="text-lg font-bold text-purple-400">{Math.round(post.undervalue_score)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Engagement Rate</p>
                                <p className="text-lg font-bold text-green-400">{post.engagement_rate.toFixed(1)}%</p>
                            </div>
                            {post.postUrl && (
                                <a
                                    href={post.postUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {posts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Gem className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No hidden gems found</p>
                    <p className="text-sm">Try changing the platform filter or check back later</p>
                </div>
            )}
        </div>
    );
}
