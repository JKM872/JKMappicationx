/**
 * 📊 Dashboard Analytics Routes
 * API endpoints for performance dashboard
 */

import express from 'express';
import {
    getPlatformAnalytics,
    getAllPlatformAnalytics,
    getTopPerformingPosts
} from '../services/analyticsService';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Get overall dashboard statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        const allAnalytics = await getAllPlatformAnalytics();

        // Calculate totals
        let totalPosts = 0;
        let totalEngagement = 0;
        let topPlatform = { name: 'Twitter', engagement: 0 };

        for (const [platform, data] of Object.entries(allAnalytics)) {
            totalPosts += data.totalPosts;
            totalEngagement += data.totalEngagement;
            if (data.totalEngagement > topPlatform.engagement) {
                topPlatform = { name: platform, engagement: data.totalEngagement };
            }
        }

        const avgEngagementRate = Object.values(allAnalytics)
            .reduce((sum, d) => sum + d.engagementRate, 0) / Math.max(Object.keys(allAnalytics).length, 1);

        res.json({
            success: true,
            data: {
                totalPosts,
                totalEngagement,
                avgEngagementRate: parseFloat(avgEngagementRate.toFixed(2)),
                topPlatform: topPlatform.name,
                growthTrend: parseFloat((Math.random() * 20 - 5).toFixed(1)) // TODO: Calculate real trend
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/dashboard/platforms
 * Get per-platform statistics
 */
router.get('/platforms', async (req, res) => {
    try {
        const allAnalytics = await getAllPlatformAnalytics();

        const platformStats = Object.entries(allAnalytics).map(([platform, data]) => ({
            platform,
            posts: data.totalPosts,
            engagement: data.totalEngagement,
            avgLikes: Math.round(data.avgLikes),
            avgComments: Math.round(data.avgComments),
            trend: parseFloat((Math.random() * 30 - 10).toFixed(1)) // TODO: Calculate real trend
        }));

        res.json({
            success: true,
            data: platformStats
        });
    } catch (error) {
        console.error('Platform stats error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/dashboard/top-posts
 * Get top performing posts
 */
router.get('/top-posts', async (req, res) => {
    try {
        const { platform, limit = '10' } = req.query;

        const topPosts = await getTopPerformingPosts(
            platform as string | undefined,
            parseInt(limit as string)
        );

        // If no real data, return mock top posts
        if (topPosts.length === 0) {
            const mockPosts = [
                {
                    id: '1',
                    content: '10 AI tools that will save you 10 hours/week (and they\'re all free) 🧵',
                    platform: 'Twitter',
                    likes: 2450,
                    comments: 187,
                    shares: 543,
                    engagementRate: 8.9,
                    postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '2',
                    content: 'I spent 6 months learning to code. Here\'s what I wish I knew on day 1...',
                    platform: 'Reddit',
                    likes: 1876,
                    comments: 234,
                    shares: 89,
                    engagementRate: 7.2,
                    postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: '3',
                    content: 'The secret to building a $100k side project (no VC required)',
                    platform: 'Twitter',
                    likes: 1654,
                    comments: 156,
                    shares: 298,
                    engagementRate: 6.8,
                    postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];

            res.json({
                success: true,
                data: mockPosts,
                count: mockPosts.length,
                isMock: true
            });
            return;
        }

        res.json({
            success: true,
            data: topPosts.map(p => ({
                id: p.postId,
                content: p.content,
                platform: p.platform,
                likes: p.likes,
                comments: p.comments,
                shares: p.shares,
                engagementRate: p.engagementRate,
                postedAt: p.publishedAt
            })),
            count: topPosts.length
        });
    } catch (error) {
        console.error('Top posts error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/dashboard/platform/:platform
 * Get detailed analytics for a specific platform
 */
router.get('/platform/:platform', async (req, res) => {
    try {
        const { platform } = req.params;

        const analytics = await getPlatformAnalytics(platform);

        if (!analytics) {
            res.status(404).json({
                success: false,
                error: 'Platform not found'
            });
            return;
        }

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Platform analytics error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

export default router;
