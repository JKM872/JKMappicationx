import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { SiReddit, SiThreads } from 'react-icons/si';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface AuthorGrowth {
    author_handle: string;
    platform: string;
    current_followers: number;
    previous_followers: number;
    growth_absolute: number;
    growth_percentage: number;
    period_hours: number;
}

interface AuthorHistoryPoint {
    recorded_at: string;
    followers_count: number;
}

export function AuthorGrowthTracker() {
    const [topGrowing, setTopGrowing] = useState<AuthorGrowth[]>([]);
    const [selectedAuthor, setSelectedAuthor] = useState<AuthorGrowth | null>(null);
    const [authorHistory, setAuthorHistory] = useState<AuthorHistoryPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [platform, setPlatform] = useState<string>('');

    useEffect(() => {
        fetchTopGrowing();
    }, [platform]);

    const fetchTopGrowing = async () => {
        setLoading(true);
        try {
            const url = platform
                ? `${API_BASE}/api/analytics/author-growth/top?platform=${platform}&limit=10`
                : `${API_BASE}/api/analytics/author-growth/top?limit=10`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setTopGrowing(data.data);
                if (data.data.length > 0 && !selectedAuthor) {
                    setSelectedAuthor(data.data[0]);
                    fetchAuthorHistory(data.data[0].author_handle, data.data[0].platform);
                }
            }
        } catch (error) {
            console.error('Error fetching top growing authors:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuthorHistory = async (authorHandle: string, authorPlatform: string) => {
        setHistoryLoading(true);
        try {
            const response = await fetch(
                `${API_BASE}/api/analytics/author-growth/history?author=${authorHandle}&platform=${authorPlatform}&limit=50`
            );
            const data = await response.json();

            if (data.success) {
                // Format for chart - reverse to show oldest first
                const formatted = [...data.data].reverse().map((point: any) => ({
                    recorded_at: new Date(point.recorded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    }),
                    followers_count: point.followers_count,
                }));
                setAuthorHistory(formatted);
            }
        } catch (error) {
            console.error('Error fetching author history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleSelectAuthor = (author: AuthorGrowth) => {
        setSelectedAuthor(author);
        fetchAuthorHistory(author.author_handle, author.platform);
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
                return <Users className="w-4 h-4" />;
        }
    };

    const getPlatformColor = (platformName: string): string => {
        switch (platformName.toLowerCase()) {
            case 'twitter':
                return 'text-blue-400';
            case 'reddit':
                return 'text-orange-500';
            case 'threads':
                return 'text-white';
            case 'dev.to':
                return 'text-purple-400';
            default:
                return 'text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-7 w-56 bg-white/5 rounded skeleton mb-2"></div>
                        <div className="h-4 w-72 bg-white/5 rounded skeleton"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-10 w-32 bg-white/5 rounded-lg skeleton"></div>
                        <div className="h-10 w-10 bg-white/5 rounded-lg skeleton"></div>
                    </div>
                </div>

                {/* Main Content Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Author List Skeleton */}
                    <div className="lg:col-span-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
                        <div className="h-6 w-40 bg-white/5 rounded skeleton mb-4"></div>
                        <div className="space-y-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="p-3 rounded-lg bg-gray-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-white/10 rounded skeleton"></div>
                                        <div className="w-8 h-8 bg-white/10 rounded-full skeleton"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-24 bg-white/10 rounded skeleton"></div>
                                            <div className="h-3 w-16 bg-white/5 rounded skeleton"></div>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <div className="h-4 w-12 bg-green-500/20 rounded skeleton"></div>
                                            <div className="h-3 w-8 bg-white/5 rounded skeleton"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detail & Chart Skeleton */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Stats Cards Skeleton */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-white/10 rounded-full skeleton"></div>
                                <div className="space-y-2">
                                    <div className="h-6 w-32 bg-white/10 rounded skeleton"></div>
                                    <div className="h-4 w-20 bg-white/5 rounded skeleton"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-gray-800/50 rounded-xl p-4">
                                        <div className="h-3 w-24 bg-white/5 rounded skeleton mb-2"></div>
                                        <div className="h-8 w-16 bg-white/10 rounded skeleton"></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chart Skeleton */}
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="h-6 w-48 bg-white/5 rounded skeleton mb-4"></div>
                            <div className="h-[250px] bg-white/5 rounded skeleton"></div>
                        </div>
                    </div>
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
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        Author Growth Tracker
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Track which authors are gaining followers fastest</p>
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
                        onClick={fetchTopGrowing}
                        className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Growing Authors List */}
                <div className="lg:col-span-1 bg-gray-900 rounded-xl p-4 border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                        Top Growing (7 days)
                    </h3>
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {topGrowing.map((author, idx) => (
                            <div
                                key={`${author.author_handle}-${author.platform}`}
                                onClick={() => handleSelectAuthor(author)}
                                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedAuthor?.author_handle === author.author_handle &&
                                    selectedAuthor?.platform === author.platform
                                    ? 'bg-green-900/30 border border-green-700'
                                    : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-gray-600 w-6">#{idx + 1}</span>
                                    <span className={getPlatformColor(author.platform)}>
                                        {getPlatformIcon(author.platform)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">@{author.author_handle}</p>
                                        <p className="text-xs text-gray-500">{author.platform}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-400 font-semibold flex items-center gap-1">
                                            <ArrowUpRight className="w-3 h-3" />
                                            {author.growth_percentage > 0 ? '+' : ''}
                                            {author.growth_percentage.toFixed(1)}%
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            +{formatNumber(author.growth_absolute)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Author Detail & Chart */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Selected Author Stats */}
                    {selectedAuthor && (
                        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`p-3 rounded-full bg-gray-800 ${getPlatformColor(selectedAuthor.platform)}`}>
                                    {getPlatformIcon(selectedAuthor.platform)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">@{selectedAuthor.author_handle}</h3>
                                    <p className="text-gray-400">{selectedAuthor.platform}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-800/50 rounded-xl p-4">
                                    <p className="text-sm text-gray-400 mb-1">Current Followers</p>
                                    <p className="text-2xl font-bold">{formatNumber(selectedAuthor.current_followers)}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-xl p-4">
                                    <p className="text-sm text-gray-400 mb-1">7 Day Gain</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        +{formatNumber(selectedAuthor.growth_absolute)}
                                    </p>
                                </div>
                                <div className="bg-gray-800/50 rounded-xl p-4">
                                    <p className="text-sm text-gray-400 mb-1">Growth Rate</p>
                                    <p className="text-2xl font-bold flex items-center gap-1">
                                        {selectedAuthor.growth_percentage >= 0 ? (
                                            <ArrowUpRight className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <ArrowDownRight className="w-5 h-5 text-red-400" />
                                        )}
                                        <span className={selectedAuthor.growth_percentage >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {selectedAuthor.growth_percentage.toFixed(1)}%
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Growth Chart */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold mb-4">Follower Growth History</h3>
                        {historyLoading ? (
                            <div className="flex justify-center items-center h-[250px]">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : authorHistory.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={authorHistory}>
                                    <defs>
                                        <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="recorded_at" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(val) => formatNumber(val)} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#fff' }}
                                        formatter={(value: number) => [formatNumber(value), 'Followers']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="followers_count"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={false}
                                        fill="url(#colorFollowers)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[250px] text-gray-500">
                                <Users className="w-12 h-12 mb-2 opacity-50" />
                                <p>Select an author to view growth history</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
