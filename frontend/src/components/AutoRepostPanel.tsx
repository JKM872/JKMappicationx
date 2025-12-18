import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    RefreshCw,
    Calendar,
    Clock,
    TrendingUp,
    Play,
    Pause,
    Trash2,
    Heart,
    MessageCircle,
    Repeat2,
    Zap,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useToast } from './ui/Toast';

interface RepostCandidate {
    post_id: string;
    content: string;
    platform: string;
    original_date: string;
    engagement_rate: number;
    likes: number;
    comments: number;
    shares: number;
    repost_score: number;
    suggested_time?: string;
}

interface ScheduledRepost {
    id: string;
    original_post_id: string;
    content: string;
    platform: string;
    scheduled_for: string;
    status: 'pending' | 'posted' | 'cancelled';
}

interface AutoRepostSettings {
    enabled: boolean;
    minEngagementRate: number;
    minDaysSincePosted: number;
    maxDaysSincePosted: number;
    maxRepostsPerDay: number;
    platforms: string[];
    preferredTimes?: string[];
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AutoRepostPanel() {
    const { success: toastSuccess, error: toastError } = useToast();
    const [candidates, setCandidates] = useState<RepostCandidate[]>([]);
    const [scheduled, setScheduled] = useState<ScheduledRepost[]>([]);
    const [settings, setSettings] = useState<AutoRepostSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'candidates' | 'scheduled' | 'settings'>('candidates');
    const [scheduling, setScheduling] = useState<string | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('09:00');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [candidatesRes, scheduledRes, settingsRes] = await Promise.all([
                axios.get(`${API_BASE}/api/automation/auto-repost/candidates?limit=10`),
                axios.get(`${API_BASE}/api/automation/auto-repost/scheduled`),
                axios.get(`${API_BASE}/api/automation/auto-repost/settings`)
            ]);

            if (candidatesRes.data.success) setCandidates(candidatesRes.data.data);
            if (scheduledRes.data.success) setScheduled(scheduledRes.data.data);
            if (settingsRes.data.success) setSettings(settingsRes.data.data);
        } catch (err) {
            console.error('Failed to fetch auto-repost data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleAutoRepost = async () => {
        if (!settings) return;
        try {
            const res = await axios.post(`${API_BASE}/api/automation/auto-repost/toggle`, {
                enabled: !settings.enabled
            });
            if (res.data.success) {
                setSettings(res.data.data);
                toastSuccess(res.data.data.enabled ? 'Auto-repost włączony!' : 'Auto-repost wyłączony');
            }
        } catch (err) {
            console.error('Failed to toggle auto-repost:', err);
            toastError('Nie udało się zmienić ustawień');
        }
    };

    const scheduleRepost = async (candidate: RepostCandidate) => {
        if (!scheduleDate) {
            setError('Please select a date');
            return;
        }
        try {
            const scheduledFor = new Date(`${scheduleDate}T${scheduleTime}`);
            const res = await axios.post(`${API_BASE}/api/automation/auto-repost/schedule`, {
                candidate,
                scheduledFor: scheduledFor.toISOString()
            });
            if (res.data.success) {
                setScheduled([...scheduled, res.data.data]);
                setScheduling(null);
                setScheduleDate('');
                toastSuccess('Repost zaplanowany!');
            }
        } catch (err) {
            console.error('Failed to schedule repost:', err);
            setError('Failed to schedule. Please try again.');
            toastError('Nie udało się zaplanować repostu');
        }
    };

    const cancelRepost = async (id: string) => {
        try {
            const res = await axios.delete(`${API_BASE}/api/automation/auto-repost/${id}`);
            if (res.data.success) {
                setScheduled(scheduled.filter(r => r.id !== id));
                toastSuccess('Repost anulowany!');
            }
        } catch (err) {
            console.error('Failed to cancel repost:', err);
            toastError('Nie udało się anulować repostu');
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-500';
        if (score >= 60) return 'from-yellow-500 to-amber-500';
        return 'from-orange-500 to-red-500';
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                    <p className="text-gray-400">Loading auto-repost data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent flex items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-orange-400" />
                        Auto-Repost Winners
                    </h1>
                    <p className="text-gray-400 mt-1">Resurface your top-performing content automatically</p>
                </div>

                {/* Auto-Repost Toggle */}
                <button
                    onClick={toggleAutoRepost}
                    className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${settings?.enabled
                        ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                        }`}
                >
                    {settings?.enabled ? (
                        <>
                            <Play className="w-4 h-4" />
                            Auto-Repost ON
                        </>
                    ) : (
                        <>
                            <Pause className="w-4 h-4" />
                            Auto-Repost OFF
                        </>
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
                {[
                    { id: 'candidates', label: 'Top Posts', icon: TrendingUp },
                    { id: 'scheduled', label: `Scheduled (${scheduled.filter(s => s.status === 'pending').length})`, icon: Calendar },
                    { id: 'settings', label: 'Settings', icon: Clock }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Candidates Tab */}
            {activeTab === 'candidates' && (
                <div className="space-y-4">
                    {candidates.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No repost candidates found</p>
                            <p className="text-sm mt-1">Posts need to be at least 30 days old with good engagement</p>
                        </div>
                    ) : (
                        candidates.map((candidate) => (
                            <div
                                key={candidate.post_id}
                                className="glass-card p-4 rounded-xl border border-white/10 hover:border-orange-500/30 transition-all"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getScoreColor(candidate.repost_score)} text-white`}>
                                            <Zap className="w-3 h-3 inline mr-1" />
                                            {candidate.repost_score}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                                            {candidate.platform}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Originally: {formatDate(candidate.original_date)}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-white text-sm mb-3 line-clamp-2">{candidate.content}</p>

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-3.5 h-3.5 text-red-400" />
                                            {candidate.likes.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                                            {candidate.comments}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Repeat2 className="w-3.5 h-3.5 text-green-400" />
                                            {candidate.shares}
                                        </span>
                                        <span className="text-orange-400">
                                            {candidate.engagement_rate.toFixed(1)}% engagement
                                        </span>
                                    </div>

                                    {scheduling === candidate.post_id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
                                            />
                                            <input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
                                            />
                                            <button
                                                onClick={() => scheduleRepost(candidate)}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded-lg text-sm text-white flex items-center gap-1"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Confirm
                                            </button>
                                            <button
                                                onClick={() => setScheduling(null)}
                                                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-400"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setScheduling(candidate.post_id)}
                                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-all"
                                        >
                                            <Calendar className="w-4 h-4" />
                                            Schedule Repost
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Scheduled Tab */}
            {activeTab === 'scheduled' && (
                <div className="space-y-4">
                    {scheduled.filter(s => s.status === 'pending').length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No scheduled reposts</p>
                            <p className="text-sm mt-1">Schedule posts from the Top Posts tab</p>
                        </div>
                    ) : (
                        scheduled
                            .filter(s => s.status === 'pending')
                            .map((repost) => (
                                <div
                                    key={repost.id}
                                    className="glass-card p-4 rounded-xl border border-white/10 flex justify-between items-center"
                                >
                                    <div className="flex-1">
                                        <p className="text-white text-sm mb-2 line-clamp-1">{repost.content}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="bg-white/5 px-2 py-1 rounded">{repost.platform}</span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(repost.scheduled_for)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(repost.scheduled_for).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => cancelRepost(repost.id)}
                                        className="ml-4 p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && settings && (
                <div className="glass-card p-6 rounded-xl border border-white/10 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Auto-Repost Settings</h3>

                        <div className="grid gap-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white text-sm font-medium">Minimum Engagement Rate</p>
                                    <p className="text-xs text-gray-500">Posts must have at least this engagement</p>
                                </div>
                                <span className="text-orange-400 font-bold">{settings.minEngagementRate}%</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white text-sm font-medium">Post Age Range</p>
                                    <p className="text-xs text-gray-500">Days since original post</p>
                                </div>
                                <span className="text-orange-400 font-bold">{settings.minDaysSincePosted} - {settings.maxDaysSincePosted} days</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white text-sm font-medium">Max Reposts Per Day</p>
                                    <p className="text-xs text-gray-500">Limit automatic reposts</p>
                                </div>
                                <span className="text-orange-400 font-bold">{settings.maxRepostsPerDay}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white text-sm font-medium">Platforms</p>
                                    <p className="text-xs text-gray-500">Enabled for reposting</p>
                                </div>
                                <div className="flex gap-2">
                                    {settings.platforms.map(p => (
                                        <span key={p} className="bg-white/10 px-2 py-1 rounded text-xs text-white">{p}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-white text-sm font-medium">Preferred Times</p>
                                    <p className="text-xs text-gray-500">Optimal posting times</p>
                                </div>
                                <div className="flex gap-2">
                                    {settings.preferredTimes?.map(t => (
                                        <span key={t} className="bg-white/10 px-2 py-1 rounded text-xs text-white">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 border-t border-white/10 pt-4">
                        Settings can be configured via API at /api/automation/auto-repost/settings
                    </p>
                </div>
            )}
        </div>
    );
}
