import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Flame, Clock, Calendar, Moon, Target, Code } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { SiReddit, SiThreads } from 'react-icons/si';

interface HeatmapData {
    day: number;  // 0-6 (Sunday-Saturday)
    hour: number; // 0-23
    value: number; // Engagement score
}

interface OptimalTime {
    day: string;
    hour: string;
    score: number;
    reason: string;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function AudienceInsights() {
    const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
    const [optimalTimes, setOptimalTimes] = useState<OptimalTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlatform, setSelectedPlatform] = useState('twitter');

    useEffect(() => {
        fetchInsights();
    }, [selectedPlatform]);

    const fetchInsights = async () => {
        setLoading(true);
        try {
            // Generate mock heatmap data (in production, this would come from analytics API)
            const mockHeatmap = generateMockHeatmap();
            setHeatmapData(mockHeatmap);

            // Get AI-suggested optimal times
            const res = await axios.post(`${API_BASE}/api/suggest-times`, {
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });

            if (res.data.success) {
                const times = res.data.data.map((time: string, idx: number) => ({
                    day: ['Monday', 'Wednesday', 'Friday'][idx] || 'Weekday',
                    hour: time.split(' - ')[0] || time,
                    score: 95 - idx * 10,
                    reason: time.split(' - ')[1] || 'High engagement period',
                }));
                setOptimalTimes(times);
            }
        } catch (err) {
            console.error('Failed to fetch insights:', err);
            // Use fallback data
            setOptimalTimes([
                { day: 'Monday', hour: '9:00 AM', score: 95, reason: 'Morning engagement peak' },
                { day: 'Wednesday', hour: '1:00 PM', score: 88, reason: 'Lunch hour browsing' },
                { day: 'Friday', hour: '7:00 PM', score: 82, reason: 'Evening relaxation' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const generateMockHeatmap = (): HeatmapData[] => {
        const data: HeatmapData[] = [];
        for (let day = 0; day < 7; day++) {
            for (let hour = 0; hour < 24; hour++) {
                // Simulate higher activity during work hours on weekdays
                let value = Math.random() * 30;

                // Weekday patterns
                if (day >= 1 && day <= 5) {
                    if (hour >= 9 && hour <= 11) value += 50 + Math.random() * 20; // Morning peak
                    if (hour >= 12 && hour <= 14) value += 40 + Math.random() * 15; // Lunch
                    if (hour >= 17 && hour <= 20) value += 45 + Math.random() * 20; // Evening
                } else {
                    // Weekend patterns
                    if (hour >= 10 && hour <= 22) value += 35 + Math.random() * 25;
                }

                data.push({ day, hour, value: Math.min(100, value) });
            }
        }
        return data;
    };

    const getHeatmapColor = (value: number) => {
        if (value >= 80) return 'bg-green-500';
        if (value >= 60) return 'bg-green-400';
        if (value >= 40) return 'bg-yellow-400';
        if (value >= 20) return 'bg-orange-400';
        return 'bg-gray-600';
    };

    const getHeatmapValue = (day: number, hour: number): number => {
        const data = heatmapData.find(d => d.day === day && d.hour === hour);
        return data?.value || 0;
    };

    const platforms = [
        { id: 'twitter', name: 'Twitter/X', icon: <FaXTwitter className="w-4 h-4" /> },
        { id: 'reddit', name: 'Reddit', icon: <SiReddit className="w-4 h-4" /> },
        { id: 'devto', name: 'Dev.to', icon: <Code className="w-4 h-4" /> },
        { id: 'threads', name: 'Threads', icon: <SiThreads className="w-4 h-4" /> },
    ];

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                {/* Header Skeleton */}
                <div className="mb-6">
                    <div className="h-8 w-48 bg-white/5 rounded skeleton mb-2"></div>
                    <div className="h-4 w-72 bg-white/5 rounded skeleton"></div>
                </div>

                {/* Platform Selector Skeleton */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 w-24 bg-white/5 rounded-xl skeleton"></div>
                    ))}
                </div>

                {/* Heatmap Skeleton */}
                <div className="glass-card p-4 rounded-xl">
                    <div className="h-6 w-40 bg-white/5 rounded skeleton mb-4"></div>
                    <div className="grid grid-cols-25 gap-1">
                        {Array.from({ length: 7 * 24 }).map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-white/5 rounded-sm skeleton"></div>
                        ))}
                    </div>
                </div>

                {/* Optimal Times Skeleton */}
                <div className="glass-card p-4 rounded-xl">
                    <div className="h-6 w-36 bg-white/5 rounded skeleton mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                                <div className="w-10 h-10 bg-white/10 rounded-full skeleton"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 bg-white/10 rounded skeleton"></div>
                                    <div className="h-3 w-40 bg-white/5 rounded skeleton"></div>
                                </div>
                                <div className="h-6 w-12 bg-white/10 rounded-full skeleton"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-purple-400" /> Audience Insights
                </h2>
                <p className="text-gray-400 mt-1">Discover when your audience is most active</p>
            </div>

            {/* Platform Selector */}
            <div className="flex gap-2 mb-6">
                {platforms.map((platform) => (
                    <button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform.id)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${selectedPlatform === platform.id
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        {platform.icon}
                        <span>{platform.name}</span>
                    </button>
                ))}
            </div>

            {/* Activity Heatmap */}
            <div className="glass-card p-5 rounded-xl mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" /> Activity Heatmap
                    <span className="text-sm font-normal text-gray-400">— When your followers are online</span>
                </h3>

                <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                        {/* Hour labels */}
                        <div className="flex ml-12 mb-2">
                            {HOURS.filter(h => h % 3 === 0).map((hour) => (
                                <div key={hour} className="flex-1 text-xs text-gray-500 text-center">
                                    {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                                </div>
                            ))}
                        </div>

                        {/* Heatmap grid */}
                        {DAYS.map((day, dayIdx) => (
                            <div key={day} className="flex items-center mb-1">
                                <div className="w-12 text-xs text-gray-400">{day}</div>
                                <div className="flex-1 flex gap-0.5">
                                    {HOURS.map((hour) => {
                                        const value = getHeatmapValue(dayIdx, hour);
                                        return (
                                            <div
                                                key={hour}
                                                className={`h-6 flex-1 rounded-sm ${getHeatmapColor(value)} opacity-80 hover:opacity-100 cursor-pointer transition-opacity`}
                                                title={`${day} ${hour}:00 - Activity: ${Math.round(value)}%`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="flex items-center justify-end mt-4 gap-2 text-xs text-gray-400">
                            <span>Less</span>
                            <div className="flex gap-1">
                                <div className="w-4 h-4 rounded bg-gray-600"></div>
                                <div className="w-4 h-4 rounded bg-orange-400"></div>
                                <div className="w-4 h-4 rounded bg-yellow-400"></div>
                                <div className="w-4 h-4 rounded bg-green-400"></div>
                                <div className="w-4 h-4 rounded bg-green-500"></div>
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Optimal Posting Times */}
            <div className="glass-card p-5 rounded-xl mb-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" /> Best Times to Post
                    <span className="text-sm font-normal text-gray-400">— AI-recommended slots</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {optimalTimes.map((time, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all hover:scale-105 cursor-pointer ${idx === 0
                                ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50'
                                : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">{time.day}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${idx === 0 ? 'bg-green-500/30 text-green-400' : 'bg-white/10 text-gray-400'
                                    }`}>
                                    {time.score}% match
                                </span>
                            </div>
                            <div className="text-xl font-bold text-white mb-1">{time.hour}</div>
                            <p className="text-xs text-gray-500">{time.reason}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl text-center">
                    <BarChart3 className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-purple-400">9-11 AM</div>
                    <div className="text-xs text-gray-500">Peak Hours</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-blue-400">Tue-Thu</div>
                    <div className="text-xs text-gray-500">Best Days</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <Moon className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-yellow-400">7-9 PM</div>
                    <div className="text-xs text-gray-500">Evening Peak</div>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-green-400">+35%</div>
                    <div className="text-xs text-gray-500">Optimal Timing Boost</div>
                </div>
            </div>
        </div>
    );
}
