import express from 'express';
import {
  exportToJson,
  exportToCsv,
  importFromJson,
  importFromCsv
} from '../services/exportService';

const router = express.Router();

/**
 * POST /api/export
 * Export posts to JSON or CSV
 */
router.post('/', (req, res) => {
  try {
    const { posts, format = 'json', includeMetadata = true } = req.body;
    
    if (!posts || !Array.isArray(posts)) {
      res.status(400).json({
        success: false,
        error: 'Posts array is required'
      });
      return;
    }
    
    const options = { format, includeMetadata };
    
    let content: string;
    let contentType: string;
    let filename: string;
    
    if (format === 'csv') {
      content = exportToCsv(posts, options);
      contentType = 'text/csv';
      filename = `viral-content-export-${Date.now()}.csv`;
    } else {
      content = exportToJson(posts, options);
      contentType = 'application/json';
      filename = `viral-content-export-${Date.now()}.json`;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/export/preview
 * Preview export without downloading
 */
router.post('/preview', (req, res) => {
  try {
    const { posts, format = 'json', includeMetadata = true } = req.body;
    
    if (!posts || !Array.isArray(posts)) {
      res.status(400).json({
        success: false,
        error: 'Posts array is required'
      });
      return;
    }
    
    const options = { format, includeMetadata };
    const limitedPosts = posts.slice(0, 5); // Preview only first 5
    
    let content: string;
    if (format === 'csv') {
      content = exportToCsv(limitedPosts, options);
    } else {
      content = exportToJson(limitedPosts, options);
    }
    
    res.json({
      success: true,
      preview: content,
      totalPosts: posts.length,
      previewCount: limitedPosts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/import
 * Import posts from JSON or CSV
 */
router.post('/import', (req, res) => {
  try {
    const { content, format = 'json' } = req.body;
    
    if (!content) {
      res.status(400).json({
        success: false,
        error: 'Content is required'
      });
      return;
    }
    
    let posts: any[];
    if (format === 'csv') {
      posts = importFromCsv(content);
    } else {
      posts = importFromJson(content);
    }
    
    res.json({
      success: true,
      data: posts,
      importedCount: posts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

export default router;

