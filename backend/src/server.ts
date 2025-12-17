import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import searchRoutes from './routes/search';
import aiRoutes from './routes/ai';
import metricsRoutes from './routes/metrics';
import planningRoutes from './routes/planning';
import trendingRoutes from './routes/trending';
import savedSearchRoutes from './routes/savedSearches';
import exportRoutes from './routes/export';
import templateRoutes from './routes/templates';
import bulkRoutes from './routes/bulk';
import simulatorRoutes from './routes/simulator';
import automationRoutes from './routes/automation';
import growthAnalyticsRoutes from './routes/growthAnalytics';
import competitorsRoutes from './routes/competitors';
import dashboardRoutes from './routes/dashboard';
import schedulerRoutes from './routes/scheduler';

// Import services
import { startScheduler, stopScheduler } from './services/schedulerService';

// Import middleware
import {
  apiLimiter,
  aiLimiter,
  errorHandler,
  notFoundHandler,
  requestLogger,
} from './middleware';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Heroku
app.set('trust proxy', 1);

// Middleware - CORS for Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://frontend-ggpkj15fb-jkmb2business-9450s-projects.vercel.app',
    /\.vercel\.app$/,  // Allow all Vercel domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes with rate limiting
app.use('/api', apiLimiter, searchRoutes);
app.use('/api', aiLimiter, aiRoutes);
app.use('/api/metrics', apiLimiter, metricsRoutes);
app.use('/api/plan', apiLimiter, planningRoutes);
app.use('/api/trending', apiLimiter, trendingRoutes);
app.use('/api/saved-searches', apiLimiter, savedSearchRoutes);
app.use('/api/export', apiLimiter, exportRoutes);
app.use('/api/templates', apiLimiter, templateRoutes);
app.use('/api/bulk', apiLimiter, bulkRoutes);
app.use('/api/simulator', aiLimiter, simulatorRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/automation', apiLimiter, automationRoutes);
app.use('/api/analytics', apiLimiter, growthAnalyticsRoutes);
app.use('/api/competitors', apiLimiter, competitorsRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/scheduler', apiLimiter, schedulerRoutes);

// Welcome message
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Viral Content Hunter API',
    version: '2.0.0',
    endpoints: {
      search: 'GET /api/search?query={keyword}&limit={n}',
      generateCaptions: 'POST /api/generate-captions',
      generateHashtags: 'POST /api/generate-hashtags',
      suggestTimes: 'POST /api/suggest-times',
      remix: 'POST /api/remix',
      planCreate: 'POST /api/plan/create',
      planList: 'GET /api/plan/list',
      planUpcoming: 'GET /api/plan/upcoming',
      planUpdate: 'PUT /api/plan/:id',
      planDelete: 'DELETE /api/plan/:id',
      trending: 'GET /api/trending',
      trendingByCategory: 'GET /api/trending/:category',
      savedSearches: 'GET /api/saved-searches',
      saveSearch: 'POST /api/saved-searches',
      exportPosts: 'POST /api/export',
      importPosts: 'POST /api/export/import',
      templates: 'GET /api/templates',
      createTemplate: 'POST /api/templates',
      fillTemplate: 'POST /api/templates/:id/fill',
      bulkSchedule: 'POST /api/bulk/schedule',
      bulkDelete: 'POST /api/bulk/delete',
      metricsHistory: 'GET /api/metrics/history?post_id={id}',
      metricsGrowth: 'GET /api/metrics/growth?post_id={id}',
      metricsTop: 'GET /api/metrics/top?hours={n}&limit={n}',
      simulatorAnalyze: 'POST /api/simulator/analyze',
      simulatorCompare: 'POST /api/simulator/compare',
      simulatorInsights: 'POST /api/simulator/insights',
      quickRewrite: 'POST /api/ai/quick-rewrite',
      authorGrowth: 'GET /api/analytics/author-growth?author={handle}&platform={name}',
      topGrowingAuthors: 'GET /api/analytics/author-growth/top',
      undervaluedPosts: 'GET /api/analytics/undervalued',
      viralityPredict: 'POST /api/analytics/virality/predict',
      topViralCandidates: 'GET /api/analytics/virality/top',
      health: 'GET /health',
    },
    platforms: ['Twitter/X', 'Reddit', 'Dev.to', 'Threads'],
    docs: 'https://github.com/yourusername/viral-content-hunter',
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('   Viral Content Hunter API');
  console.log('   ========================================');
  console.log(`   Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('   ========================================');
  console.log('');
  console.log('   Available endpoints:');
  console.log(`   - GET  /health`);
  console.log(`   - GET  /api/search`);
  console.log(`   - POST /api/generate-captions`);
  console.log(`   - POST /api/generate-hashtags`);
  console.log(`   - POST /api/remix`);
  console.log(`   - POST /api/plan/create`);
  console.log(`   - GET  /api/plan/list`);
  console.log(`   - GET  /api/metrics/history`);
  console.log('');
  console.log('   Press Ctrl+C to stop');
  console.log('========================================');
  console.log('');

  // Start the post scheduler
  startScheduler();
});

// Graceful shutdown for Heroku
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  stopScheduler();
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;
