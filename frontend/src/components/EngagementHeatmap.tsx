import { useState, useEffect } from 'react';
import {
    Calendar,
    Flame,
    Info,
    RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

// ============================================================================
// TYPES
// ============================================================================

interface HeatmapCell {
    day: number;
    hour: number;
    value: number;
    posts: number;
}

interface BestTime {
    day: string;
    hour: string;
    score: number;
}

// ============================================================================
// DATA
// ============================================================================

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = ['6AM', '8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'];
const HOUR_VALUES = [6, 8, 10, 12, 14, 16, 18, 20, 22];

// Generate mock heatmap data
function generateHeatmapData(): HeatmapCell[] {
    const data: HeatmapCell[] = [];

    for (let day = 0; day < 7; day++) {
        for (let hourIdx = 0; hourIdx < HOUR_VALUES.length; hourIdx++) {
            const hour = HOUR_VALUES[hourIdx];

            // Create realistic engagement patterns
            let baseValue = 30;

            // Higher engagement during work hours on weekdays
            if (day < 5) { // Weekday
                if (hour >= 8 && hour <= 10) baseValue += 40; // Morning peak
                if (hour >= 12 && hour <= 14) baseValue += 35; // Lunch peak
                if (hour >= 18 && hour <= 20) baseValue += 50; // Evening peak
            } else { // Weekend
                if (hour >= 10 && hour <= 14) baseValue += 45; // Late morning
                if (hour >= 16 && hour <= 20) baseValue += 40; // Afternoon/evening
            }

            // Add some randomness
            const value = Math.min(100, Math.max(0, baseValue + (Math.random() - 0.5) * 30));
            const posts = Math.floor(value / 10);

            data.push({ day, hour: hourIdx, value: Math.round(value), posts });
        }
    }

    return data;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EngagementHeatmap() {
    const [platform, setPlatform] = useState<'all' | 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads'>('all');
    const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
    const [bestTimes, setBestTimes] = useState<BestTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

    useEffect(() => {
        loadHeatmapData();
    }, [platform]);

    const loadHeatmapData = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const data = generateHeatmapData();
        setHeatmapData(data);

        // Find best times
        const sortedData = [...data].sort((a, b) => b.value - a.value);
        const top3 = sortedData.slice(0, 3).map(cell => ({
            day: DAYS[cell.day],
            hour: HOURS[cell.hour],
            score: cell.value
        }));
        setBestTimes(top3);

        setLoading(false);
    };

    const getColor = (value: number): string => {
        if (value >= 80) return 'bg-green-500';
        if (value >= 60) return 'bg-lime-500';
        if (value >= 40) return 'bg-yellow-500';
        if (value >= 20) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getOpacity = (value: number): string => {
        if (value >= 80) return 'opacity-100';
        if (value >= 60) return 'opacity-80';
        if (value >= 40) return 'opacity-60';
        if (value >= 20) return 'opacity-40';
        return 'opacity-20';
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
                    <p className="text-gray-400">Loading heatmap...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-green-400" />
                        Engagement Heatmap
                    </h1>
                    <p className="text-gray-400 mt-1">Find the best times to post for maximum engagement</p>
                </div>

                {/* Platform Selector */}
                <div className="flex gap-2">
                    {(['all', 'Twitter', 'Reddit', 'Dev.to', 'Threads'] as const).map((p) => (
                        <Button
                            key={p}
                            variant={platform === p ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setPlatform(p)}
                        >
                            {p === 'all' ? 'All Platforms' : p}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Best Times Summary */}
            <Card variant="glass">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-400" />
                            <span className="text-white font-medium">Best Times to Post:</span>
                        </div>
                        <div className="flex gap-4">
                            {bestTimes.map((time, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Badge variant={idx === 0 ? 'success' : 'default'} size="lg">
                                        {time.day} {time.hour}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{time.score}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Heatmap Grid */}
            <Card variant="premium">
                <CardHeader action={
                    <Button variant="ghost" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={loadHeatmapData}>
                        Refresh
                    </Button>
                }>
                    <CardTitle>Weekly Engagement Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            {/* Header Row - Hours */}
                            <div className="flex mb-2">
                                <div className="w-16"></div>
                                {HOURS.map((hour) => (
                                    <div key={hour} className="flex-1 text-center text-xs text-gray-500 font-medium">
                                        {hour}
                                    </div>
                                ))}
                            </div>

                            {/* Data Rows */}
                            {DAYS.map((day, dayIdx) => (
                                <div key={day} className="flex items-center mb-1">
                                    <div className="w-16 text-sm text-gray-400 font-medium">{day}</div>
                                    <div className="flex-1 flex gap-1">
                                        {heatmapData
                                            .filter(cell => cell.day === dayIdx)
                                            .map((cell, hourIdx) => (
                                                <div
                                                    key={hourIdx}
                                                    className={`flex-1 h-10 rounded-lg ${getColor(cell.value)} ${getOpacity(cell.value)} cursor-pointer transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-white/30 relative`}
                                                    onMouseEnter={() => setHoveredCell(cell)}
                                                    onMouseLeave={() => setHoveredCell(null)}
                                                >
                                                    {hoveredCell === cell && (
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 rounded-lg text-xs whitespace-nowrap z-10 border border-white/10">
                                                            <p className="text-white font-medium">{DAYS[cell.day]} {HOURS[cell.hour]}</p>
                                                            <p className="text-gray-400">Engagement: {cell.value}%</p>
                                                            <p className="text-gray-400">{cell.posts} posts analyzed</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}

                            {/* Legend */}
                            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/10">
                                <span className="text-xs text-gray-500">Low</span>
                                <div className="flex gap-1">
                                    <div className="w-6 h-4 rounded bg-red-500 opacity-20"></div>
                                    <div className="w-6 h-4 rounded bg-orange-500 opacity-40"></div>
                                    <div className="w-6 h-4 rounded bg-yellow-500 opacity-60"></div>
                                    <div className="w-6 h-4 rounded bg-lime-500 opacity-80"></div>
                                    <div className="w-6 h-4 rounded bg-green-500"></div>
                                </div>
                                <span className="text-xs text-gray-500">High</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tips */}
            <Card variant="glass">
                <CardContent className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-white font-medium mb-1">Pro Tips</p>
                        <ul className="text-sm text-gray-400 space-y-1">
                            <li>• <span className="text-green-400">Green zones</span> have 2-3x higher engagement than average</li>
                            <li>• Schedule posts 5-10 minutes before peak times for best results</li>
                            <li>• Weekday mornings (8-10 AM) work best for professional content</li>
                            <li>• Evenings (6-8 PM) are ideal for viral/entertainment content</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
