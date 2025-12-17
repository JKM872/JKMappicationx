import express from 'express';
import {
  getTemplates,
  getTemplatesByPlatform,
  getTemplatesByCategory,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  fillTemplate,
  getCategories
} from '../services/templateService';

const router = express.Router();

/**
 * GET /api/templates
 * Get all templates
 */
router.get('/', (req, res) => {
  try {
    const userId = (req.query.userId as string) || 'default';
    const platform = req.query.platform as string;
    const category = req.query.category as string;
    
    let templates;
    if (platform) {
      templates = getTemplatesByPlatform(platform as any, userId);
    } else if (category) {
      templates = getTemplatesByCategory(category, userId);
    } else {
      templates = getTemplates(userId);
    }
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * GET /api/templates/categories
 * Get all template categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/templates
 * Create a new custom template
 */
router.post('/', (req, res) => {
  try {
    const { name, description, platform, content, variables, hashtags, category, userId } = req.body;
    
    if (!name || !content) {
      res.status(400).json({
        success: false,
        error: 'Name and content are required'
      });
      return;
    }
    
    const template = createTemplate({
      name,
      description: description || '',
      platform: platform || 'all',
      content,
      variables: variables || [],
      hashtags: hashtags || [],
      category: category || 'other'
    }, userId);
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * PUT /api/templates/:id
 * Update a custom template
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || 'default';
    
    const template = updateTemplate(id, req.body, userId);
    
    if (template) {
      res.json({
        success: true,
        data: template
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Template not found or is a built-in template'
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
 * DELETE /api/templates/:id
 * Delete a custom template
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || 'default';
    
    const success = deleteTemplate(id, userId);
    
    res.json({
      success,
      message: success ? 'Template deleted' : 'Template not found or is a built-in template'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * POST /api/templates/:id/fill
 * Fill template with values
 */
router.post('/:id/fill', (req, res) => {
  try {
    const { id } = req.params;
    const { values, userId } = req.body;
    
    if (!values || typeof values !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Values object is required'
      });
      return;
    }
    
    const content = fillTemplate(id, values, userId);
    
    if (content) {
      res.json({
        success: true,
        data: { content }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

export default router;

