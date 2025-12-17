import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MetricDataPoint, GrowthRate } from '../types';
import { BarChart3, Heart, Repeat, MessageCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  postId?: string;
}

export function Dashboard({ postId }: DashboardProps) {
  const [history, setHistory] = useState<MetricDataPoint[]>([]);
  const [growthRate, setGrowthRate] = useState<GrowthRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!postId) return;

    const fetchMetrics = async () => {
      setLoading(true);
      setError('');

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

        const [histRes, growthRes] = await Promise.all([
          axios.get(`${apiUrl}/api/metrics/history?post_id=${postId}`),
          axios.get(`${apiUrl}/api/metrics/growth?post_id=${postId}`),
        ]);

        if (histRes.data.success) {
          setHistory(histRes.data.data);
        }

        if (growthRes.data.success) {
          setGrowthRate(growthRes.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch metrics:', err);
        setError('Failed to load metrics data');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [postId]);

  if (!postId) {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" /> Engagement Dashboard
        </h2>
        <p className="text-gray-500 text-center py-12">
          Select a post to view engagement metrics and growth trends
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" /> Engagement Dashboard
      </h2>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading metrics...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded border border-red-200 mb-4">
          <AlertCircle className="w-4 h-4 inline mr-1" /> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Growth Rate Cards */}
          {growthRate && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1"><Heart className="w-3 h-3" /> Likes / Hour</p>
                <p className="text-2xl font-bold text-red-600">
                  +{growthRate.likes_per_hour.toFixed(1)}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1"><Repeat className="w-3 h-3" /> Retweets / Hour</p>
                <p className="text-2xl font-bold text-green-600">
                  +{growthRate.retweets_per_hour.toFixed(1)}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Replies / Hour</p>
                <p className="text-2xl font-bold text-blue-600">
                  +{growthRate.replies_per_hour.toFixed(1)}
                </p>
              </div>
            </div>
          )}

          {/* Engagement Chart */}
          {history.length > 0 ? (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-700 mb-3">
                Engagement Over Time
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="recorded_at"
                    tickFormatter={(time) =>
                      new Date(time).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(time) =>
                      new Date(time).toLocaleString('en-US')
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Likes"
                  />
                  <Line
                    type="monotone"
                    dataKey="retweets"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Retweets"
                  />
                  <Line
                    type="monotone"
                    dataKey="replies"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Replies"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No historical data available yet. Metrics will appear after the
              first scraping cycle.
            </p>
          )}
        </>
      )}
    </div>
  );
}
