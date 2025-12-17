import express from 'express';
import {
    getCompetitors,
    getCompetitorById,
    addCompetitor,
    removeCompetitor,
    analyzeCompetitor,
    compareCompetitors
} from '../services/competitorService';

const router = express.Router();

/**
 * GET /api/competitors
 * Get all tracked competitors
 */
router.get('/', async (req, res) => {
    try {
        const competitors = await getCompetitors();
        res.json({
            success: true,
            data: competitors,
            count: competitors.length
        });
    } catch (error) {
        console.error('Get competitors error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/competitors/:id
 * Get competitor by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const competitor = await getCompetitorById(req.params.id);
        if (!competitor) {
            res.status(404).json({
                success: false,
                error: 'Competitor not found'
            });
            return;
        }
        res.json({
            success: true,
            data: competitor
        });
    } catch (error) {
        console.error('Get competitor error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * POST /api/competitors
 * Add a new competitor to track
 */
router.post('/', async (req, res) => {
    try {
        const { handle, platform } = req.body;

        if (!handle || !platform) {
            res.status(400).json({
                success: false,
                error: 'Handle and platform are required'
            });
            return;
        }

        const competitor = await addCompetitor(handle, platform);
        res.json({
            success: true,
            data: competitor,
            message: `Now tracking ${handle}`
        });
    } catch (error) {
        console.error('Add competitor error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * DELETE /api/competitors/:id
 * Remove a competitor
 */
router.delete('/:id', async (req, res) => {
    try {
        const success = await removeCompetitor(req.params.id);
        if (!success) {
            res.status(404).json({
                success: false,
                error: 'Competitor not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Competitor removed'
        });
    } catch (error) {
        console.error('Remove competitor error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * GET /api/competitors/:id/analyze
 * Analyze a competitor's strategy
 */
router.get('/:id/analyze', async (req, res) => {
    try {
        const analysis = await analyzeCompetitor(req.params.id);
        if (!analysis) {
            res.status(404).json({
                success: false,
                error: 'Competitor not found'
            });
            return;
        }
        res.json({
            success: true,
            data: analysis
        });
    } catch (error) {
        console.error('Analyze competitor error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

/**
 * POST /api/competitors/compare
 * Compare multiple competitors
 */
router.post('/compare', async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length < 2) {
            res.status(400).json({
                success: false,
                error: 'At least 2 competitor IDs are required'
            });
            return;
        }

        const comparison = await compareCompetitors(ids);
        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        console.error('Compare competitors error:', error);
        res.status(500).json({
            success: false,
            error: (error as Error).message
        });
    }
});

export default router;
