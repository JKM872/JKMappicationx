/**
 * 📊 Growth Analytics Routes
 * API endpoints for author growth tracking, undervalued posts, and virality prediction
 */

import express from 'express';
import {
    getAuthorGrowth,
    getTopGrowingAuthors,
    getAuthorHistory,
    saveAuthorStats
} from '../services/authorGrowthService';
import {
    getUndervaluedPosts,
    findUndervaluedFromPosts
} from '../services/undervaluedPostsService';
import {
    predictVirality,
    getTopViralCandidates
} from '../services/viralityPredictionService';

const router = express.Router();

// ============================================================================
// AUTHOR GROWTH ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/author-growth
 * Get follower growth for a specific author
 * 
 * Query params:
 *   - author: Author handle (required)
 *   - platform: Platform name (required)
 *   - hours: Time period in hours (default: 168 = 7 days)
 */
router.get('/author-growth', async (req, res) => {
    try {
        const { author, platform, hours = '168' } = req.query;

        if (!author || !platform) {
            res.status(400).json({
                success: false,
                error: 'author and platform are required'
            });
            return;
        }

        const growth = await getAuthorGrowth(
            author as string,
            platform as string,
            parseInt(hours as string)
        );

        res.json({
            success: true,
            data: growth
        });
    } catch (error) {
        console.error('Author growth error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/analytics/author-growth/top
 * Get top growing authors
 * 
 * Query params:
 *   - platform: Filter by platform (optional)
 *   - hours: Time period in hours (default: 168)
 *   - limit: Max results (default: 10)
 */
router.get('/author-growth/top', async (req, res) => {
    try {
        const { platform, hours = '168', limit = '10' } = req.query;

        const topGrowing = await getTopGrowingAuthors(
            platform as string | undefined,
            parseInt(hours as string),
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: topGrowing,
            count: topGrowing.length
        });
    } catch (error) {
        console.error('Top growing authors error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/analytics/author-growth/history
 * Get author's follower count history
 * 
 * Query params:
 *   - author: Author handle (required)
 *   - platform: Platform name (required)
 *   - limit: Max records (default: 100)
 */
router.get('/author-growth/history', async (req, res) => {
    try {
        const { author, platform, limit = '100' } = req.query;

        if (!author || !platform) {
            res.status(400).json({
                success: false,
                error: 'author and platform are required'
            });
            return;
        }

        const history = await getAuthorHistory(
            author as string,
            platform as string,
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: history,
            count: history.length
        });
    } catch (error) {
        console.error('Author history error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * POST /api/analytics/author-growth/save
 * Manually save author stats (for testing/admin)
 * 
 * Body: { author_handle, platform, followers_count, following_count?, posts_count? }
 */
router.post('/author-growth/save', async (req, res) => {
    try {
        const { author_handle, platform, followers_count, following_count, posts_count } = req.body;

        if (!author_handle || !platform || followers_count === undefined) {
            res.status(400).json({
                success: false,
                error: 'author_handle, platform, and followers_count are required'
            });
            return;
        }

        const saved = await saveAuthorStats({
            author_handle,
            platform,
            followers_count,
            following_count,
            posts_count
        });

        res.json({
            success: saved,
            message: saved ? 'Author stats saved' : 'Failed to save'
        });
    } catch (error) {
        console.error('Save author stats error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

// ============================================================================
// UNDERVALUED POSTS (HIDDEN GEMS) ENDPOINTS
// ============================================================================

/**
 * GET /api/analytics/undervalued
 * Get "hidden gems" - posts with high engagement from low-follower authors
 * 
 * Query params:
 *   - platform: Filter by platform (optional)
 *   - limit: Max results (default: 20)
 *   - minEngagement: Minimum likes to consider (default: 50)
 */
router.get('/undervalued', async (req, res) => {
    try {
        const { platform, limit = '20', minEngagement = '50' } = req.query;

        const posts = await getUndervaluedPosts(
            platform as string | undefined,
            parseInt(limit as string),
            parseInt(minEngagement as string)
        );

        res.json({
            success: true,
            data: posts,
            count: posts.length
        });
    } catch (error) {
        console.error('Undervalued posts error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * POST /api/analytics/undervalued/analyze
 * Analyze a list of posts to find the most undervalued
 * Use this with freshly scraped data
 * 
 * Body: { posts: [...], limit?: number }
 */
router.post('/undervalued/analyze', async (req, res) => {
    try {
        const { posts, limit = 10 } = req.body;

        if (!posts || !Array.isArray(posts)) {
            res.status(400).json({
                success: false,
                error: 'posts array is required'
            });
            return;
        }

        const undervalued = findUndervaluedFromPosts(posts, limit);

        res.json({
            success: true,
            data: undervalued,
            count: undervalued.length
        });
    } catch (error) {
        console.error('Analyze undervalued error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

// ============================================================================
// VIRALITY PREDICTION ENDPOINTS
// ============================================================================

/**
 * POST /api/analytics/virality/predict
 * Predict viral potential of a post using AI
 * 
 * Body: { content: string, platform: string, author?: string }
 */
router.post('/virality/predict', async (req, res) => {
    try {
        const { content, platform, author } = req.body;

        if (!content || !platform) {
            res.status(400).json({
                success: false,
                error: 'content and platform are required'
            });
            return;
        }

        const prediction = await predictVirality(content, platform, author);

        res.json({
            success: true,
            data: prediction
        });
    } catch (error) {
        console.error('Virality prediction error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/analytics/virality/top
 * Get posts with highest predicted viral potential
 * 
 * Query params:
 *   - platform: Filter by platform (optional)
 *   - limit: Max results (default: 10)
 */
router.get('/virality/top', async (req, res) => {
    try {
        const { platform, limit = '10' } = req.query;

        const candidates = await getTopViralCandidates(
            platform as string | undefined,
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: candidates,
            count: candidates.length
        });
    } catch (error) {
        console.error('Top viral candidates error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

export default router;
