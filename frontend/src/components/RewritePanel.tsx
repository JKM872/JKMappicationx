import { useState } from 'react';
import axios from 'axios';
import { Zap, Brain, Smile, Briefcase, Coffee, Sparkles, Shuffle, AlertCircle, Clipboard, Lightbulb, Globe, CheckCircle, Languages, SpellCheck } from 'lucide-react';
import { useToast } from './ui/Toast';

interface RewriteVariation {
    text: string;
    style: 'bold' | 'smart' | 'funny' | 'professional' | 'casual';
    improvement: string;
}

interface TranslateResult {
    translated: string;
    detectedLanguage: string;
    confidence: number;
}

interface GrammarResult {
    improved: string;
    corrections: string[];
    score: number;
}

interface RewritePanelProps {
    content: string;
    onSelectVariation: (text: string) => void;
    onClose: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function RewritePanel({ content, onSelectVariation, onClose }: RewritePanelProps) {
    const { success: toastSuccess, error: toastError } = useToast();
    const [variations, setVariations] = useState<RewriteVariation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

    // New states for translate and grammar
    const [translateResult, setTranslateResult] = useState<TranslateResult | null>(null);
    const [grammarResult, setGrammarResult] = useState<GrammarResult | null>(null);
    const [activeMode, setActiveMode] = useState<'rewrite' | 'translate' | 'grammar'>('rewrite');
    const [targetLanguage, setTargetLanguage] = useState('English');

    const availableLanguages = [
        'English', 'Spanish', 'French', 'German', 'Polish', 'Portuguese',
        'Italian', 'Dutch', 'Russian', 'Japanese', 'Korean', 'Chinese'
    ];

    const styles = [
        { id: 'bold', label: 'Bold', description: 'Confident & impactful', gradient: 'from-red-500 to-orange-500', icon: Zap },
        { id: 'smart', label: 'Smart', description: 'Thoughtful & insightful', gradient: 'from-blue-500 to-cyan-500', icon: Brain },
        { id: 'funny', label: 'Funny', description: 'Witty & entertaining', gradient: 'from-yellow-500 to-amber-500', icon: Smile },
        { id: 'professional', label: 'Pro', description: 'Polished & credible', gradient: 'from-slate-500 to-gray-600', icon: Briefcase },
        { id: 'casual', label: 'Casual', description: 'Relaxed & friendly', gradient: 'from-green-500 to-emerald-500', icon: Coffee },
    ];

    const handleQuickRewrite = async (style?: string) => {
        setLoading(true);
        setError('');
        setSelectedStyle(style || null);
        setActiveMode('rewrite');
        setTranslateResult(null);
        setGrammarResult(null);

        try {
            const res = await axios.post(`${API_BASE}/api/ai/quick-rewrite`, {
                content,
                style: style || 'all',
                count: style ? 1 : 5,
            });

            if (res.data.success) {
                setVariations(res.data.data.variations);
                toastSuccess(`Wygenerowano ${res.data.data.variations.length} wariantów!`);
            } else {
                setError('Failed to generate rewrites');
                toastError('Nie udało się wygenerować wariantów');
            }
        } catch (err) {
            console.error('Rewrite failed:', err);
            setError('Failed to generate rewrites. Please try again.');
            toastError('Błąd generowania. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    const handleTranslate = async () => {
        setLoading(true);
        setError('');
        setActiveMode('translate');
        setVariations([]);
        setGrammarResult(null);

        try {
            const res = await axios.post(`${API_BASE}/api/ai/translate`, { content, targetLanguage });

            if (res.data.success) {
                setTranslateResult(res.data.data);
                toastSuccess(`Przetłumaczono na ${targetLanguage}!`);
            } else {
                setError('Failed to translate content');
                toastError('Nie udało się przetłumaczyć');
            }
        } catch (err) {
            console.error('Translate failed:', err);
            setError('Failed to translate. Please try again.');
            toastError('Błąd tłumaczenia. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    const handleGrammar = async () => {
        setLoading(true);
        setError('');
        setActiveMode('grammar');
        setVariations([]);
        setTranslateResult(null);

        try {
            const res = await axios.post(`${API_BASE}/api/ai/grammar`, { content });

            if (res.data.success) {
                setGrammarResult(res.data.data);
                toastSuccess('Gramatyka poprawiona!');
            } else {
                setError('Failed to improve grammar');
                toastError('Nie udało się poprawić gramatyki');
            }
        } catch (err) {
            console.error('Grammar check failed:', err);
            setError('Failed to check grammar. Please try again.');
            toastError('Błąd sprawdzania gramatyki. Spróbuj ponownie.');
        } finally {
            setLoading(false);
        }
    };

    const getStyleGradient = (style: string) => {
        const found = styles.find(s => s.id === style);
        return found?.gradient || 'from-purple-500 to-pink-500';
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-premium rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white/10">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" /> Rewrite with AI
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Get instant variations, translations, or grammar fixes</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all"
                    >
                        ×
                    </button>
                </div>

                {/* Original Content */}
                <div className="p-5 border-b border-white/10 bg-white/5">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                        Original Content
                    </label>
                    <p className="text-white text-sm leading-relaxed">{content}</p>
                </div>

                {/* Quick Actions - Translate & Grammar */}
                <div className="p-5 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-green-900/20">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                        Quick Actions
                    </label>
                    <div className="flex gap-2">
                        {/* Translate with language selector */}
                        <div className="flex-1 flex gap-2">
                            <select
                                value={targetLanguage}
                                onChange={(e) => setTargetLanguage(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            >
                                {availableLanguages.map(lang => (
                                    <option key={lang} value={lang} className="bg-gray-900">{lang}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleTranslate}
                                disabled={loading}
                                className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${activeMode === 'translate'
                                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 border-transparent text-white shadow-lg'
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-blue-500/50 hover:bg-blue-900/20'
                                    } disabled:opacity-50`}
                            >
                                <Languages className="w-4 h-4" />
                                Translate
                            </button>
                        </div>
                        <button
                            onClick={handleGrammar}
                            disabled={loading}
                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all border flex items-center justify-center gap-2 ${activeMode === 'grammar'
                                ? 'bg-gradient-to-r from-green-600 to-emerald-500 border-transparent text-white shadow-lg'
                                : 'bg-white/5 border-white/10 text-gray-300 hover:border-green-500/50 hover:bg-green-900/20'
                                } disabled:opacity-50`}
                        >
                            <SpellCheck className="w-4 h-4" />
                            Improve Grammar
                        </button>
                    </div>
                </div>

                {/* Style Buttons */}
                <div className="p-5 border-b border-white/10">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                        Rewrite by Style
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {styles.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => handleQuickRewrite(style.id)}
                                disabled={loading}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${selectedStyle === style.id && activeMode === 'rewrite'
                                    ? `bg-gradient-to-r ${style.gradient} border-transparent text-white shadow-lg`
                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20 hover:bg-white/10'
                                    } disabled:opacity-50`}
                                title={style.description}
                            >
                                <style.icon className="w-4 h-4 inline mr-1" />
                                {style.label}
                            </button>
                        ))}
                        <button
                            onClick={() => handleQuickRewrite()}
                            disabled={loading}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
                        >
                            <Shuffle className="w-4 h-4 inline mr-1" /> All Styles
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                        <p className="mt-4 text-gray-400 animated-gradient-text font-medium">
                            {activeMode === 'translate' ? 'Translating...' :
                                activeMode === 'grammar' ? 'Checking grammar...' :
                                    'Generating rewrites...'}
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="p-5">
                        <div className="text-red-400 text-sm bg-red-900/20 px-4 py-3 rounded-xl border border-red-900/50 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    </div>
                )}

                {/* Translate Result */}
                {translateResult && !loading && activeMode === 'translate' && (
                    <div className="p-5 overflow-y-auto max-h-[40vh]">
                        <div className="glass-card p-4 rounded-xl border border-blue-500/30">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-semibold text-blue-400">
                                        Detected: {translateResult.detectedLanguage}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        ({Math.round(translateResult.confidence * 100)}% confidence)
                                    </span>
                                </div>
                                <button
                                    onClick={() => onSelectVariation(translateResult.translated)}
                                    className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" /> Use This
                                </button>
                            </div>
                            <p className="text-white text-sm leading-relaxed">{translateResult.translated}</p>
                        </div>
                    </div>
                )}

                {/* Grammar Result */}
                {grammarResult && !loading && activeMode === 'grammar' && (
                    <div className="p-5 overflow-y-auto max-h-[40vh]">
                        <div className="glass-card p-4 rounded-xl border border-green-500/30">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <SpellCheck className="w-5 h-5 text-green-400" />
                                    <span className="text-sm font-semibold text-green-400">
                                        Grammar Score: {grammarResult.score}/100
                                    </span>
                                </div>
                                <button
                                    onClick={() => onSelectVariation(grammarResult.improved)}
                                    className="text-xs bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" /> Use This
                                </button>
                            </div>
                            <p className="text-white text-sm leading-relaxed mb-3">{grammarResult.improved}</p>
                            {grammarResult.corrections.length > 0 && (
                                <div className="border-t border-white/10 pt-3 mt-3">
                                    <p className="text-xs text-gray-400 mb-2">Corrections made:</p>
                                    <ul className="text-xs text-gray-500 space-y-1">
                                        {grammarResult.corrections.map((c, i) => (
                                            <li key={i} className="flex items-start gap-1">
                                                <span className="text-green-500">✓</span> {c}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Variations List */}
                {variations.length > 0 && !loading && activeMode === 'rewrite' && (
                    <div className="p-5 overflow-y-auto max-h-[40vh] space-y-3">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                            Pick Your Favorite
                        </label>
                        {variations.map((variation, idx) => (
                            <div
                                key={idx}
                                className="glass-card p-4 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-transparent hover:border-purple-500/30 group"
                                onClick={() => onSelectVariation(variation.text)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${getStyleGradient(variation.style)} text-white`}>
                                        {styles.find(s => s.id === variation.style)?.label || variation.style}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(variation.text);
                                        }}
                                        className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Clipboard className="w-3.5 h-3.5 inline mr-1" /> Copy
                                    </button>
                                </div>
                                <p className="text-white text-sm leading-relaxed mb-2">{variation.text}</p>
                                <p className="text-xs text-gray-500 italic flex items-center gap-1">
                                    <Lightbulb className="w-3.5 h-3.5" /> {variation.improvement}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="p-5 border-t border-white/10 bg-white/5">
                    <p className="text-xs text-gray-500 text-center">
                        Click a variation to use it, or copy to clipboard
                    </p>
                </div>
            </div>
        </div>
    );
}

