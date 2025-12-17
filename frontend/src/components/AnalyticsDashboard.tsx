import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, Flame, Heart, MessageCircle, Star, Code, Globe, FileText } from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { SiReddit, SiThreads } from 'react-icons/si';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface PlatformStats {
  platform: string;
  posts: number;
  totalLikes: number;
  totalComments: number;
  avgEngagement: number;
}

interface TimeSeriesData {
  date: string;
  posts: number;
  engagement: number;
}

interface TopPost {
  id: string;
  content: string;
  platform: string;
  likes: number;
  comments: number;
  score: number;
}

const COLORS = ['#1d9bf0', '#f97316', '#a855f7', '#ec4899', '#22c55e'];

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [platformStats, setPlatformStats] = useState<PlatformStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    avgScore: 0,
    scheduledPosts: 0,
    draftPosts: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch planned posts stats
      const statsResponse = await fetch(`${API_BASE}/api/plan/stats`);
      const statsData = await statsResponse.json();

      if (statsData.success) {
        const byPlatform = statsData.stats.by_platform || {};
        const platformData: PlatformStats[] = Object.entries(byPlatform).map(([platform, count]) => ({
          platform,
          posts: count as number,
          totalLikes: Math.floor(Math.random() * 10000), // Demo data
          totalComments: Math.floor(Math.random() * 1000),
          avgEngagement: Math.random() * 10
        }));
        setPlatformStats(platformData);

        setTotalStats({
          totalPosts: statsData.stats.total || 0,
          totalLikes: platformData.reduce((sum, p) => sum + p.totalLikes, 0),
          totalComments: platformData.reduce((sum, p) => sum + p.totalComments, 0),
          avgScore: platformData.length > 0 ? platformData.reduce((sum, p) => sum + p.avgEngagement, 0) / platformData.length : 0,
          scheduledPosts: statsData.stats.scheduled || 0,
          draftPosts: statsData.stats.draft || 0
        });
      }

      // Generate demo time series data
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const timeSeries: TimeSeriesData[] = [];
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        timeSeries.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          posts: Math.floor(Math.random() * 20) + 5,
          engagement: Math.floor(Math.random() * 5000) + 1000
        });
      }
      setTimeSeriesData(timeSeries);

      // Demo top posts
      setTopPosts([
        { id: '1', content: 'AI is transforming how we work...', platform: 'Twitter', likes: 5420, comments: 342, score: 8.9 },
        { id: '2', content: 'New JavaScript features in 2025...', platform: 'Dev.to', likes: 3210, comments: 156, score: 7.8 },
        { id: '3', content: 'The future of remote work...', platform: 'Reddit', likes: 2890, comments: 445, score: 7.5 },
        { id: '4', content: 'Building with React 19...', platform: 'Threads', likes: 1950, comments: 89, score: 6.9 },
        { id: '5', content: 'Python vs JavaScript in 2025...', platform: 'Reddit', likes: 1720, comments: 234, score: 6.5 },
      ]);

    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPlatformIcon = (platform: string): React.ReactNode => {
    const icons: Record<string, React.ReactNode> = {
      Twitter: <FaXTwitter className="w-5 h-5" />,
      Reddit: <SiReddit className="w-5 h-5" />,
      'Dev.to': <Code className="w-5 h-5" />,
      Threads: <SiThreads className="w-5 h-5" />,
      all: <Globe className="w-5 h-5" />
    };
    return icons[platform] || <FileText className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d9bf0]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Analytics Dashboard</h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${timeRange === range
                ? 'bg-[#1d9bf0] text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-xl p-4 border border-blue-700/50">
          <p className="text-xs text-gray-400 mb-1">Total Posts</p>
          <p className="text-2xl font-bold text-white">{formatNumber(totalStats.totalPosts)}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 rounded-xl p-4 border border-pink-700/50">
          <p className="text-xs text-gray-400 mb-1">Total Likes</p>
          <p className="text-2xl font-bold text-white">{formatNumber(totalStats.totalLikes)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-xl p-4 border border-purple-700/50">
          <p className="text-xs text-gray-400 mb-1">Comments</p>
          <p className="text-2xl font-bold text-white">{formatNumber(totalStats.totalComments)}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-xl p-4 border border-green-700/50">
          <p className="text-xs text-gray-400 mb-1">Avg Score</p>
          <p className="text-2xl font-bold text-white">{totalStats.avgScore.toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-xl p-4 border border-yellow-700/50">
          <p className="text-xs text-gray-400 mb-1">Scheduled</p>
          <p className="text-2xl font-bold text-white">{totalStats.scheduledPosts}</p>
        </div>
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-xl p-4 border border-gray-600/50">
          <p className="text-xs text-gray-400 mb-1">Drafts</p>
          <p className="text-2xl font-bold text-white">{totalStats.draftPosts}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Over Time */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Engagement Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d9bf0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1d9bf0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stroke="#1d9bf0"
                fillOpacity={1}
                fill="url(#colorEngagement)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Posts by Platform */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Posts by Platform</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={platformStats.length > 0 ? platformStats : [{ platform: 'No Data', posts: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="posts"
                nameKey="platform"
                label={({ platform, percent }) => `${platform} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(platformStats.length > 0 ? platformStats : [{ platform: 'No Data', posts: 1 }]).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Posts Activity */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Daily Post Activity</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            />
            <Bar dataKey="posts" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Flame className="w-5 h-5 text-orange-400" /> Top Performing Posts</h3>
        <div className="space-y-3">
          {topPosts.map((post, idx) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <span className="text-2xl font-bold text-gray-600 w-8">#{idx + 1}</span>
              <span className="text-2xl">{getPlatformIcon(post.platform)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white truncate">{post.content}</p>
                <p className="text-xs text-gray-500">{post.platform}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-pink-400 flex items-center gap-1"><Heart className="w-4 h-4" /> {formatNumber(post.likes)}</span>
                <span className="text-blue-400 flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {formatNumber(post.comments)}</span>
                <span className="text-yellow-400 flex items-center gap-1"><Star className="w-4 h-4" /> {post.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

