export interface Post {
  id?: string;
  platform?: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads' | 'reddit' | 'devto' | 'hackernews' | 'rss';
  content: string;
  title?: string;
  author: string;
  likes: number;
  retweets?: number;
  replies?: number;
  comments?: number;
  shares?: number;
  reposts?: number;      // For Threads
  username?: string;     // For Threads
  hoursAgo?: number;
  timestamp?: string | Date;
  postUrl?: string;
  url?: string;
  subreddit?: string;    // For Reddit posts
  image?: string;
  authorFollowers?: number;
  score: number;
  icon?: string;
}

export interface CaptionVariation {
  text: string;
  hashtags: string[];
  reason: string;
}

export interface MetricDataPoint {
  recorded_at: string;
  likes: number;
  retweets: number;
  replies: number;
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
}
