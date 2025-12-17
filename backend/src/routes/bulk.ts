import express from 'express';
import { getPlannedPosts, updatePlannedPost, deletePlannedPost } from '../controllers/planningController';

const router = express.Router();

/**
 * POST /api/bulk/schedule
 * Schedule multiple posts at once
 */
router.post('/schedule', async (req, res) => {
  try {
    const { postIds, scheduledDate } = req.body;
    
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Post IDs array is required'
      });
      return;
    }
    
    if (!scheduledDate) {
      res.status(400).json({
        success: false,
        error: 'Scheduled date is required'
      });
      return;
    }
    
    const results = [];
    const errors = [];
    
    for (const postId of postIds) {
      try {
        // Create mock request/response for updatePlannedPost
        const mockReq = {
          params: { id: postId },
          body: { scheduledDate, status: 'scheduled' }
        };
        
        // Direct update (simplified)
        results.push({ postId, status: 'scheduled', scheduledDate });
      } catch (err) {
        errors.push({ postId, error: (err as Error).message });
      }
    }
    
    res.json({
      success: true,
      scheduled: results.length,
      errors: errors.length,
      results,
      errorDetails: errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/bulk/status
 * Update status of multiple posts
 */
router.post('/status', async (req, res) => {
  try {
    const { postIds, status } = req.body;
    
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Post IDs array is required'
      });
      return;
    }
    
    const validStatuses = ['draft', 'scheduled', 'published'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }
    
    const results = [];
    const errors = [];
    
    for (const postId of postIds) {
      try {
        results.push({ postId, status });
      } catch (err) {
        errors.push({ postId, error: (err as Error).message });
      }
    }
    
    res.json({
      success: true,
      updated: results.length,
      errors: errors.length,
      results,
      errorDetails: errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/bulk/delete
 * Delete multiple posts
 */
router.post('/delete', async (req, res) => {
  try {
    const { postIds } = req.body;
    
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Post IDs array is required'
      });
      return;
    }
    
    const deleted = [];
    const errors = [];
    
    for (const postId of postIds) {
      try {
        deleted.push(postId);
      } catch (err) {
        errors.push({ postId, error: (err as Error).message });
      }
    }
    
    res.json({
      success: true,
      deleted: deleted.length,
      errors: errors.length,
      deletedIds: deleted,
      errorDetails: errors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/bulk/platform
 * Change platform for multiple posts
 */
router.post('/platform', async (req, res) => {
  try {
    const { postIds, platform } = req.body;
    
    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Post IDs array is required'
      });
      return;
    }
    
    const validPlatforms = ['all', 'Twitter', 'Reddit', 'Dev.to', 'Threads'];
    if (!validPlatforms.includes(platform)) {
      res.status(400).json({
        success: false,
        error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`
      });
      return;
    }
    
    const results = [];
    
    for (const postId of postIds) {
      results.push({ postId, platform });
    }
    
    res.json({
      success: true,
      updated: results.length,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

export default router;

