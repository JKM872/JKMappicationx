import { Router, Request, Response } from 'express';
import {
  publishToTelegraph,
  publishToDpaste,
  publishToRentry,
  publishToPasteRs,
  publishTo0x0,
  publishToHastebin,
  publishToCatbox,
  publishToAllNoAuth,
  getNoAuthPlatforms
} from '../services/noAuthPublishing';

const router = Router();

/**
 * @route   GET /api/publish/platforms
 * @desc    Get all available no-auth platforms
 */
router.get('/platforms', (req: Request, res: Response) => {
  const platforms = getNoAuthPlatforms();
  res.json({
    success: true,
    message: '🆓 Wszystkie te platformy działają BEZ LOGOWANIA!',
    platforms,
    count: platforms.length
  });
});

/**
 * @route   POST /api/publish/telegraph
 * @desc    Publish to Telegraph (Telegram)
 * @body    { content, title?, author? }
 */
router.post('/telegraph', async (req: Request, res: Response) => {
  const { content, title = 'Viral Content', author } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  const result = await publishToTelegraph(title, content, author);
  res.json(result);
});

/**
 * @route   POST /api/publish/dpaste
 * @desc    Publish to Dpaste
 * @body    { content, title? }
 */
router.post('/dpaste', async (req: Request, res: Response) => {
  const { content, title } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  const result = await publishToDpaste(content, title);
  res.json(result);
});

/**
 * @route   POST /api/publish/rentry
 * @desc    Publish to Rentry (Markdown)
 * @body    { content, customUrl? }
 */
router.post('/rentry', async (req: Request, res: Response) => {
  const { content, customUrl } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  const result = await publishToRentry(content, customUrl);
  res.json(result);
});

/**
 * @route   POST /api/publish/paste-rs
 * @desc    Publish to Paste.rs
 * @body    { content }
 */
router.post('/paste-rs', async (req: Request, res: Response) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  const result = await publishToPasteRs(content);
  res.json(result);
});

/**
 * @route   POST /api/publish/hastebin
 * @desc    Publish to Hastebin
 * @body    { content }
 */
router.post('/hastebin', async (req: Request, res: Response) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  const result = await publishToHastebin(content);
  res.json(result);
});

/**
 * @route   POST /api/publish/catbox
 * @desc    Publish to Catbox (file hosting)
 * @body    { content, filename? }
 */
router.post('/catbox', async (req: Request, res: Response) => {
  const { content, filename } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  const result = await publishToCatbox(content, filename);
  res.json(result);
});

/**
 * @route   POST /api/publish/0x0
 * @desc    Publish to 0x0.st (file hosting)
 * @body    { content, filename? }
 */
router.post('/0x0', async (req: Request, res: Response) => {
  const { content, filename } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  const result = await publishTo0x0(content, filename);
  res.json(result);
});

/**
 * @route   POST /api/publish/all
 * @desc    Publish to ALL no-auth platforms at once!
 * @body    { content, title? }
 */
router.post('/all', async (req: Request, res: Response) => {
  const { content, title } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  
  console.log('🚀 Publishing to ALL platforms...');
  const result = await publishToAllNoAuth(content, title);
  
  res.json({
    success: result.successful > 0,
    message: `✅ Opublikowano na ${result.successful}/${result.results.length} platformach!`,
    ...result
  });
});

/**
 * @route   POST /api/publish/:platform
 * @desc    Generic publish to any platform
 * @body    { content, title?, author?, filename?, customUrl? }
 */
router.post('/:platform', async (req: Request, res: Response) => {
  const { platform } = req.params;
  const { content, title, author, filename, customUrl } = req.body;
  
  if (!content) return res.status(400).json({ error: 'Content required' });

  let result;
  
  switch (platform.toLowerCase()) {
    case 'telegraph':
      result = await publishToTelegraph(title || 'Viral Content', content, author);
      break;
    case 'dpaste':
      result = await publishToDpaste(content, title);
      break;
    case 'rentry':
      result = await publishToRentry(content, customUrl);
      break;
    case 'paste-rs':
    case 'pasters':
      result = await publishToPasteRs(content);
      break;
    case 'hastebin':
      result = await publishToHastebin(content);
      break;
    case 'catbox':
      result = await publishToCatbox(content, filename);
      break;
    case '0x0':
      result = await publishTo0x0(content, filename);
      break;
    default:
      return res.status(400).json({ 
        error: `Unknown platform: ${platform}`,
        available: getNoAuthPlatforms().map(p => p.platform)
      });
  }

  res.json(result);
});

export default router;
