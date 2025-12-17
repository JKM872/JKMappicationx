import { useState } from 'react';
import axios from 'axios';
import { Target, BarChart3, Scale, AlertCircle, Heart, MessageCircle, Repeat, Rocket, Flame, TrendingUp, TrendingDown, Lightbulb, CheckCircle, XCircle, Minus, Trophy, Handshake } from 'lucide-react';

interface AlgorithmFactor {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    score: number;
    explanation: string;
}

interface EngagementPrediction {
    overallScore: number;
    likesPrediction: { min: number; max: number; confidence: number };
    commentsPrediction: { min: number; max: number; confidence: number };
    repostsPrediction: { min: number; max: number; confidence: number };
    viralPotential: 'low' | 'medium' | 'high' | 'viral';
    algorithmFactors: AlgorithmFactor[];
    suggestions: string[];
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AlgorithmSimulator() {
    const [content, setContent] = useState('');
    const [contentB, setContentB] = useState('');
    const [mode, setMode] = useState<'analyze' | 'compare'>('analyze');
    const [prediction, setPrediction] = useState<EngagementPrediction | null>(null);
    const [comparison, setComparison] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!content.trim()) {
            setError('Please enter content to analyze');
            return;
        }

        setLoading(true);
        setError('');
        setPrediction(null);

        try {
            const res = await axios.post(`${API_BASE}/api/simulator/analyze`, { content });
            if (res.data.success) {
                setPrediction(res.data.data);
            } else {
                setError('Failed to analyze content');
            }
        } catch (err) {
            console.error('Analysis failed:', err);
            setError('Failed to analyze content. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = async () => {
        if (!content.trim() || !contentB.trim()) {
            setError('Please enter both variants to compare');
            return;
        }

        setLoading(true);
        setError('');
        setComparison(null);

        try {
            const res = await axios.post(`${API_BASE}/api/simulator/compare`, {
                variantA: content,
                variantB: contentB,
            });
            if (res.data.success) {
                setComparison(res.data.data);
            } else {
                setError('Failed to compare variants');
            }
        } catch (err) {
            console.error('Comparison failed:', err);
            setError('Failed to compare variants. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 75) return 'text-green-400';
        if (score >= 50) return 'text-yellow-400';
        if (score >= 25) return 'text-orange-400';
        return 'text-red-400';
    };

    const getViralBadge = (potential: string) => {
        const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
            viral: { bg: 'bg-purple-500/20 border-purple-500/50', text: 'text-purple-400', icon: <Rocket className="w-4 h-4 inline" /> },
            high: { bg: 'bg-green-500/20 border-green-500/50', text: 'text-green-400', icon: <Flame className="w-4 h-4 inline" /> },
            medium: { bg: 'bg-yellow-500/20 border-yellow-500/50', text: 'text-yellow-400', icon: <TrendingUp className="w-4 h-4 inline" /> },
            low: { bg: 'bg-gray-500/20 border-gray-500/50', text: 'text-gray-400', icon: <TrendingDown className="w-4 h-4 inline" /> },
        };
        return badges[potential] || badges.low;
    };

    const getImpactColor = (impact: string) => {
        if (impact === 'positive') return 'text-green-400';
        if (impact === 'negative') return 'text-red-400';
        return 'text-gray-400';
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-400" /> Algorithm Simulator
                </h2>
                <p className="text-gray-400 mt-1">Test your tweets before publishing. Predict engagement and optimize for the algorithm.</p>
            </div>

            {/* Mode Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => { setMode('analyze'); setComparison(null); }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${mode === 'analyze'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <BarChart3 className="w-4 h-4 inline mr-1" /> Analyze
                </button>
                <button
                    onClick={() => { setMode('compare'); setPrediction(null); }}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${mode === 'compare'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                >
                    <Scale className="w-4 h-4 inline mr-1" /> A/B Compare
                </button>
            </div>

            {/* Input Area */}
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">
                        {mode === 'compare' ? 'Variant A' : 'Your Tweet'}
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's happening?!"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                        rows={3}
                        maxLength={280}
                        disabled={loading}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{content.length} / 280</span>
                        {content.length > 200 && <span className="text-yellow-400">Consider a shorter tweet for better engagement</span>}
                    </div>
                </div>

                {mode === 'compare' && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Variant B</label>
                        <textarea
                            value={contentB}
                            onChange={(e) => setContentB(e.target.value)}
                            placeholder="Alternative version..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all"
                            rows={3}
                            maxLength={280}
                            disabled={loading}
                        />
                        <div className="text-xs text-gray-500 mt-1">{contentB.length} / 280</div>
                    </div>
                )}

                <button
                    onClick={mode === 'analyze' ? handleAnalyze : handleCompare}
                    disabled={loading || !content.trim() || (mode === 'compare' && !contentB.trim())}
                    className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Simulating...
                        </span>
                    ) : mode === 'analyze' ? (
                        <><Target className="w-5 h-5 inline mr-2" />Run Simulation</>
                    ) : (
                        <><Scale className="w-5 h-5 inline mr-2" />Compare Variants</>
                    )}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-xl border border-red-900/50 mb-6 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {/* Analyze Results */}
            {prediction && mode === 'analyze' && (
                <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="glass-premium p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg">Engagement Score</h3>
                            <span className={`text-4xl font-bold ${getScoreColor(prediction.overallScore)}`}>
                                {prediction.overallScore}
                            </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${prediction.overallScore >= 75 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                    prediction.overallScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                                        'bg-gradient-to-r from-red-500 to-orange-400'
                                    }`}
                                style={{ width: `${prediction.overallScore}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-2">
                            {(() => {
                                const badge = getViralBadge(prediction.viralPotential);
                                return (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badge.bg} ${badge.text}`}>
                                        {badge.icon} {prediction.viralPotential.toUpperCase()} Viral Potential
                                    </span>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Predictions Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="glass-card p-4 rounded-xl text-center">
                            <Heart className="w-6 h-6 text-pink-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-white">
                                {prediction.likesPrediction.min} - {prediction.likesPrediction.max}
                            </div>
                            <div className="text-xs text-gray-500">Expected Likes</div>
                            <div className="text-xs text-gray-400 mt-1">{prediction.likesPrediction.confidence}% confidence</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center">
                            <MessageCircle className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-white">
                                {prediction.commentsPrediction.min} - {prediction.commentsPrediction.max}
                            </div>
                            <div className="text-xs text-gray-500">Expected Comments</div>
                            <div className="text-xs text-gray-400 mt-1">{prediction.commentsPrediction.confidence}% confidence</div>
                        </div>
                        <div className="glass-card p-4 rounded-xl text-center">
                            <Repeat className="w-6 h-6 text-green-400 mx-auto mb-1" />
                            <div className="text-xl font-bold text-white">
                                {prediction.repostsPrediction.min} - {prediction.repostsPrediction.max}
                            </div>
                            <div className="text-xs text-gray-500">Expected Reposts</div>
                            <div className="text-xs text-gray-400 mt-1">{prediction.repostsPrediction.confidence}% confidence</div>
                        </div>
                    </div>

                    {/* Algorithm Factors */}
                    <div className="glass-card p-5 rounded-xl">
                        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-purple-400" /> Algorithm Factors
                        </h4>
                        <div className="space-y-3">
                            {prediction.algorithmFactors.map((factor, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium ${getImpactColor(factor.impact)}`}>
                                                {factor.impact === 'positive' ? <CheckCircle className="w-4 h-4" /> : factor.impact === 'negative' ? <XCircle className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                            </span>
                                            <span className="text-white font-medium">{factor.factor}</span>
                                            <span className={`text-sm px-2 py-0.5 rounded-full ${factor.score > 0 ? 'bg-green-500/20 text-green-400' :
                                                factor.score < 0 ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {factor.score > 0 ? '+' : ''}{factor.score}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{factor.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Suggestions */}
                    {prediction.suggestions && prediction.suggestions.length > 0 && (
                        <div className="glass-card p-5 rounded-xl">
                            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-400" /> Suggestions to Improve
                            </h4>
                            <ul className="space-y-2">
                                {prediction.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-purple-400">→</span>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Compare Results */}
            {comparison && mode === 'compare' && (
                <div className="space-y-6">
                    {/* Winner Banner */}
                    <div className={`glass-premium p-6 rounded-2xl text-center ${comparison.winner === 'A' ? 'border-2 border-purple-500/50' :
                        comparison.winner === 'B' ? 'border-2 border-blue-500/50' :
                            'border-2 border-yellow-500/50'
                        }`}>
                        {comparison.winner === 'tie' ? <Handshake className="w-10 h-10 text-yellow-400" /> : <Trophy className="w-10 h-10 text-yellow-400" />}
                        <h3 className="text-2xl font-bold">
                            {comparison.winner === 'tie' ? "It's a Tie!" : `Variant ${comparison.winner} Wins!`}
                        </h3>
                    </div>

                    {/* Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`glass-card p-5 rounded-xl ${comparison.winner === 'A' ? 'ring-2 ring-purple-500' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-purple-400">Variant A</span>
                                <span className={`text-2xl font-bold ${getScoreColor(comparison.variantA.overallScore)}`}>
                                    {comparison.variantA.overallScore}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-3">{content.substring(0, 100)}...</p>
                            {(() => {
                                const badge = getViralBadge(comparison.variantA.viralPotential);
                                return (
                                    <span className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}>
                                        {badge.icon} {comparison.variantA.viralPotential}
                                    </span>
                                );
                            })()}
                        </div>
                        <div className={`glass-card p-5 rounded-xl ${comparison.winner === 'B' ? 'ring-2 ring-blue-500' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-blue-400">Variant B</span>
                                <span className={`text-2xl font-bold ${getScoreColor(comparison.variantB.overallScore)}`}>
                                    {comparison.variantB.overallScore}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300 mb-3">{contentB.substring(0, 100)}...</p>
                            {(() => {
                                const badge = getViralBadge(comparison.variantB.viralPotential);
                                return (
                                    <span className={`px-2 py-1 rounded-full text-xs ${badge.bg} ${badge.text}`}>
                                        {badge.icon} {comparison.variantB.viralPotential}
                                    </span>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
