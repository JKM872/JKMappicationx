import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Calendar,
    Clock,
    Plus,
    Trash2,
    Check,
    RefreshCw,
    Send,
    AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, StatCard } from './ui/Card';
import { Button } from './ui/Button';
import { Badge, PlatformBadge } from './ui/Badge';

// ============================================================================
// TYPES
// ============================================================================

interface ScheduledPost {
    id: string;
    content: string;
    platform: string;
    scheduled_date: string;
    status: 'scheduled' | 'published' | 'failed';
    hashtags?: string[];
}

interface SchedulerStats {
    pending: number;
    posted: number;
    failed: number;
    total: number;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================================================
// COMPONENT
// ============================================================================

export function SchedulerDashboard() {
    const [posts, setPosts] = useState<ScheduledPost[]>([]);
    const [stats, setStats] = useState<SchedulerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPost, setNewPost] = useState({
        content: '',
        platform: 'Twitter',
        scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
        hashtags: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [postsRes, statsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/scheduler/queue`),
                axios.get(`${API_BASE}/api/scheduler/stats`)
            ]);

            if (postsRes.data.success) {
                setPosts(postsRes.data.data);
            }
            if (statsRes.data.success) {
                setStats(statsRes.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch scheduler data:', err);
            // Mock data
            setPosts([
                {
                    id: '1',
                    content: 'Excited to share my new blog post about AI trends! 🚀',
                    platform: 'Twitter',
                    scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
                    status: 'scheduled'
                },
                {
                    id: '2',
                    content: 'Check out my latest project on GitHub...',
                    platform: 'Reddit',
                    scheduled_date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
                    status: 'scheduled'
                }
            ]);
            setStats({ pending: 2, posted: 15, failed: 1, total: 18 });
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async () => {
        if (!newPost.content || !newPost.platform) return;

        try {
            const res = await axios.post(`${API_BASE}/api/scheduler/schedule`, {
                content: newPost.content,
                platform: newPost.platform,
                scheduledFor: new Date(newPost.scheduledFor).toISOString(),
                hashtags: newPost.hashtags.split(',').map(h => h.trim()).filter(Boolean)
            });

            if (res.data.success) {
                await fetchData();
                setShowAddModal(false);
                setNewPost({
                    content: '',
                    platform: 'Twitter',
                    scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
                    hashtags: ''
                });
            }
        } catch (err) {
            console.error('Failed to schedule post:', err);
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await axios.delete(`${API_BASE}/api/scheduler/${id}`);
            setPosts(posts.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to cancel post:', err);
        }
    };

    const formatDateTime = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleString('pl-PL', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeUntil = (dateStr: string): string => {
        const now = new Date();
        const target = new Date(dateStr);
        const diffMs = target.getTime() - now.getTime();

        if (diffMs < 0) return 'Past due';

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }
        return `${hours}h ${minutes}m`;
    };

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-7 w-48 bg-white/5 rounded skeleton mb-2"></div>
                        <div className="h-4 w-56 bg-white/5 rounded skeleton"></div>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-9 w-24 bg-white/5 rounded-lg skeleton"></div>
                        <div className="h-9 w-32 bg-white/5 rounded-lg skeleton"></div>
                    </div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="glass-card rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-lg skeleton"></div>
                                <div className="space-y-2">
                                    <div className="h-3 w-16 bg-white/5 rounded skeleton"></div>
                                    <div className="h-6 w-10 bg-white/10 rounded skeleton"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Upcoming Posts Skeleton */}
                <div className="glass-card rounded-xl">
                    <div className="p-4 border-b border-white/10">
                        <div className="h-5 w-36 bg-white/10 rounded skeleton"></div>
                    </div>
                    <div className="p-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 bg-white/5 rounded-lg">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 bg-white/10 rounded-full skeleton"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-3/4 bg-white/10 rounded skeleton"></div>
                                        <div className="h-3 w-1/2 bg-white/5 rounded skeleton"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-16 bg-white/10 rounded skeleton"></div>
                                        <div className="h-8 w-8 bg-white/10 rounded skeleton"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-400" />
                        Content Scheduler
                    </h1>
                    <p className="text-gray-400 mt-1">Schedule and manage your posts</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
                        Refresh
                    </Button>
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                        Schedule Post
                    </Button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Pending"
                        value={stats.pending}
                        icon={<Clock className="w-5 h-5 text-yellow-400" />}
                    />
                    <StatCard
                        title="Posted"
                        value={stats.posted}
                        icon={<Check className="w-5 h-5 text-green-400" />}
                        trend="up"
                    />
                    <StatCard
                        title="Failed"
                        value={stats.failed}
                        icon={<AlertCircle className="w-5 h-5 text-red-400" />}
                    />
                    <StatCard
                        title="Total"
                        value={stats.total}
                        icon={<Send className="w-5 h-5 text-blue-400" />}
                    />
                </div>
            )}

            {/* Scheduled Posts */}
            <Card variant="glass">
                <CardHeader>
                    <CardTitle>
                        <Clock className="w-5 h-5 inline mr-2" />
                        Upcoming Posts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {posts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">No scheduled posts</p>
                            <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowAddModal(true)}>
                                Schedule Your First Post
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <p className="text-white text-sm line-clamp-2">{post.content}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <PlatformBadge platform={post.platform as any} size="sm" />
                                                <span className="text-xs text-gray-400">
                                                    {formatDateTime(post.scheduled_date)}
                                                </span>
                                                <Badge variant="info" size="sm">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {getTimeUntil(post.scheduled_date)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleCancel(post.id)}
                                                className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Schedule Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <Card variant="premium" className="w-full max-w-lg" onClick={(e) => e?.stopPropagation()}>
                        <CardHeader action={
                            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>✕</Button>
                        }>
                            <CardTitle>
                                <Plus className="w-5 h-5 inline mr-2" />
                                Schedule New Post
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Content</label>
                                    <textarea
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        placeholder="What would you like to post?"
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">Platform</label>
                                        <select
                                            value={newPost.platform}
                                            onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                        >
                                            <option value="Twitter" className="bg-gray-900">Twitter</option>
                                            <option value="Reddit" className="bg-gray-900">Reddit</option>
                                            <option value="Dev.to" className="bg-gray-900">Dev.to</option>
                                            <option value="Threads" className="bg-gray-900">Threads</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-gray-400 block mb-2">Schedule For</label>
                                        <input
                                            type="datetime-local"
                                            value={newPost.scheduledFor}
                                            onChange={(e) => setNewPost({ ...newPost, scheduledFor: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Hashtags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={newPost.hashtags}
                                        onChange={(e) => setNewPost({ ...newPost, hashtags: e.target.value })}
                                        placeholder="#viral, #content, #marketing"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>

                                <Button variant="primary" fullWidth onClick={handleSchedule} disabled={!newPost.content}>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Schedule Post
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
