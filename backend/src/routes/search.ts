import express from 'express';
import { getViralPosts } from '../controllers/searchController';

const router = express.Router();

/**
 * GET /api/search
 * Find viral posts in a niche
 * 
 * Query params:
 *   - query: Search keyword/hashtag (required)
 *   - limit: Max results (default: 20, max: 100)
 * 
 * Example: /api/search?query=javascript&limit=30
 */
router.get('/search', getViralPosts);

export default router;
