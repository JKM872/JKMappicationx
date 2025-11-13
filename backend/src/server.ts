import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import searchRoutes from './routes/search';
import aiRoutes from './routes/ai';
import metricsRoutes from './routes/metrics';

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

// Middleware
app.use(cors());
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

// Welcome message
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Viral Content Hunter API',
    version: '1.0.0',
    endpoints: {
      search: 'GET /api/search?query={keyword}&limit={n}',
      generateCaptions: 'POST /api/generate-captions',
      generateHashtags: 'POST /api/generate-hashtags',
      suggestTimes: 'POST /api/suggest-times',
      metricsHistory: 'GET /api/metrics/history?post_id={id}',
      metricsGrowth: 'GET /api/metrics/growth?post_id={id}',
      metricsTop: 'GET /api/metrics/top?hours={n}&limit={n}',
      health: 'GET /health',
    },
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
  console.log(`   - GET  /api/metrics/history`);
  console.log('');
  console.log('   Press Ctrl+C to stop');
  console.log('========================================');
  console.log('');
});

// Graceful shutdown for Heroku
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;
