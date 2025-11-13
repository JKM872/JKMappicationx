import express from 'express';
import {
  generateCaptions,
  generateHashtags,
  suggestPostingTimes,
} from '../services/aiService';

const router = express.Router();

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

export default router;
