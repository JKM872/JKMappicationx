import express from 'express';
import {
    getSettings,
    updateSettings,
    scheduleAutoRepost,
    checkAutoPlug,
    getPlugContent,
    checkAutoDelete,
    cancelAllScheduledTasks,
    getScheduledTasks,
    resetSettings,
} from '../services/automationService';
import {
    getSchedulerStatus,
    startScheduler,
    stopScheduler,
    triggerCheck,
    schedulePost,
    getScheduledPosts
} from '../services/schedulerService';
import {
    getAutoRepostSettings,
    updateAutoRepostSettings,
    setAutoRepostEnabled,
    findRepostCandidates,
    scheduleRepost,
    getScheduledReposts,
    cancelRepost
} from '../services/autoRepostService';
import { PlannedPost } from '../types';

const router = express.Router();

/**
 * GET /api/automation/settings
 * Get current automation settings
 */
router.get('/settings', (req, res) => {
    try {
        const settings = getSettings();
        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/settings
 * Update automation settings
 */
router.post('/settings', (req, res) => {
    try {
        const settings = updateSettings(req.body);
        res.json({
            success: true,
            data: settings,
            message: 'Settings updated successfully',
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/settings/reset
 * Reset settings to defaults
 */
router.post('/settings/reset', (req, res) => {
    try {
        const settings = resetSettings();
        res.json({
            success: true,
            data: settings,
            message: 'Settings reset to defaults',
        });
    } catch (error) {
        console.error('Reset settings error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/repost/:postId
 * Schedule an auto-repost
 */
router.post('/repost/:postId', (req, res) => {
    try {
        const { postId } = req.params;
        const { delayHours } = req.body;

        const result = scheduleAutoRepost(postId, delayHours);

        res.json({
            success: result.success,
            data: {
                postId,
                scheduledFor: result.scheduledFor,
            },
            message: result.message,
        });
    } catch (error) {
        console.error('Schedule repost error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/plug/check
 * Check if a post should receive an auto-plug
 */
router.post('/plug/check', async (req, res) => {
    try {
        const { postId, engagement } = req.body;

        if (!postId || engagement === undefined) {
            res.status(400).json({
                success: false,
                error: 'postId and engagement are required',
            });
            return;
        }

        const result = await checkAutoPlug(postId, engagement);

        res.json({
            success: true,
            data: {
                shouldPlug: result.shouldPlug,
                plugContent: result.shouldPlug ? getPlugContent() : null,
            },
            message: result.message,
        });
    } catch (error) {
        console.error('Check plug error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/delete/check
 * Check which posts should be auto-deleted
 */
router.post('/delete/check', async (req, res) => {
    try {
        const { posts } = req.body;

        if (!Array.isArray(posts)) {
            res.status(400).json({
                success: false,
                error: 'posts array is required',
            });
            return;
        }

        const result = await checkAutoDelete(posts);

        res.json({
            success: true,
            data: {
                toDelete: result.toDelete,
                count: result.toDelete.length,
            },
            message: result.message,
        });
    } catch (error) {
        console.error('Check delete error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * GET /api/automation/tasks
 * Get all scheduled tasks
 */
router.get('/tasks', (req, res) => {
    try {
        const tasks = getScheduledTasks();
        res.json({
            success: true,
            data: tasks,
            count: tasks.length,
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/tasks/cancel
 * Cancel all scheduled tasks
 */
router.post('/tasks/cancel', (req, res) => {
    try {
        cancelAllScheduledTasks();
        res.json({
            success: true,
            message: 'All scheduled tasks cancelled',
        });
    } catch (error) {
        console.error('Cancel tasks error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

// ============================================================================
// SCHEDULER ENDPOINTS
// ============================================================================

/**
 * GET /api/automation/scheduler/status
 * Get scheduler status
 */
router.get('/scheduler/status', (req, res) => {
    try {
        const status = getSchedulerStatus();
        res.json({
            success: true,
            data: status,
        });
    } catch (error) {
        console.error('Scheduler status error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/scheduler/start
 * Start the scheduler
 */
router.post('/scheduler/start', (req, res) => {
    try {
        startScheduler();
        res.json({
            success: true,
            message: 'Scheduler started',
            data: getSchedulerStatus(),
        });
    } catch (error) {
        console.error('Scheduler start error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/scheduler/stop
 * Stop the scheduler
 */
router.post('/scheduler/stop', (req, res) => {
    try {
        stopScheduler();
        res.json({
            success: true,
            message: 'Scheduler stopped',
            data: getSchedulerStatus(),
        });
    } catch (error) {
        console.error('Scheduler stop error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/scheduler/trigger
 * Manually trigger a check for due posts
 */
router.post('/scheduler/trigger', async (req, res) => {
    try {
        const result = await triggerCheck();
        res.json({
            success: true,
            data: result,
            message: `Checked ${result.checked} posts, published ${result.published}`,
        });
    } catch (error) {
        console.error('Scheduler trigger error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/scheduler/schedule
 * Schedule a post for publishing (in-memory, for testing)
 */
router.post('/scheduler/schedule', async (req, res) => {
    try {
        const { content, platform, scheduled_date, hashtags } = req.body;

        if (!content || !scheduled_date) {
            res.status(400).json({
                success: false,
                error: 'content and scheduled_date are required',
            });
            return;
        }

        const post = await schedulePost({
            content,
            platform: platform || 'Twitter',
            scheduledFor: new Date(scheduled_date),
            hashtags: hashtags || [],
        });

        res.json({
            success: true,
            data: post,
            message: `Post scheduled for ${scheduled_date}`,
        });
    } catch (error) {
        console.error('Schedule post error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * GET /api/automation/scheduler/posts
 * Get all scheduled posts (in-memory)
 */
router.get('/scheduler/posts', async (req, res) => {
    try {
        const posts = await getScheduledPosts();
        res.json({
            success: true,
            data: posts,
            count: posts.length,
        });
    } catch (error) {
        console.error('Get scheduled posts error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

// ============================================================================
// AUTO-REPOST WINNERS ENDPOINTS
// ============================================================================

/**
 * GET /api/automation/auto-repost/settings
 * Get auto-repost settings
 */
router.get('/auto-repost/settings', (req, res) => {
    try {
        const settings = getAutoRepostSettings();
        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error('Get auto-repost settings error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/auto-repost/settings
 * Update auto-repost settings
 */
router.post('/auto-repost/settings', (req, res) => {
    try {
        const settings = updateAutoRepostSettings(req.body);
        res.json({
            success: true,
            data: settings,
            message: 'Auto-repost settings updated',
        });
    } catch (error) {
        console.error('Update auto-repost settings error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/auto-repost/toggle
 * Enable or disable auto-repost
 */
router.post('/auto-repost/toggle', (req, res) => {
    try {
        const { enabled } = req.body;
        const settings = setAutoRepostEnabled(enabled);
        res.json({
            success: true,
            data: settings,
            message: `Auto-repost ${enabled ? 'enabled' : 'disabled'}`,
        });
    } catch (error) {
        console.error('Toggle auto-repost error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * GET /api/automation/auto-repost/candidates
 * Get top-performing posts for reposting
 */
router.get('/auto-repost/candidates', async (req, res) => {
    try {
        const { limit = '10' } = req.query;
        const candidates = await findRepostCandidates(parseInt(limit as string));
        res.json({
            success: true,
            data: candidates,
            count: candidates.length,
        });
    } catch (error) {
        console.error('Get repost candidates error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/automation/auto-repost/schedule
 * Schedule a specific post for reposting
 */
router.post('/auto-repost/schedule', (req, res) => {
    try {
        const { candidate, scheduledFor } = req.body;

        if (!candidate || !scheduledFor) {
            res.status(400).json({
                success: false,
                error: 'candidate and scheduledFor are required',
            });
            return;
        }

        const repost = scheduleRepost(candidate, new Date(scheduledFor));
        res.json({
            success: true,
            data: repost,
            message: 'Repost scheduled successfully',
        });
    } catch (error) {
        console.error('Schedule repost error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * GET /api/automation/auto-repost/scheduled
 * Get all scheduled reposts
 */
router.get('/auto-repost/scheduled', (req, res) => {
    try {
        const reposts = getScheduledReposts();
        res.json({
            success: true,
            data: reposts,
            count: reposts.length,
        });
    } catch (error) {
        console.error('Get scheduled reposts error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * DELETE /api/automation/auto-repost/:id
 * Cancel a scheduled repost
 */
router.delete('/auto-repost/:id', (req, res) => {
    try {
        const { id } = req.params;
        const cancelled = cancelRepost(id);
        res.json({
            success: cancelled,
            message: cancelled ? 'Repost cancelled' : 'Repost not found or already posted',
        });
    } catch (error) {
        console.error('Cancel repost error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

export default router;

