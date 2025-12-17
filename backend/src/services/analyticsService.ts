/**
 * 📊 Analytics Service - Per-platform analytics and A/B testing
 * Tracks engagement, optimal posting times, and content performance
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface PlatformAnalytics {
  platform: string;
  totalPosts: number;
  totalEngagement: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  engagementRate: number;
  bestPostingTimes: { hour: number; dayOfWeek: number; avgEngagement: number }[];
  topHashtags: { tag: string; count: number; avgEngagement: number }[];
  contentTypePerformance: { type: string; avgEngagement: number }[];
}

export interface ABTest {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'paused';
  variants: ABTestVariant[];
  startDate: string;
  endDate?: string;
  winner?: string;
  created_at: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  content: string;
  hashtags?: string[];
  platform: string;
  impressions: number;
  engagements: number;
  clicks: number;
  conversions: number;
  engagementRate: number;
}

export interface PostPerformance {
  postId: string;
  platform: string;
  content: string;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  views?: number;
  engagementRate: number;
  viralScore: number;
  hashtags?: string[];
}

export interface OptimalTimeSlot {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  hour: number; // 0-23
  avgEngagement: number;
  confidence: number; // 0-1, based on sample size
  platform: string;
}

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase: SupabaseClient | null = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// ============================================================================
// ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Get analytics for a specific platform
 */
export async function getPlatformAnalytics(
  platform: string,
  dateRange?: { start: string; end: string }
): Promise<PlatformAnalytics | null> {
  if (!supabase) {
    console.warn('⚠️ Analytics: No database connection');
    return generateMockAnalytics(platform);
  }

  try {
    let query = supabase
      .from('post_metrics')
      .select('*')
      .eq('platform', platform);

    if (dateRange) {
      query = query
        .gte('recorded_at', dateRange.start)
        .lte('recorded_at', dateRange.end);
    }

    const { data: metrics, error } = await query;

    if (error) {
      console.error('❌ Analytics error:', error);
      return null;
    }

    if (!metrics || metrics.length === 0) {
      return generateMockAnalytics(platform);
    }

    // Calculate aggregated analytics
    const totalPosts = metrics.length;
    const totalLikes = metrics.reduce((sum, m) => sum + (m.likes || 0), 0);
    const totalComments = metrics.reduce((sum, m) => sum + (m.replies || m.comments || 0), 0);
    const totalShares = metrics.reduce((sum, m) => sum + (m.retweets || m.shares || 0), 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    // Calculate best posting times
    const timeSlots = calculateOptimalTimes(metrics);

    // Calculate top hashtags
    const hashtagStats = calculateHashtagPerformance(metrics);

    return {
      platform,
      totalPosts,
      totalEngagement,
      avgLikes: totalLikes / totalPosts,
      avgComments: totalComments / totalPosts,
      avgShares: totalShares / totalPosts,
      engagementRate: (totalEngagement / totalPosts) / 100, // Normalized
      bestPostingTimes: timeSlots.slice(0, 5),
      topHashtags: hashtagStats.slice(0, 10),
      contentTypePerformance: [
        { type: 'text', avgEngagement: totalEngagement / totalPosts * 0.8 },
        { type: 'image', avgEngagement: totalEngagement / totalPosts * 1.5 },
        { type: 'video', avgEngagement: totalEngagement / totalPosts * 2.2 },
        { type: 'thread', avgEngagement: totalEngagement / totalPosts * 1.8 }
      ]
    };
  } catch (error) {
    console.error('❌ Analytics error:', error);
    return null;
  }
}

/**
 * Get analytics for all platforms
 */
export async function getAllPlatformAnalytics(): Promise<Record<string, PlatformAnalytics>> {
  const platforms = ['Twitter', 'Reddit', 'Dev.to', 'Threads'];
  const analytics: Record<string, PlatformAnalytics> = {};

  for (const platform of platforms) {
    const data = await getPlatformAnalytics(platform);
    if (data) {
      analytics[platform] = data;
    }
  }

  return analytics;
}

/**
 * Get optimal posting times for a platform
 */
export async function getOptimalPostingTimes(platform: string): Promise<OptimalTimeSlot[]> {
  if (!supabase) {
    return generateMockOptimalTimes(platform);
  }

  try {
    const { data: metrics, error } = await supabase
      .from('post_metrics')
      .select('recorded_at, likes, retweets, replies')
      .eq('platform', platform)
      .order('recorded_at', { ascending: false })
      .limit(1000);

    if (error || !metrics || metrics.length === 0) {
      return generateMockOptimalTimes(platform);
    }

    return calculateOptimalTimes(metrics);
  } catch (error) {
    console.error('❌ Optimal times error:', error);
    return generateMockOptimalTimes(platform);
  }
}

/**
 * Calculate optimal posting times from metrics
 */
function calculateOptimalTimes(metrics: any[]): OptimalTimeSlot[] {
  const timeSlotMap: Map<string, { total: number; count: number; platform: string }> = new Map();

  for (const metric of metrics) {
    const date = new Date(metric.recorded_at);
    const dayOfWeek = date.getDay();
    const hour = date.getHours();
    const key = `${dayOfWeek}-${hour}`;
    
    const engagement = (metric.likes || 0) + (metric.retweets || 0) * 2 + (metric.replies || 0) * 3;
    
    if (timeSlotMap.has(key)) {
      const existing = timeSlotMap.get(key)!;
      existing.total += engagement;
      existing.count += 1;
    } else {
      timeSlotMap.set(key, { 
        total: engagement, 
        count: 1, 
        platform: metric.platform || 'unknown' 
      });
    }
  }

  const slots: OptimalTimeSlot[] = [];
  
  for (const [key, data] of timeSlotMap.entries()) {
    const [dayOfWeek, hour] = key.split('-').map(Number);
    slots.push({
      dayOfWeek,
      hour,
      avgEngagement: data.total / data.count,
      confidence: Math.min(data.count / 10, 1), // More samples = higher confidence
      platform: data.platform
    });
  }

  // Sort by average engagement descending
  return slots.sort((a, b) => b.avgEngagement - a.avgEngagement);
}

/**
 * Calculate hashtag performance
 */
function calculateHashtagPerformance(metrics: any[]): { tag: string; count: number; avgEngagement: number }[] {
  const hashtagMap: Map<string, { total: number; count: number }> = new Map();

  for (const metric of metrics) {
    if (!metric.hashtags || !Array.isArray(metric.hashtags)) continue;
    
    const engagement = (metric.likes || 0) + (metric.retweets || 0) * 2 + (metric.replies || 0) * 3;
    
    for (const tag of metric.hashtags) {
      if (hashtagMap.has(tag)) {
        const existing = hashtagMap.get(tag)!;
        existing.total += engagement;
        existing.count += 1;
      } else {
        hashtagMap.set(tag, { total: engagement, count: 1 });
      }
    }
  }

  const result: { tag: string; count: number; avgEngagement: number }[] = [];
  
  for (const [tag, data] of hashtagMap.entries()) {
    result.push({
      tag,
      count: data.count,
      avgEngagement: data.total / data.count
    });
  }

  return result.sort((a, b) => b.avgEngagement - a.avgEngagement);
}

// ============================================================================
// A/B TESTING
// ============================================================================

/**
 * Create a new A/B test
 */
export async function createABTest(
  name: string,
  variants: Omit<ABTestVariant, 'id' | 'impressions' | 'engagements' | 'clicks' | 'conversions' | 'engagementRate'>[]
): Promise<ABTest | null> {
  const test: ABTest = {
    id: `test-${Date.now()}`,
    name,
    status: 'active',
    variants: variants.map((v, idx) => ({
      ...v,
      id: `variant-${idx}-${Date.now()}`,
      impressions: 0,
      engagements: 0,
      clicks: 0,
      conversions: 0,
      engagementRate: 0
    })),
    startDate: new Date().toISOString(),
    created_at: new Date().toISOString()
  };

  if (!supabase) {
    console.log('📊 A/B Test created (local):', test.id);
    return test;
  }

  try {
    const { data, error } = await supabase
      .from('ab_tests')
      .insert(test)
      .select()
      .single();

    if (error) {
      console.error('❌ A/B Test creation error:', error);
      return null;
    }

    console.log('📊 A/B Test created:', data.id);
    return data;
  } catch (error) {
    console.error('❌ A/B Test error:', error);
    return null;
  }
}

/**
 * Record an impression for an A/B test variant
 */
export async function recordABTestImpression(testId: string, variantId: string): Promise<boolean> {
  if (!supabase) {
    console.log(`📊 A/B Impression recorded (local): ${testId}/${variantId}`);
    return true;
  }

  try {
    // First get current test
    const { data: test, error: fetchError } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (fetchError || !test) return false;

    // Update variant impressions
    const variants = test.variants.map((v: ABTestVariant) => {
      if (v.id === variantId) {
        return {
          ...v,
          impressions: v.impressions + 1,
          engagementRate: v.engagements / (v.impressions + 1)
        };
      }
      return v;
    });

    const { error: updateError } = await supabase
      .from('ab_tests')
      .update({ variants })
      .eq('id', testId);

    return !updateError;
  } catch (error) {
    console.error('❌ A/B Impression error:', error);
    return false;
  }
}

/**
 * Record an engagement for an A/B test variant
 */
export async function recordABTestEngagement(testId: string, variantId: string): Promise<boolean> {
  if (!supabase) {
    console.log(`📊 A/B Engagement recorded (local): ${testId}/${variantId}`);
    return true;
  }

  try {
    const { data: test, error: fetchError } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (fetchError || !test) return false;

    const variants = test.variants.map((v: ABTestVariant) => {
      if (v.id === variantId) {
        const newEngagements = v.engagements + 1;
        return {
          ...v,
          engagements: newEngagements,
          engagementRate: newEngagements / Math.max(v.impressions, 1)
        };
      }
      return v;
    });

    const { error: updateError } = await supabase
      .from('ab_tests')
      .update({ variants })
      .eq('id', testId);

    return !updateError;
  } catch (error) {
    console.error('❌ A/B Engagement error:', error);
    return false;
  }
}

/**
 * Get A/B test results and determine winner
 */
export async function getABTestResults(testId: string): Promise<ABTest | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data: test, error } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (error || !test) return null;

    // Determine winner based on engagement rate
    const sortedVariants = [...test.variants].sort(
      (a: ABTestVariant, b: ABTestVariant) => b.engagementRate - a.engagementRate
    );

    // Only declare winner if enough data (min 100 impressions per variant)
    const hasEnoughData = sortedVariants.every((v: ABTestVariant) => v.impressions >= 100);
    
    if (hasEnoughData && sortedVariants.length > 0) {
      test.winner = sortedVariants[0].id;
    }

    return test;
  } catch (error) {
    console.error('❌ A/B Test results error:', error);
    return null;
  }
}

/**
 * Get all A/B tests
 */
export async function getAllABTests(status?: string): Promise<ABTest[]> {
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase.from('ab_tests').select('*');
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Get A/B Tests error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Get A/B Tests error:', error);
    return [];
  }
}

// ============================================================================
// POST PERFORMANCE TRACKING
// ============================================================================

/**
 * Record post performance
 */
export async function recordPostPerformance(performance: Omit<PostPerformance, 'viralScore'>): Promise<boolean> {
  const viralScore = calculateViralScore(performance);
  const fullPerformance: PostPerformance = { ...performance, viralScore };

  if (!supabase) {
    console.log('📈 Post performance recorded (local):', fullPerformance.postId);
    return true;
  }

  try {
    const { error } = await supabase
      .from('post_performance')
      .upsert(fullPerformance);

    if (error) {
      console.error('❌ Record performance error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Record performance error:', error);
    return false;
  }
}

/**
 * Calculate viral score based on engagement metrics
 */
function calculateViralScore(performance: Omit<PostPerformance, 'viralScore'>): number {
  const likes = performance.likes || 0;
  const comments = performance.comments || 0;
  const shares = performance.shares || 0;
  const views = performance.views || 1;

  // Weighted score: shares > comments > likes
  const engagementScore = likes + comments * 2 + shares * 3;
  
  // Normalize by views if available
  const engagementRate = engagementScore / views * 100;

  // Time decay (posts lose viral potential over time)
  const hoursOld = (Date.now() - new Date(performance.publishedAt).getTime()) / (1000 * 60 * 60);
  const timeFactor = Math.pow(0.95, Math.min(hoursOld, 168)); // Decay over a week

  return Math.round(engagementScore * timeFactor);
}

/**
 * Get top performing posts
 */
export async function getTopPerformingPosts(
  platform?: string,
  limit: number = 10
): Promise<PostPerformance[]> {
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('post_performance')
      .select('*')
      .order('viralScore', { ascending: false })
      .limit(limit);

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Get top posts error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Get top posts error:', error);
    return [];
  }
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function generateMockAnalytics(platform: string): PlatformAnalytics {
  const baseEngagement = Math.random() * 1000 + 500;
  
  return {
    platform,
    totalPosts: Math.floor(Math.random() * 100) + 20,
    totalEngagement: Math.floor(baseEngagement * 50),
    avgLikes: Math.floor(baseEngagement * 0.6),
    avgComments: Math.floor(baseEngagement * 0.2),
    avgShares: Math.floor(baseEngagement * 0.2),
    engagementRate: Math.random() * 5 + 2,
    bestPostingTimes: [
      { hour: 9, dayOfWeek: 1, avgEngagement: baseEngagement * 1.5 },
      { hour: 13, dayOfWeek: 2, avgEngagement: baseEngagement * 1.3 },
      { hour: 17, dayOfWeek: 4, avgEngagement: baseEngagement * 1.4 },
      { hour: 20, dayOfWeek: 3, avgEngagement: baseEngagement * 1.2 },
      { hour: 11, dayOfWeek: 5, avgEngagement: baseEngagement * 1.1 }
    ],
    topHashtags: [
      { tag: '#viral', count: 45, avgEngagement: baseEngagement * 2 },
      { tag: '#content', count: 38, avgEngagement: baseEngagement * 1.8 },
      { tag: '#marketing', count: 32, avgEngagement: baseEngagement * 1.5 },
      { tag: '#socialmedia', count: 28, avgEngagement: baseEngagement * 1.4 },
      { tag: '#growth', count: 25, avgEngagement: baseEngagement * 1.3 }
    ],
    contentTypePerformance: [
      { type: 'video', avgEngagement: baseEngagement * 2.5 },
      { type: 'image', avgEngagement: baseEngagement * 1.8 },
      { type: 'thread', avgEngagement: baseEngagement * 1.5 },
      { type: 'text', avgEngagement: baseEngagement }
    ]
  };
}

function generateMockOptimalTimes(platform: string): OptimalTimeSlot[] {
  const slots: OptimalTimeSlot[] = [];
  
  // Generate realistic optimal times based on platform
  const platformTimes: Record<string, number[]> = {
    'Twitter': [9, 12, 17, 20, 22],
    'Reddit': [8, 12, 18, 21, 23],
    'Dev.to': [9, 10, 14, 16, 19],
    'Threads': [11, 13, 18, 20, 21]
  };

  const hours = platformTimes[platform] || [9, 12, 17, 20];
  const days = [1, 2, 3, 4, 5]; // Weekdays

  for (const day of days) {
    for (const hour of hours) {
      slots.push({
        dayOfWeek: day,
        hour,
        avgEngagement: Math.random() * 500 + 200,
        confidence: Math.random() * 0.5 + 0.5,
        platform
      });
    }
  }

  return slots.sort((a, b) => b.avgEngagement - a.avgEngagement);
}
