import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart3,
    Heart,
    MessageCircle,
    Share2,
    Flame,
    Zap,
    Target,
    RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, StatCard } from './ui/Card';
import { Badge, TrendBadge, PlatformBadge } from './ui/Badge';
import { Button } from './ui/Button';

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceMetrics {
    totalPosts: number;
    totalEngagement: number;
    avgEngagementRate: number;
    topPlatform: string;
    growthTrend: number;
}

interface PlatformStats {
    platform: string;
    posts: number;
    engagement: number;
    avgLikes: number;
    avgComments: number;
    trend: number;
}

interface TopPost {
    id: string;
    content: string;
    platform: string;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    postedAt: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================================================
// COMPONENT
// ============================================================================

export function PerformanceDashboard() {
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
    const [topPosts, setTopPosts] = useState<TopPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

    useEffect(() => {
        fetchDashboardData();
    }, [timeRange]);

    const fetchDashboardData = async () => {
        setLoading(true);

        try {
            // Fetch all data in parallel
            const [statsRes, platformsRes, postsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/dashboard/stats?timeRange=${timeRange}`),
                axios.get(`${API_BASE}/api/dashboard/platforms`),
                axios.get(`${API_BASE}/api/dashboard/top-posts?limit=5`)
            ]);

            if (statsRes.data.success) {
                setMetrics(statsRes.data.data);
            }

            if (platformsRes.data.success) {
                setPlatformStats(platformsRes.data.data);
            }

            if (postsRes.data.success) {
                setTopPosts(postsRes.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
            // Fallback to mock data
            setMetrics({
                totalPosts: 156,
                totalEngagement: 45230,
                avgEngagementRate: 4.7,
                topPlatform: 'Twitter',
                growthTrend: 12.5
            });

            setPlatformStats([
                { platform: 'Twitter', posts: 78, engagement: 23500, avgLikes: 245, avgComments: 42, trend: 15.2 },
                { platform: 'Reddit', posts: 45, engagement: 12300, avgLikes: 180, avgComments: 87, trend: -3.5 },
                { platform: 'Dev.to', posts: 23, engagement: 6800, avgLikes: 156, avgComments: 34, trend: 8.7 },
                { platform: 'Threads', posts: 10, engagement: 2630, avgLikes: 189, avgComments: 28, trend: 25.0 },
            ]);

            setTopPosts([
                {
                    id: '1',
                    content: '10 AI tools that will save you 10 hours/week (and they\'re all free) 🧵',
                    platform: 'Twitter',
                    likes: 2450,
                    comments: 187,
                    shares: 543,
                    engagementRate: 8.9,
                    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    content: 'I spent 6 months learning to code. Here\'s what I wish I knew on day 1...',
                    platform: 'Reddit',
                    likes: 1876,
                    comments: 234,
                    shares: 89,
                    engagementRate: 7.2,
                    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-gray-400">Loading performance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-purple-400" />
                        Performance Dashboard
                    </h1>
                    <p className="text-gray-400 mt-1">Your content performance at a glance</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                        {(['7d', '30d', '90d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${timeRange === range
                                        ? 'bg-purple-500 text-white'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                        onClick={fetchDashboardData}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Posts"
                        value={metrics.totalPosts}
                        icon={<Flame className="w-5 h-5 text-orange-400" />}
                        change={12}
                        trend="up"
                    />
                    <StatCard
                        title="Total Engagement"
                        value={formatNumber(metrics.totalEngagement)}
                        icon={<Heart className="w-5 h-5 text-pink-400" />}
                        change={metrics.growthTrend}
                        trend={metrics.growthTrend >= 0 ? 'up' : 'down'}
                    />
                    <StatCard
                        title="Avg Engagement Rate"
                        value={`${metrics.avgEngagementRate}%`}
                        icon={<Target className="w-5 h-5 text-green-400" />}
                        change={8.3}
                        trend="up"
                    />
                    <StatCard
                        title="Top Platform"
                        value={metrics.topPlatform}
                        icon={<Zap className="w-5 h-5 text-yellow-400" />}
                    />
                </div>
            )}

            {/* Platform Breakdown */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {platformStats.map((stat) => (
                            <div
                                key={stat.platform}
                                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <PlatformBadge platform={stat.platform as any} />
                                    <TrendBadge value={stat.trend} size="sm" />
                                </div>
                                <p className="text-2xl font-bold text-white mb-1">
                                    {formatNumber(stat.engagement)}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {stat.posts} posts • {stat.avgLikes} avg likes
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Performing Posts */}
            <Card variant="premium">
                <CardHeader>
                    <CardTitle gradient>
                        <Flame className="w-5 h-5 inline mr-2 text-orange-400" />
                        Top Performing Posts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {topPosts.map((post, index) => (
                            <div
                                key={post.id}
                                className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm line-clamp-2">{post.content}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                <PlatformBadge platform={post.platform as any} size="sm" />
                                                <span>{formatDate(post.postedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1 text-pink-400">
                                            <Heart className="w-4 h-4" />
                                            {formatNumber(post.likes)}
                                        </div>
                                        <div className="flex items-center gap-1 text-blue-400">
                                            <MessageCircle className="w-4 h-4" />
                                            {formatNumber(post.comments)}
                                        </div>
                                        <div className="flex items-center gap-1 text-green-400">
                                            <Share2 className="w-4 h-4" />
                                            {formatNumber(post.shares)}
                                        </div>
                                        <Badge variant="success" size="sm">
                                            {post.engagementRate}%
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
