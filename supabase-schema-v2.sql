-- =====================================================
-- Growth Analytics Schema Extension v2
-- Run this in your Supabase SQL Editor AFTER the main schema
-- =====================================================

-- =====================================================
-- Author Statistics Table - Track follower growth
-- =====================================================
CREATE TABLE IF NOT EXISTS author_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_handle TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Twitter', 'Reddit', 'Dev.to', 'Threads')),
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  recorded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for author_stats
CREATE INDEX IF NOT EXISTS idx_author_stats_handle ON author_stats(author_handle);
CREATE INDEX IF NOT EXISTS idx_author_stats_platform ON author_stats(platform);
CREATE INDEX IF NOT EXISTS idx_author_stats_recorded_at ON author_stats(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_author_stats_handle_platform ON author_stats(author_handle, platform);

-- =====================================================
-- Virality Predictions Table - AI-powered predictions
-- =====================================================
CREATE TABLE IF NOT EXISTS virality_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  content TEXT,
  author TEXT,
  viral_score FLOAT DEFAULT 0.0 CHECK (viral_score >= 0 AND viral_score <= 100),
  confidence FLOAT DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
  predicted_reach TEXT,
  factors JSONB,
  predicted_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for virality_predictions
CREATE INDEX IF NOT EXISTS idx_virality_predictions_post_id ON virality_predictions(post_id);
CREATE INDEX IF NOT EXISTS idx_virality_predictions_score ON virality_predictions(viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_virality_predictions_platform ON virality_predictions(platform);
CREATE INDEX IF NOT EXISTS idx_virality_predictions_date ON virality_predictions(predicted_at DESC);

-- =====================================================
-- Views for Growth Analytics
-- =====================================================

-- View: Latest author stats (most recent snapshot per author+platform)
CREATE OR REPLACE VIEW latest_author_stats AS
SELECT DISTINCT ON (author_handle, platform)
  id,
  author_handle,
  platform,
  followers_count,
  following_count,
  posts_count,
  recorded_at
FROM author_stats
ORDER BY author_handle, platform, recorded_at DESC;

-- View: Top growing authors (last 7 days)
CREATE OR REPLACE VIEW author_growth_7d AS
WITH first_stats AS (
  SELECT DISTINCT ON (author_handle, platform)
    author_handle,
    platform,
    followers_count AS first_followers,
    recorded_at AS first_recorded
  FROM author_stats
  WHERE recorded_at >= NOW() - INTERVAL '7 days'
  ORDER BY author_handle, platform, recorded_at ASC
),
latest_stats AS (
  SELECT DISTINCT ON (author_handle, platform)
    author_handle,
    platform,
    followers_count AS latest_followers,
    recorded_at AS latest_recorded
  FROM author_stats
  WHERE recorded_at >= NOW() - INTERVAL '7 days'
  ORDER BY author_handle, platform, recorded_at DESC
)
SELECT 
  f.author_handle,
  f.platform,
  f.first_followers,
  l.latest_followers,
  (l.latest_followers - f.first_followers) AS growth_absolute,
  CASE 
    WHEN f.first_followers > 0 
    THEN ROUND(((l.latest_followers - f.first_followers)::NUMERIC / f.first_followers) * 100, 2)
    ELSE 0 
  END AS growth_percentage
FROM first_stats f
JOIN latest_stats l ON f.author_handle = l.author_handle AND f.platform = l.platform
WHERE l.latest_followers > f.first_followers
ORDER BY growth_absolute DESC;

-- =====================================================
-- Functions
-- =====================================================

-- Function: Calculate author growth over custom period
CREATE OR REPLACE FUNCTION calculate_author_growth(
  p_author_handle TEXT,
  p_platform TEXT,
  p_hours INTEGER DEFAULT 168
)
RETURNS TABLE (
  current_followers INTEGER,
  previous_followers INTEGER,
  growth_absolute INTEGER,
  growth_percentage NUMERIC
) AS $$
DECLARE
  v_current INTEGER;
  v_previous INTEGER;
BEGIN
  -- Get most recent followers count
  SELECT followers_count INTO v_current
  FROM author_stats
  WHERE author_handle = p_author_handle AND platform = p_platform
  ORDER BY recorded_at DESC
  LIMIT 1;

  -- Get followers count from p_hours ago
  SELECT followers_count INTO v_previous
  FROM author_stats
  WHERE author_handle = p_author_handle 
    AND platform = p_platform
    AND recorded_at <= NOW() - (p_hours || ' hours')::INTERVAL
  ORDER BY recorded_at DESC
  LIMIT 1;

  -- If no previous data, use current as previous
  IF v_previous IS NULL THEN
    v_previous := v_current;
  END IF;

  RETURN QUERY SELECT
    COALESCE(v_current, 0),
    COALESCE(v_previous, 0),
    COALESCE(v_current, 0) - COALESCE(v_previous, 0),
    CASE 
      WHEN COALESCE(v_previous, 0) > 0 
      THEN ROUND(((COALESCE(v_current, 0) - COALESCE(v_previous, 0))::NUMERIC / v_previous) * 100, 2)
      ELSE 0
    END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Scheduled Posts Table - Posts scheduled for future
-- =====================================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Twitter', 'Reddit', 'Dev.to', 'Threads')),
  hashtags TEXT[],
  scheduled_for TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMP,
  post_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for scheduled_posts
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_platform ON scheduled_posts(platform);

-- =====================================================
-- Scheduled Reposts Table - For auto-repost feature
-- =====================================================
CREATE TABLE IF NOT EXISTS scheduled_reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('Twitter', 'Reddit', 'Dev.to', 'Threads')),
  scheduled_for TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'cancelled', 'failed')),
  original_engagement JSONB,
  repost_score INTEGER DEFAULT 0,
  posted_at TIMESTAMP,
  post_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for scheduled_reposts
CREATE INDEX IF NOT EXISTS idx_scheduled_reposts_status ON scheduled_reposts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_reposts_scheduled_for ON scheduled_reposts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_reposts_platform ON scheduled_reposts(platform);

-- =====================================================
-- View: Pending scheduled posts (due now or past due)
-- =====================================================
CREATE OR REPLACE VIEW pending_scheduled_posts AS
SELECT *
FROM scheduled_posts
WHERE status = 'scheduled'
  AND scheduled_for <= NOW()
ORDER BY scheduled_for ASC;

-- View: Pending scheduled reposts
CREATE OR REPLACE VIEW pending_scheduled_reposts AS
SELECT *
FROM scheduled_reposts
WHERE status = 'pending'
  AND scheduled_for <= NOW()
ORDER BY scheduled_for ASC;

-- =====================================================
-- Auto-update timestamp trigger
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to scheduled_posts
DROP TRIGGER IF EXISTS scheduled_posts_updated_at ON scheduled_posts;
CREATE TRIGGER scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

