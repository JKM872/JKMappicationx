import { useState, useEffect } from 'react';
import axios from 'axios';
import { Hash, TrendingUp, Sparkles, Loader2 } from 'lucide-react';

interface TrendingTopic {
    topic: string;
    platform: string;
    score: number;
    category?: string;
}

interface TopicTagsProps {
    onTagClick: (tag: string) => void;
    selectedTag?: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fallback topics in case API fails
const FALLBACK_TOPICS: TrendingTopic[] = [
    { topic: 'AI coding tips', platform: 'All', score: 100, category: 'tech' },
    { topic: 'marketing strategies', platform: 'All', score: 95, category: 'business' },
    { topic: 'startup advice', platform: 'All', score: 90, category: 'business' },
    { topic: 'productivity hacks', platform: 'All', score: 85, category: 'lifestyle' },
    { topic: 'design inspiration', platform: 'All', score: 80, category: 'creative' },
    { topic: 'growth tactics', platform: 'All', score: 75, category: 'marketing' },
    { topic: 'tech trends', platform: 'All', score: 70, category: 'tech' },
    { topic: 'career tips', platform: 'All', score: 65, category: 'professional' },
];

export function TopicTags({ onTagClick, selectedTag }: TopicTagsProps) {
    const [topics, setTopics] = useState<TrendingTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredTag, setHoveredTag] = useState<string | null>(null);

    useEffect(() => {
        fetchTrendingTopics();
    }, []);

    const fetchTrendingTopics = async () => {
        try {
            const res = await axios.get(`${API_BASE}/api/trending`, { timeout: 5000 });
            if (res.data.success && res.data.data?.length > 0) {
                setTopics(res.data.data.slice(0, 12));
            } else {
                setTopics(FALLBACK_TOPICS);
            }
        } catch (err) {
            console.warn('⚠️ Could not fetch trending topics, using fallback');
            setTopics(FALLBACK_TOPICS);
        } finally {
            setLoading(false);
        }
    };

    const isTopTrending = (index: number) => index < 3;

    return (
        <div className="py-3 border-b border-white/5">
            {/* Scrollable container */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                {/* All Topics button */}
                <button
                    onClick={() => onTagClick('')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedTag
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                        }`}
                >
                    <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
                    All
                </button>

                {/* Loading state */}
                {loading && (
                    <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading topics...</span>
                    </div>
                )}

                {/* Topic Tags */}
                {!loading && topics.map((topic, index) => (
                    <button
                        key={topic.topic}
                        onClick={() => onTagClick(topic.topic)}
                        onMouseEnter={() => setHoveredTag(topic.topic)}
                        onMouseLeave={() => setHoveredTag(null)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all relative ${selectedTag === topic.topic
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                            }`}
                    >
                        {isTopTrending(index) ? (
                            <TrendingUp className="w-3 h-3 inline mr-1 text-orange-400" />
                        ) : (
                            <Hash className="w-3 h-3 inline mr-1 opacity-50" />
                        )}
                        {topic.topic}

                        {/* Tooltip on hover */}
                        {hoveredTag === topic.topic && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 rounded text-xs whitespace-nowrap border border-white/10 z-10">
                                <span className="capitalize">{topic.category || topic.platform}</span>
                                {isTopTrending(index) && <span className="text-orange-400 ml-1">🔥</span>}
                                <span className="text-gray-500 ml-2">Score: {topic.score}</span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
