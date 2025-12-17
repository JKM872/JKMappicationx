import { Router } from 'express';
import {
  createPlannedPost,
  getPlannedPosts,
  getPlannedPostById,
  updatePlannedPost,
  deletePlannedPost,
  getUpcomingPosts,
  getPostsStats
} from '../controllers/planningController';

const router = Router();

/**
 * @route   POST /api/plan/create
 * @desc    Create a new planned post
 * @body    { content, platform?, scheduled_date?, status?, original_post_id?, original_content?, hashtags?, user_id? }
 */
router.post('/create', createPlannedPost);

/**
 * @route   GET /api/plan/list
 * @desc    Get all planned posts with optional filters
 * @query   status, platform, user_id, limit, offset, sort_by, sort_order
 */
router.get('/list', getPlannedPosts);

/**
 * @route   GET /api/plan/upcoming
 * @desc    Get upcoming scheduled posts
 * @query   limit, user_id
 */
router.get('/upcoming', getUpcomingPosts);

/**
 * @route   GET /api/plan/stats
 * @desc    Get posts statistics
 * @query   user_id
 */
router.get('/stats', getPostsStats);

/**
 * @route   GET /api/plan/:id
 * @desc    Get a single planned post by ID
 */
router.get('/:id', getPlannedPostById);

/**
 * @route   PUT /api/plan/:id
 * @desc    Update a planned post
 * @body    { content?, platform?, scheduled_date?, status?, hashtags? }
 */
router.put('/:id', updatePlannedPost);

/**
 * @route   DELETE /api/plan/:id
 * @desc    Delete a planned post
 */
router.delete('/:id', deletePlannedPost);

export default router;
