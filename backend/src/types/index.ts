export interface Post {
  content: string;
  author: string;
  likes: number;
  retweets: number;
  replies: number;
  hoursAgo: number;
  postUrl?: string;
  authorFollowers?: number;
}

export interface TwitterPost {
  id: string;
  title: string;
  content: string;
  author: string;
  handle?: string;
  username?: string;
  timestamp: string;
  url: string;
  platform: 'twitter' | 'Twitter';
  likes: number;
  retweets: number;
  replies: number;
  views?: number;
  score: number;
  image?: string;
}

export interface PostWithScore extends Post {
  score: number;
}

export interface PostMetric {
  post_id: string;
  author: string;
  content: string;
  likes: number;
  retweets: number;
  replies: number;
  engagement_rate: number;
  recorded_at: Date;
}

export interface CaptionVariation {
  text: string;
  hashtags: string[];
  reason: string;
}

export interface AIGenerationRequest {
  topic: string;
  tone?: string;
}

export interface HashtagRequest {
  topic: string;
  count?: number;
}

export interface GrowthRate {
  likes_per_hour: number;
  retweets_per_hour: number;
  replies_per_hour: number;
}

export interface PlannedPost {
  id: string;
  content: string;
  platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads' | 'all';
  scheduled_date?: string;
  status: 'draft' | 'scheduled' | 'published';
  original_post_id?: string;
  original_content?: string;
  hashtags?: string[];
  created_at: string;
  updated_at: string;
  user_id?: string;
}

// ============================================================================
// GROWTH ANALYTICS TYPES
// ============================================================================

/**
 * Author statistics snapshot - tracks follower counts over time
 */
export interface AuthorStats {
  id?: string;
  author_handle: string;
  platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
  followers_count: number;
  following_count?: number;
  posts_count?: number;
  recorded_at: Date;
}

/**
 * Calculated author growth over a time period
 */
export interface AuthorGrowth {
  author_handle: string;
  platform: string;
  current_followers: number;
  previous_followers: number;
  growth_absolute: number;
  growth_percentage: number;
  period_hours: number;
}

/**
 * Post with high engagement relative to author's follower count
 * These are "hidden gems" - great content from smaller accounts
 */
export interface UndervaluedPost {
  post_id: string;
  author: string;
  platform: string;
  content: string;
  title?: string;
  likes: number;
  comments: number;
  shares?: number;
  author_followers: number;
  engagement_rate: number;
  undervalue_score: number;  // Higher = more undervalued
  postUrl?: string;
}

/**
 * AI-powered virality prediction for a post
 */
export interface ViralityPrediction {
  post_id: string;
  platform: string;
  content: string;
  author?: string;
  viral_score: number;        // 0-100 scale
  confidence: number;         // 0-1 scale
  predicted_reach: string;    // e.g., "10K-50K", "50K-100K"
  factors: ViralityFactor[];
  predicted_at?: Date;
}

/**
 * Individual factor contributing to virality prediction
 */
export interface ViralityFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  score: number;              // -100 to +100
  reason: string;
}