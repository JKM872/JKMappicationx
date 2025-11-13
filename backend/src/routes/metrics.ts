import express from 'express';
import {
  getPostHistory,
  calculateGrowthRate,
  getTopPostsByEngagement,
  saveMetric,
} from '../services/metricsService';

const router = express.Router();

/**
 * GET /api/metrics/history
 * Get historical metrics for a post
 * 
 * Query params:
 *   - post_id: Post identifier (required)
 */
router.get('/history', async (req, res) => {
  try {
    const { post_id } = req.query;

    if (!post_id || typeof post_id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'post_id is required',
      });
      return;
    }

    const history = await getPostHistory(post_id);

    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * GET /api/metrics/growth
 * Calculate growth rate for a post
 * 
 * Query params:
 *   - post_id: Post identifier (required)
 */
router.get('/growth', async (req, res) => {
  try {
    const { post_id } = req.query;

    if (!post_id || typeof post_id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'post_id is required',
      });
      return;
    }

    const growthRate = await calculateGrowthRate(post_id);

    if (!growthRate) {
      res.json({
        success: true,
        data: null,
        message: 'Not enough data to calculate growth rate',
      });
      return;
    }

    res.json({
      success: true,
      data: growthRate,
    });
  } catch (error) {
    console.error('Growth calculation error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * GET /api/metrics/top
 * Get top posts by engagement
 * 
 * Query params:
 *   - hours: Look back period in hours (default: 24)
 *   - limit: Max results (default: 10)
 */
router.get('/top', async (req, res) => {
  try {
    const { hours = 24, limit = 10 } = req.query;

    const hoursNum = parseInt(hours as string);
    const limitNum = parseInt(limit as string);

    const topPosts = await getTopPostsByEngagement(hoursNum, limitNum);

    res.json({
      success: true,
      data: topPosts,
      count: topPosts.length,
    });
  } catch (error) {
    console.error('Top posts fetch error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/metrics/save
 * Manually save a metric snapshot
 * 
 * Body: PostMetric object
 */
router.post('/save', async (req, res) => {
  try {
    const metric = req.body;

    if (!metric.post_id || !metric.author) {
      res.status(400).json({
        success: false,
        error: 'Invalid metric data',
      });
      return;
    }

    await saveMetric(metric);

    res.json({
      success: true,
      message: 'Metric saved successfully',
    });
  } catch (error) {
    console.error('Metric save error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
