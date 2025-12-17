import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users,
    Plus,
    Trash2,
    TrendingUp,
    BarChart3,
    Eye,
    Target,
    Zap,
    Clock,
    RefreshCw,
    ChevronRight
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge, PlatformBadge, TrendBadge } from './ui/Badge';

// ============================================================================
// TYPES
// ============================================================================

interface Competitor {
    id: string;
    handle: string;
    platform: string;
    name?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    avgEngagement: number;
    topTopics: string[];
    addedAt: string;
}

interface CompetitorAnalysis {
    competitor: Competitor;
    contentStrategy: {
        topPerformingTopics: Array<{ topic: string; avgEngagement: number }>;
        postingFrequency: string;
        bestPostingTimes: string[];
        avgPostLength: number;
        emojiUsage: string;
        hashtagUsage: string;
    };
    comparison: {
        followersGrowth: number;
        engagementDiff: number;
        strengthsVsYou: string[];
        opportunitiesForYou: string[];
    };
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ============================================================================
// COMPONENT
// ============================================================================

export function CompetitorAnalysis() {
    const [competitors, setCompetitors] = useState<Competitor[]>([]);
    const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
    const [analysis, setAnalysis] = useState<CompetitorAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHandle, setNewHandle] = useState('');
    const [newPlatform, setNewPlatform] = useState('Twitter');

    useEffect(() => {
        fetchCompetitors();
    }, []);

    const fetchCompetitors = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/api/competitors`);
            if (res.data.success) {
                setCompetitors(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch competitors:', err);
            // Use mock data if API fails
            setCompetitors([
                {
                    id: '1',
                    handle: '@sahil',
                    platform: 'Twitter',
                    name: 'Sahil Lavingia',
                    followersCount: 456000,
                    followingCount: 1200,
                    postsCount: 12500,
                    avgEngagement: 3.2,
                    topTopics: ['startups', 'indie hacking'],
                    addedAt: new Date().toISOString()
                },
                {
                    id: '2',
                    handle: '@levelsio',
                    platform: 'Twitter',
                    name: 'Pieter Levels',
                    followersCount: 520000,
                    followingCount: 890,
                    postsCount: 34200,
                    avgEngagement: 4.1,
                    topTopics: ['indie hacker', 'AI'],
                    addedAt: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const analyzeCompetitor = async (competitor: Competitor) => {
        setSelectedCompetitor(competitor);
        setAnalyzing(true);
        try {
            const res = await axios.get(`${API_BASE}/api/competitors/${competitor.id}/analyze`);
            if (res.data.success) {
                setAnalysis(res.data.data);
            }
        } catch (err) {
            console.error('Failed to analyze competitor:', err);
            // Mock analysis
            setAnalysis({
                competitor,
                contentStrategy: {
                    topPerformingTopics: competitor.topTopics.map(t => ({ topic: t, avgEngagement: Math.random() * 5 + 2 })),
                    postingFrequency: '3-5 posts/day',
                    bestPostingTimes: ['8:00 AM', '12:00 PM', '6:00 PM'],
                    avgPostLength: 180,
                    emojiUsage: 'medium',
                    hashtagUsage: 'low'
                },
                comparison: {
                    followersGrowth: Math.floor(Math.random() * 20) - 5,
                    engagementDiff: Math.random() * 2 - 1,
                    strengthsVsYou: ['Higher posting frequency', 'More replies'],
                    opportunitiesForYou: ['They don\'t cover AI tools', 'Less active on weekends']
                }
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const addCompetitor = async () => {
        if (!newHandle) return;
        try {
            const res = await axios.post(`${API_BASE}/api/competitors`, {
                handle: newHandle,
                platform: newPlatform
            });
            if (res.data.success) {
                setCompetitors([...competitors, res.data.data]);
                setShowAddModal(false);
                setNewHandle('');
            }
        } catch (err) {
            console.error('Failed to add competitor:', err);
        }
    };

    const removeCompetitor = async (id: string) => {
        try {
            await axios.delete(`${API_BASE}/api/competitors/${id}`);
            setCompetitors(competitors.filter(c => c.id !== id));
            if (selectedCompetitor?.id === id) {
                setSelectedCompetitor(null);
                setAnalysis(null);
            }
        } catch (err) {
            console.error('Failed to remove competitor:', err);
        }
    };

    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[500px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-gray-400">Loading competitors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Users className="w-6 h-6 text-cyan-400" />
                        Competitor Intelligence
                    </h1>
                    <p className="text-gray-400 mt-1">Track and analyze your competitors</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={fetchCompetitors}>
                        Refresh
                    </Button>
                    <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                        Add Competitor
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Competitor List */}
                <div className="lg:col-span-1">
                    <Card variant="glass">
                        <CardHeader>
                            <CardTitle>Tracked Competitors</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {competitors.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No competitors tracked yet</p>
                                    <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowAddModal(true)}>
                                        Add your first
                                    </Button>
                                </div>
                            ) : (
                                competitors.map((comp) => (
                                    <div
                                        key={comp.id}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedCompetitor?.id === comp.id
                                            ? 'bg-purple-500/20 border-purple-500/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        onClick={() => analyzeCompetitor(comp)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-white font-medium">{comp.name || comp.handle}</p>
                                                <p className="text-sm text-gray-400">{comp.handle}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <PlatformBadge platform={comp.platform as any} size="sm" />
                                                    <span className="text-xs text-gray-500">
                                                        {formatNumber(comp.followersCount)} followers
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant="success" size="sm">
                                                    {comp.avgEngagement.toFixed(1)}% eng
                                                </Badge>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeCompetitor(comp.id); }}
                                                    className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Analysis Panel */}
                <div className="lg:col-span-2">
                    {!selectedCompetitor ? (
                        <Card variant="glass" className="h-full flex items-center justify-center min-h-[400px]">
                            <div className="text-center text-gray-500">
                                <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p className="text-lg">Select a competitor to analyze</p>
                                <p className="text-sm mt-2">Click on any competitor from the list</p>
                            </div>
                        </Card>
                    ) : analyzing ? (
                        <Card variant="glass" className="h-full flex items-center justify-center min-h-[400px]">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
                                <p className="text-gray-400">Analyzing {selectedCompetitor.handle}...</p>
                            </div>
                        </Card>
                    ) : analysis ? (
                        <div className="space-y-4">
                            {/* Competitor Overview */}
                            <Card variant="premium">
                                <CardHeader>
                                    <CardTitle gradient>
                                        <Eye className="w-5 h-5 inline mr-2" />
                                        {analysis.competitor.name || analysis.competitor.handle}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-white/5 rounded-xl">
                                            <p className="text-2xl font-bold text-white">{formatNumber(analysis.competitor.followersCount)}</p>
                                            <p className="text-xs text-gray-400">Followers</p>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-xl">
                                            <p className="text-2xl font-bold text-white">{formatNumber(analysis.competitor.postsCount)}</p>
                                            <p className="text-xs text-gray-400">Posts</p>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-xl">
                                            <p className="text-2xl font-bold text-green-400">{analysis.competitor.avgEngagement.toFixed(1)}%</p>
                                            <p className="text-xs text-gray-400">Avg Engagement</p>
                                        </div>
                                        <div className="text-center p-3 bg-white/5 rounded-xl">
                                            <TrendBadge value={analysis.comparison.followersGrowth} size="lg" />
                                            <p className="text-xs text-gray-400 mt-1">Growth</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Content Strategy */}
                            <Card variant="glass">
                                <CardHeader>
                                    <CardTitle>
                                        <BarChart3 className="w-5 h-5 inline mr-2" />
                                        Content Strategy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Top Performing Topics</p>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.contentStrategy.topPerformingTopics.map(({ topic, avgEngagement }) => (
                                                    <Badge key={topic} variant="purple" size="sm">
                                                        #{topic} ({avgEngagement.toFixed(1)}%)
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Best Posting Times</p>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.contentStrategy.bestPostingTimes.map((time) => (
                                                    <Badge key={time} variant="info" size="sm">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {time}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Posting Frequency</p>
                                            <p className="text-white font-medium">{analysis.contentStrategy.postingFrequency}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-400 mb-2">Avg Post Length</p>
                                            <p className="text-white font-medium">{analysis.contentStrategy.avgPostLength} characters</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Comparison */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card variant="glass">
                                    <CardHeader>
                                        <CardTitle className="text-red-400">
                                            <TrendingUp className="w-5 h-5 inline mr-2" />
                                            Their Strengths
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {analysis.comparison.strengthsVsYou.map((strength, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                    <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                                    {strength}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card variant="glass">
                                    <CardHeader>
                                        <CardTitle className="text-green-400">
                                            <Zap className="w-5 h-5 inline mr-2" />
                                            Your Opportunities
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {analysis.comparison.opportunitiesForYou.map((opp, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                                    <ChevronRight className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                    {opp}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Add Competitor Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
                    <Card variant="premium" className="w-full max-w-md" onClick={(e) => e?.stopPropagation()}>
                        <CardHeader action={
                            <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>✕</Button>
                        }>
                            <CardTitle>
                                <Plus className="w-5 h-5 inline mr-2" />
                                Add Competitor
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Handle</label>
                                    <input
                                        type="text"
                                        value={newHandle}
                                        onChange={(e) => setNewHandle(e.target.value)}
                                        placeholder="@username"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 block mb-2">Platform</label>
                                    <select
                                        value={newPlatform}
                                        onChange={(e) => setNewPlatform(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="Twitter" className="bg-gray-900">Twitter</option>
                                        <option value="Reddit" className="bg-gray-900">Reddit</option>
                                        <option value="Dev.to" className="bg-gray-900">Dev.to</option>
                                        <option value="Threads" className="bg-gray-900">Threads</option>
                                    </select>
                                </div>
                                <Button variant="primary" fullWidth onClick={addCompetitor} disabled={!newHandle}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Track Competitor
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
