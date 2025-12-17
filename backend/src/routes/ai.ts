import express from 'express';
import {
  generateCaptions,
  generateHashtags,
  suggestPostingTimes,
  remixContent,
  quickRewrite,
  translateContent,
  improveGrammar,
} from '../services/aiService';

const router = express.Router();

/**
 * POST /api/ai/quick-rewrite
 * Quick rewrite content with different styles
 * 
 * Body:
 *   - content: Original content (required)
 *   - style: Style preference (bold, smart, funny, professional, casual, or 'all')
 *   - count: Number of variations (optional, default: 5)
 */
router.post('/quick-rewrite', async (req, res) => {
  try {
    const { content, style = 'all', count = 5 } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Content is required and must be a string',
      });
      return;
    }

    const validStyles = ['bold', 'smart', 'funny', 'professional', 'casual', 'all'];
    if (!validStyles.includes(style)) {
      res.status(400).json({
        success: false,
        error: `Invalid style. Must be one of: ${validStyles.join(', ')}`,
      });
      return;
    }

    console.log(`✨ Quick rewriting content with style: ${style}`);

    const variations = await quickRewrite(content, style, Math.min(count, 10));

    res.json({
      success: true,
      data: variations,
    });
  } catch (error) {
    console.error('Quick rewrite error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/ai/translate
 * Translate content to target language
 * 
 * Body:
 *   - content: Content to translate (required)
 *   - sourceLanguage: Optional source language (auto-detected if not provided)
 *   - targetLanguage: Target language (default: English)
 */
router.post('/translate', async (req, res) => {
  try {
    const { content, sourceLanguage, targetLanguage = 'English' } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Content is required and must be a string',
      });
      return;
    }

    console.log(`🌍 Translating content to ${targetLanguage}...`);

    const result = await translateContent(content, sourceLanguage, targetLanguage);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Translate error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/ai/grammar
 * Improve grammar and spelling
 * 
 * Body:
 *   - content: Content to improve (required)
 */
router.post('/grammar', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Content is required and must be a string',
      });
      return;
    }

    console.log(`📝 Improving grammar...`);

    const result = await improveGrammar(content);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Grammar error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});


/**
 * POST /api/generate-captions
 * Generate caption variations using Google AI
 * 
 * Body:
 *   - topic: Content topic (required)
 *   - tone: Desired tone (optional, default: "engaging")
 */
router.post('/generate-captions', async (req, res) => {
  try {
    const { topic, tone = 'engaging' } = req.body;

    if (!topic || typeof topic !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Topic is required and must be a string',
      });
      return;
    }

    console.log(`🤖 Generating captions for: "${topic}" (tone: ${tone})`);

    const captions = await generateCaptions(topic, tone);

    res.json({
      success: true,
      data: captions,
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/generate-hashtags
 * Generate relevant hashtags
 * 
 * Body:
 *   - topic: Content topic (required)
 *   - count: Number of hashtags (optional, default: 10)
 */
router.post('/generate-hashtags', async (req, res) => {
  try {
    const { topic, count = 10 } = req.body;

    if (!topic || typeof topic !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Topic is required and must be a string',
      });
      return;
    }

    const countNum = parseInt(count);
    if (isNaN(countNum) || countNum < 1 || countNum > 50) {
      res.status(400).json({
        success: false,
        error: 'Count must be between 1 and 50',
      });
      return;
    }

    console.log(`🏷️ Generating ${countNum} hashtags for: "${topic}"`);

    const hashtags = await generateHashtags(topic, countNum);

    res.json({
      success: true,
      data: hashtags,
    });
  } catch (error) {
    console.error('Hashtag generation error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/suggest-times
 * Suggest optimal posting times
 * 
 * Body:
 *   - timezone: User timezone (optional, default: "UTC")
 */
router.post('/suggest-times', async (req, res) => {
  try {
    const { timezone = 'UTC' } = req.body;

    console.log(`⏰ Suggesting posting times for timezone: ${timezone}`);

    const times = await suggestPostingTimes(timezone);

    res.json({
      success: true,
      data: times,
    });
  } catch (error) {
    console.error('Time suggestion error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * POST /api/remix
 * Remix/adapt content for a specific platform
 * 
 * Body:
 *   - content: Original content to remix (required)
 *   - platform: Target platform (Twitter, Reddit, Dev.to, Threads, all)
 *   - tone: Desired tone (optional, default: "engaging")
 */
router.post('/remix', async (req, res) => {
  try {
    const { content, platform = 'all', tone = 'engaging' } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Content is required and must be a string',
      });
      return;
    }

    const validPlatforms = ['Twitter', 'Reddit', 'Dev.to', 'Threads', 'all'];
    if (!validPlatforms.includes(platform)) {
      res.status(400).json({
        success: false,
        error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
      });
      return;
    }

    console.log(`🔄 Remixing content for platform: ${platform} (tone: ${tone})`);

    const remixed = await remixContent(content, platform, tone);

    res.json({
      success: true,
      data: remixed,
    });
  } catch (error) {
    console.error('Remix error:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

export default router;
