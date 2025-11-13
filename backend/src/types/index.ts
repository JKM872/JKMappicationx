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
