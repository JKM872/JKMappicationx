import { useState } from 'react';
import { Sparkles, Zap, TrendingUp, AlertCircle, ArrowUp, ArrowDown, Minus, Loader2 } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { SiReddit, SiThreads } from 'react-icons/si';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ViralityFactor {
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;
    reason: string;
}

interface ViralityPrediction {
    post_id: string;
    platform: string;
    content: string;
    author?: string;
    viral_score: number;
    confidence: number;
    predicted_reach: string;
    factors: ViralityFactor[];
}

export function ViralityPredictor() {
    const [content, setContent] = useState('');
    const [platform, setPlatform] = useState('Twitter');
    const [prediction, setPrediction] = useState<ViralityPrediction | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [topCandidates, setTopCandidates] = useState<ViralityPrediction[]>([]);
    const [showingTop, setShowingTop] = useState(false);

    const analyzePrediction = async () => {
        if (!content.trim()) {
            setError('Please enter some content to analyze');
            return;
        }

        setLoading(true);
        setError('');
        setPrediction(null);

        try {
            const response = await fetch(`${API_BASE}/api/analytics/virality/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, platform }),
            });

            const data = await response.json();

            if (data.success) {
                setPrediction(data.data);
            } else {
                setError(data.error || 'Failed to analyze post');
            }
        } catch (err) {
            console.error('Prediction error:', err);
            setError('Failed to connect to the API');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopCandidates = async () => {
        setShowingTop(true);
        try {
            const response = await fetch(`${API_BASE}/api/analytics/virality/top?limit=5`);
            const data = await response.json();

            if (data.success) {
                setTopCandidates(data.data);
            }
        } catch (err) {
            console.error('Error fetching top candidates:', err);
        }
    };

    const getScoreColor = (score: number): string => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreGradient = (score: number): string => {
        if (score >= 80) return 'from-green-600 to-emerald-500';
        if (score >= 60) return 'from-yellow-600 to-amber-500';
        if (score >= 40) return 'from-orange-600 to-amber-600';
        return 'from-red-600 to-orange-600';
    };

    const getImpactIcon = (impact: string) => {
        switch (impact) {
            case 'positive':
                return <ArrowUp className="w-4 h-4 text-green-400" />;
            case 'negative':
                return <ArrowDown className="w-4 h-4 text-red-400" />;
            default:
                return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const getImpactColor = (impact: string): string => {
        switch (impact) {
            case 'positive':
                return 'border-green-700/50 bg-green-900/20';
            case 'negative':
                return 'border-red-700/50 bg-red-900/20';
            default:
                return 'border-gray-700/50 bg-gray-800/20';
        }
    };

    const getPlatformIcon = (platformName: string) => {
        switch (platformName.toLowerCase()) {
            case 'twitter':
                return <FaXTwitter className="w-5 h-5" />;
            case 'reddit':
                return <SiReddit className="w-5 h-5" />;
            case 'threads':
                return <SiThreads className="w-5 h-5" />;
            default:
                return <Sparkles className="w-5 h-5" />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-yellow-400" />
                        Virality Predictor
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        AI-powered analysis of your post's viral potential
                    </p>
                </div>
                <button
                    onClick={fetchTopCandidates}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                    <TrendingUp className="w-4 h-4" />
                    View Top Viral Posts
                </button>
            </div>

            {/* Input Section */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Post Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste your post content here to analyze its viral potential..."
                            className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {content.length} characters
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Platform
                        </label>
                        <div className="space-y-2">
                            {['Twitter', 'Reddit', 'Threads', 'Dev.to'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPlatform(p)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${platform === p
                                        ? 'bg-yellow-900/30 border-yellow-600 text-yellow-400'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                        }`}
                                >
                                    {getPlatformIcon(p)}
                                    <span>{p === 'Twitter' ? 'Twitter/X' : p}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={analyzePrediction}
                    disabled={loading || !content.trim()}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-amber-500 rounded-lg font-semibold text-white hover:from-yellow-500 hover:to-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Analyze Viral Potential
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-700/50 rounded-lg px-4 py-3">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}
            </div>

            {/* Prediction Results */}
            {prediction && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Score Card */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Viral Score
                        </h3>

                        {/* Gauge */}
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="#374151"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="url(#scoreGradient)"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(prediction.viral_score / 100) * 440} 440`}
                                    />
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#22c55e" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-bold ${getScoreColor(prediction.viral_score)}`}>
                                        {prediction.viral_score}
                                    </span>
                                    <span className="text-sm text-gray-400">/100</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Confidence</span>
                                <span className="font-semibold">{(prediction.confidence * 100).toFixed(0)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Predicted Reach</span>
                                <span className={`font-semibold px-2 py-1 rounded-full text-xs bg-gradient-to-r ${getScoreGradient(prediction.viral_score)} text-white`}>
                                    {prediction.predicted_reach}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Platform</span>
                                <span className="font-semibold flex items-center gap-1">
                                    {getPlatformIcon(prediction.platform)}
                                    {prediction.platform}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Factors */}
                    <div className="lg:col-span-2 bg-gray-900 rounded-xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Analysis Factors
                        </h3>
                        <div className="space-y-3">
                            {prediction.factors.map((factor, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border ${getImpactColor(factor.impact)}`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getImpactIcon(factor.impact)}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium">{factor.name}</span>
                                                <span className={`text-sm font-semibold ${factor.score > 0 ? 'text-green-400' : factor.score < 0 ? 'text-red-400' : 'text-gray-400'
                                                    }`}>
                                                    {factor.score > 0 ? '+' : ''}{factor.score}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400">{factor.reason}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Top Viral Candidates */}
            {showingTop && topCandidates.length > 0 && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            Top Viral Candidates
                        </h3>
                        <button
                            onClick={() => setShowingTop(false)}
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            Hide
                        </button>
                    </div>
                    <div className="space-y-3">
                        {topCandidates.map((candidate, idx) => (
                            <div
                                key={candidate.post_id}
                                className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                <span className="text-2xl font-bold text-gray-600 w-8">#{idx + 1}</span>
                                <span className="text-xl">{getPlatformIcon(candidate.platform)}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white truncate">{candidate.content}</p>
                                    <p className="text-xs text-gray-500">{candidate.platform} • Reach: {candidate.predicted_reach}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-bold ${getScoreColor(candidate.viral_score)}`}>
                                        {candidate.viral_score}
                                    </p>
                                    <p className="text-xs text-gray-500">score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
