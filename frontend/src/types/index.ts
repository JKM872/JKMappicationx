export interface Post {
  id?: string;
  platform?: 'reddit' | 'devto' | 'hackernews' | 'rss';
  content: string;
  title?: string;
  author: string;
  likes: number;
  retweets?: number;
  replies?: number;
  comments?: number;
  shares?: number;
  hoursAgo?: number;
  timestamp?: string | Date;
  postUrl?: string;
  url?: string;
  authorFollowers?: number;
  score: number;
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
