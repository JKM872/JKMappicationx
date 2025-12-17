import express from 'express';
import {
  getSavedSearches,
  saveSearch,
  deleteSearch,
  togglePinSearch,
  getMostUsedSearches,
  getPinnedSearches
} from '../services/savedSearchService';

const router = express.Router();

/**
 * GET /api/saved-searches
 * Get all saved searches
 */
router.get('/', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default';
    const searches = getSavedSearches(userId);
    res.json({
      success: true,
      data: searches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/saved-searches
 * Save a new search
 */
router.post('/', (req, res) => {
  try {
    const { query, platform, userId } = req.body;
    
    if (!query) {
      res.status(400).json({
        success: false,
        error: 'Query is required'
      });
      return;
    }
    
    const search = saveSearch(query, platform, userId);
    res.json({
      success: true,
      data: search
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * DELETE /api/saved-searches/:id
 * Delete a saved search
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || 'default';
    const success = deleteSearch(id, userId);
    
    res.json({
      success,
      message: success ? 'Search deleted' : 'Search not found'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * PUT /api/saved-searches/:id/pin
 * Toggle pin status
 */
router.put('/:id/pin', (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || 'default';
    const search = togglePinSearch(id, userId);
    
    if (search) {
      res.json({
        success: true,
        data: search
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Search not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * GET /api/saved-searches/most-used
 * Get most used searches
 */
router.get('/most-used', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default';
    const limit = parseInt(req.query.limit as string) || 5;
    const searches = getMostUsedSearches(userId, limit);
    res.json({
      success: true,
      data: searches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * GET /api/saved-searches/pinned
 * Get pinned searches
 */
router.get('/pinned', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default';
    const searches = getPinnedSearches(userId);
    res.json({
      success: true,
      data: searches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

export default router;

