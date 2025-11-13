-- Supabase Schema for Viral Content Hunter
-- Run this in your Supabase SQL Editor

-- Create post_metrics table
CREATE TABLE IF NOT EXISTS post_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT,
  likes INTEGER DEFAULT 0,
  retweets INTEGER DEFAULT 0,
  replies INTEGER DEFAULT 0,
  engagement_rate FLOAT DEFAULT 0.0,
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_id ON post_metrics(post_id);
CREATE INDEX IF NOT EXISTS idx_recorded_at ON post_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_author ON post_metrics(author);
CREATE INDEX IF NOT EXISTS idx_engagement_rate ON post_metrics(engagement_rate DESC);

-- Create view for latest metrics per post
CREATE OR REPLACE VIEW latest_post_metrics AS
SELECT DISTINCT ON (post_id)
  id,
  post_id,
  author,
  content,
  likes,
  retweets,
  replies,
  engagement_rate,
  recorded_at
FROM post_metrics
ORDER BY post_id, recorded_at DESC;

-- Create function to get growth rate
CREATE OR REPLACE FUNCTION calculate_post_growth(p_post_id TEXT)
RETURNS TABLE (
  likes_per_hour FLOAT,
  retweets_per_hour FLOAT,
  replies_per_hour FLOAT
) AS $$
DECLARE
  first_record RECORD;
  last_record RECORD;
  time_diff_hours FLOAT;
BEGIN
  -- Get first and last records
  SELECT * INTO first_record
  FROM post_metrics
  WHERE post_id = p_post_id
  ORDER BY recorded_at ASC
  LIMIT 1;

  SELECT * INTO last_record
  FROM post_metrics
  WHERE post_id = p_post_id
  ORDER BY recorded_at DESC
  LIMIT 1;

  -- Calculate time difference in hours
  time_diff_hours := EXTRACT(EPOCH FROM (last_record.recorded_at - first_record.recorded_at)) / 3600;

  -- Avoid division by zero
  IF time_diff_hours = 0 THEN
    time_diff_hours := 1;
  END IF;

  -- Return growth rates
  RETURN QUERY
  SELECT
    ((last_record.likes - first_record.likes)::FLOAT / time_diff_hours),
    ((last_record.retweets - first_record.retweets)::FLOAT / time_diff_hours),
    ((last_record.replies - first_record.replies)::FLOAT / time_diff_hours);
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust if needed)
-- ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
