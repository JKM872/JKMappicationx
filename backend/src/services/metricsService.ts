import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PostMetric, GrowthRate } from '../types';

let supabase: SupabaseClient | null = null;

// Initialize Supabase client
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
} else {
  console.warn('⚠️ Supabase credentials not set. Metrics features will not work.');
}

/**
 * Save a post metric snapshot to the database
 * @param metric Post metric data
 * @returns Success status
 */
export async function saveMetric(metric: PostMetric): Promise<boolean> {
  if (!supabase) {
    throw new Error('Supabase not initialized. Check your environment variables.');
  }

  try {
    const { error } = await supabase
      .from('post_metrics')
      .insert([
        {
          ...metric,
          recorded_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) throw error;

    console.log(`✅ Saved metric for post: ${metric.post_id}`);
    return true;
  } catch (error) {
    console.error('Error saving metric:', error);
    throw error;
  }
}

/**
 * Save multiple metrics in batch
 * @param metrics Array of post metrics
 * @returns Number of successfully saved metrics
 */
export async function saveMetricsBatch(metrics: PostMetric[]): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase not initialized.');
  }

  try {
    const timestamp = new Date().toISOString();
    const records = metrics.map(metric => ({
      ...metric,
      recorded_at: timestamp,
      created_at: timestamp,
    }));

    const { error } = await supabase
      .from('post_metrics')
      .insert(records);

    if (error) throw error;

    console.log(`✅ Saved ${metrics.length} metrics in batch`);
    return metrics.length;
  } catch (error) {
    console.error('Error saving metrics batch:', error);
    throw error;
  }
}

/**
 * Get historical metrics for a specific post
 * @param post_id Post identifier
 * @returns Array of metrics ordered by time
 */
export async function getPostHistory(post_id: string): Promise<PostMetric[]> {
  if (!supabase) {
    throw new Error('Supabase not initialized.');
  }

  try {
    const { data, error } = await supabase
      .from('post_metrics')
      .select('*')
      .eq('post_id', post_id)
      .order('recorded_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching post history:', error);
    throw error;
  }
}

/**
 * Calculate growth rate for a post
 * @param post_id Post identifier
 * @returns Growth rates per hour
 */
export async function calculateGrowthRate(post_id: string): Promise<GrowthRate | null> {
  try {
    const history = await getPostHistory(post_id);

    if (history.length < 2) {
      return null; // Not enough data
    }

    const first = history[0];
    const last = history[history.length - 1];

    // Calculate time difference in hours
    const firstTime = new Date(first.recorded_at).getTime();
    const lastTime = new Date(last.recorded_at).getTime();
    const timeDiffHours = (lastTime - firstTime) / (1000 * 3600);

    if (timeDiffHours === 0) {
      return null; // Avoid division by zero
    }

    // Calculate growth per hour
    const growthRate: GrowthRate = {
      likes_per_hour: (last.likes - first.likes) / timeDiffHours,
      retweets_per_hour: (last.retweets - first.retweets) / timeDiffHours,
      replies_per_hour: (last.replies - first.replies) / timeDiffHours,
    };

    return growthRate;
  } catch (error) {
    console.error('Error calculating growth rate:', error);
    throw error;
  }
}

/**
 * Get top posts by engagement in a time period
 * @param hours Number of hours to look back
 * @param limit Maximum number of posts to return
 * @returns Top posts by engagement
 */
export async function getTopPostsByEngagement(
  hours: number = 24,
  limit: number = 10
): Promise<PostMetric[]> {
  if (!supabase) {
    throw new Error('Supabase not initialized.');
  }

  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const { data, error } = await supabase
      .from('post_metrics')
      .select('*')
      .gte('recorded_at', cutoffTime.toISOString())
      .order('engagement_rate', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching top posts:', error);
    throw error;
  }
}

/**
 * Calculate engagement rate for a post
 * @param likes Number of likes
 * @param retweets Number of retweets
 * @param replies Number of replies
 * @param followers Number of author followers (if available)
 * @returns Engagement rate as percentage
 */
export function calculateEngagementRate(
  likes: number,
  retweets: number,
  replies: number,
  followers: number = 1000 // Default fallback
): number {
  const totalEngagement = likes + retweets + replies;
  const rate = (totalEngagement / Math.max(followers, 1)) * 100;
  return parseFloat(rate.toFixed(2));
}

/**
 * Delete old metrics (for cleanup)
 * @param daysOld Delete metrics older than this many days
 * @returns Number of deleted records
 */
export async function cleanupOldMetrics(daysOld: number = 30): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase not initialized.');
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabase
      .from('post_metrics')
      .delete()
      .lt('recorded_at', cutoffDate.toISOString())
      .select();

    if (error) throw error;

    const deletedCount = data?.length || 0;
    console.log(`🗑️ Cleaned up ${deletedCount} old metrics`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up metrics:', error);
    throw error;
  }
}
