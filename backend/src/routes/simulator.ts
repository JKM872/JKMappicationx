import express from 'express';
import {
    analyzePost,
    compareVariants,
    getAlgorithmInsights,
} from '../services/simulatorService';

const router = express.Router();

/**
 * POST /api/simulator/analyze
 * Analyze a post and predict engagement
 */
router.post('/analyze', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || typeof content !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Content is required and must be a string',
            });
            return;
        }

        if (content.length > 1000) {
            res.status(400).json({
                success: false,
                error: 'Content must be 1000 characters or less',
            });
            return;
        }

        console.log(`🎯 Analyzing post: "${content.substring(0, 50)}..."`);

        const prediction = await analyzePost(content);

        res.json({
            success: true,
            data: prediction,
        });
    } catch (error) {
        console.error('Simulator analyze error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/simulator/compare
 * Compare two post variants
 */
router.post('/compare', async (req, res) => {
    try {
        const { variantA, variantB } = req.body;

        if (!variantA || typeof variantA !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Variant A is required and must be a string',
            });
            return;
        }

        if (!variantB || typeof variantB !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Variant B is required and must be a string',
            });
            return;
        }

        console.log(`🔄 Comparing variants A/B`);

        const comparison = await compareVariants(variantA, variantB);

        res.json({
            success: true,
            data: comparison,
        });
    } catch (error) {
        console.error('Simulator compare error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

/**
 * POST /api/simulator/insights
 * Get detailed algorithm insights
 */
router.post('/insights', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || typeof content !== 'string') {
            res.status(400).json({
                success: false,
                error: 'Content is required and must be a string',
            });
            return;
        }

        console.log(`💡 Getting algorithm insights`);

        const insights = await getAlgorithmInsights(content);

        res.json({
            success: true,
            data: insights,
        });
    } catch (error) {
        console.error('Simulator insights error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message,
        });
    }
});

export default router;
