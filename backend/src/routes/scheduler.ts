/**
 * 📅 Scheduler Routes
 * API endpoints for content scheduling management
 */

import express from 'express';
import { getScheduledPosts, schedulePost, cancelScheduledPost, reschedulePost } from '../services/schedulerService';

const router = express.Router();

/**
 * GET /api/scheduler/queue
 * Get all scheduled posts
 */
router.get('/queue', async (req, res) => {
    try {
        const { status = 'pending', limit = '50' } = req.query;

        const posts = await getScheduledPosts(
            status as string,
            parseInt(limit as string)
        );

        res.json({
            success: true,
            data: posts,
            count: posts.length
        });
    } catch (error) {
        console.error('Get queue error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * POST /api/scheduler/schedule
 * Schedule a new post
 */
router.post('/schedule', async (req, res) => {
    try {
        const { content, platform, scheduledFor, hashtags } = req.body;

        if (!content || !platform || !scheduledFor) {
            res.status(400).json({
                success: false,
                error: 'content, platform, and scheduledFor are required'
            });
            return;
        }

        const post = await schedulePost({
            content,
            platform,
            scheduledFor: new Date(scheduledFor),
            hashtags
        });

        res.json({
            success: true,
            data: post,
            message: 'Post scheduled successfully'
        });
    } catch (error) {
        console.error('Schedule post error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * DELETE /api/scheduler/:id
 * Cancel a scheduled post
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const success = await cancelScheduledPost(id);

        if (!success) {
            res.status(404).json({
                success: false,
                error: 'Scheduled post not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Post cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel post error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * PUT /api/scheduler/:id/reschedule
 * Reschedule a post to a new time
 */
router.put('/:id/reschedule', async (req, res) => {
    try {
        const { id } = req.params;
        const { newTime } = req.body;

        if (!newTime) {
            res.status(400).json({
                success: false,
                error: 'newTime is required'
            });
            return;
        }

        const post = await reschedulePost(id, new Date(newTime));

        if (!post) {
            res.status(404).json({
                success: false,
                error: 'Scheduled post not found'
            });
            return;
        }

        res.json({
            success: true,
            data: post,
            message: 'Post rescheduled successfully'
        });
    } catch (error) {
        console.error('Reschedule post error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/scheduler/stats
 * Get scheduler statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const pendingPosts = await getScheduledPosts('pending', 100);
        const postedPosts = await getScheduledPosts('posted', 100);
        const failedPosts = await getScheduledPosts('failed', 100);

        res.json({
            success: true,
            data: {
                pending: pendingPosts.length,
                posted: postedPosts.length,
                failed: failedPosts.length,
                total: pendingPosts.length + postedPosts.length + failedPosts.length
            }
        });
    } catch (error) {
        console.error('Scheduler stats error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

export default router;
