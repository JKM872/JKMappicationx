import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { PlannedPost } from '../types';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Create a new planned post
 */
export async function createPlannedPost(req: Request, res: Response) {
  try {
    const { 
      content, 
      platform = 'all', 
      scheduled_date, 
      status = 'draft',
      original_post_id,
      original_content,
      hashtags,
      user_id 
    } = req.body;

    if (!content) {
      return res.status(400).json({ 
        error: 'Content is required',
        code: 'MISSING_CONTENT'
      });
    }

    // Validate platform
    const validPlatforms = ['Twitter', 'Reddit', 'Dev.to', 'Threads', 'all'];
    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ 
        error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
        code: 'INVALID_PLATFORM'
      });
    }

    // Validate status
    const validStatuses = ['draft', 'scheduled', 'published'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        code: 'INVALID_STATUS'
      });
    }

    // If scheduling, require scheduled_date
    if (status === 'scheduled' && !scheduled_date) {
      return res.status(400).json({ 
        error: 'Scheduled date is required when status is "scheduled"',
        code: 'MISSING_SCHEDULED_DATE'
      });
    }

    if (!supabase) {
      // Fallback to in-memory storage for development
      const newPost: PlannedPost = {
        id: `local-${Date.now()}`,
        content,
        platform,
        scheduled_date,
        status,
        original_post_id,
        original_content,
        hashtags,
        user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📝 Created planned post (local):', newPost.id);
      return res.status(201).json({
        success: true,
        post: newPost,
        message: 'Post created successfully (local storage)'
      });
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('planned_posts')
      .insert({
        content,
        platform,
        scheduled_date: scheduled_date || null,
        status,
        original_post_id: original_post_id || null,
        original_content: original_content || null,
        hashtags: hashtags || [],
        user_id: user_id || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to create planned post',
        details: error.message,
        code: 'DATABASE_ERROR'
      });
    }

    console.log('📝 Created planned post:', data.id);
    return res.status(201).json({
      success: true,
      post: data,
      message: 'Post created successfully'
    });

  } catch (error) {
    console.error('❌ Create planned post error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Get all planned posts with optional filters
 */
export async function getPlannedPosts(req: Request, res: Response) {
  try {
    const { 
      status, 
      platform, 
      user_id,
      limit = 50,
      offset = 0,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    if (!supabase) {
      // Return empty for development without Supabase
      return res.json({
        success: true,
        posts: [],
        total: 0,
        message: 'No Supabase connection - returning empty results'
      });
    }

    let query = supabase
      .from('planned_posts')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (platform && platform !== 'all') {
      query = query.eq('platform', platform);
    }
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'scheduled_date', 'status'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by as string : 'created_at';
    const ascending = sort_order === 'asc';
    
    query = query.order(sortField, { ascending });

    // Apply pagination
    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch planned posts',
        details: error.message,
        code: 'DATABASE_ERROR'
      });
    }

    return res.json({
      success: true,
      posts: data || [],
      total: count || 0,
      limit: Number(limit),
      offset: Number(offset)
    });

  } catch (error) {
    console.error('❌ Get planned posts error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Get a single planned post by ID
 */
export async function getPlannedPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: 'Post ID is required',
        code: 'MISSING_ID'
      });
    }

    if (!supabase) {
      return res.status(404).json({ 
        error: 'Post not found (no database connection)',
        code: 'NOT_FOUND'
      });
    }

    const { data, error } = await supabase
      .from('planned_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ 
        error: 'Post not found',
        code: 'NOT_FOUND'
      });
    }

    return res.json({
      success: true,
      post: data
    });

  } catch (error) {
    console.error('❌ Get planned post error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Update a planned post
 */
export async function updatePlannedPost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ 
        error: 'Post ID is required',
        code: 'MISSING_ID'
      });
    }

    // Validate platform if provided
    if (updates.platform) {
      const validPlatforms = ['Twitter', 'Reddit', 'Dev.to', 'Threads', 'all'];
      if (!validPlatforms.includes(updates.platform)) {
        return res.status(400).json({ 
          error: `Invalid platform. Must be one of: ${validPlatforms.join(', ')}`,
          code: 'INVALID_PLATFORM'
        });
      }
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['draft', 'scheduled', 'published'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({ 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        });
      }

      // If scheduling, require scheduled_date
      if (updates.status === 'scheduled' && !updates.scheduled_date) {
        return res.status(400).json({ 
          error: 'Scheduled date is required when status is "scheduled"',
          code: 'MISSING_SCHEDULED_DATE'
        });
      }
    }

    if (!supabase) {
      return res.json({
        success: true,
        post: { id, ...updates, updated_at: new Date().toISOString() },
        message: 'Post updated (local - no database)'
      });
    }

    // Remove fields that shouldn't be updated
    const { id: _, created_at, ...safeUpdates } = updates;

    const { data, error } = await supabase
      .from('planned_posts')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to update planned post',
        details: error.message,
        code: 'DATABASE_ERROR'
      });
    }

    if (!data) {
      return res.status(404).json({ 
        error: 'Post not found',
        code: 'NOT_FOUND'
      });
    }

    console.log('✏️ Updated planned post:', id);
    return res.json({
      success: true,
      post: data,
      message: 'Post updated successfully'
    });

  } catch (error) {
    console.error('❌ Update planned post error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Delete a planned post
 */
export async function deletePlannedPost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        error: 'Post ID is required',
        code: 'MISSING_ID'
      });
    }

    if (!supabase) {
      return res.json({
        success: true,
        message: 'Post deleted (local - no database)'
      });
    }

    const { error } = await supabase
      .from('planned_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to delete planned post',
        details: error.message,
        code: 'DATABASE_ERROR'
      });
    }

    console.log('🗑️ Deleted planned post:', id);
    return res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete planned post error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Get upcoming scheduled posts
 */
export async function getUpcomingPosts(req: Request, res: Response) {
  try {
    const { limit = 10, user_id } = req.query;

    if (!supabase) {
      return res.json({
        success: true,
        posts: [],
        message: 'No Supabase connection'
      });
    }

    let query = supabase
      .from('planned_posts')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(Number(limit));

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch upcoming posts',
        code: 'DATABASE_ERROR'
      });
    }

    return res.json({
      success: true,
      posts: data || []
    });

  } catch (error) {
    console.error('❌ Get upcoming posts error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Get posts statistics
 */
export async function getPostsStats(req: Request, res: Response) {
  try {
    const { user_id } = req.query;

    if (!supabase) {
      return res.json({
        success: true,
        stats: {
          total: 0,
          draft: 0,
          scheduled: 0,
          published: 0,
          by_platform: {}
        }
      });
    }

    let baseQuery = supabase.from('planned_posts').select('status, platform');
    
    if (user_id) {
      baseQuery = baseQuery.eq('user_id', user_id);
    }

    const { data, error } = await baseQuery;

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch stats',
        code: 'DATABASE_ERROR'
      });
    }

    const stats = {
      total: data?.length || 0,
      draft: data?.filter(p => p.status === 'draft').length || 0,
      scheduled: data?.filter(p => p.status === 'scheduled').length || 0,
      published: data?.filter(p => p.status === 'published').length || 0,
      by_platform: {} as Record<string, number>
    };

    // Count by platform
    data?.forEach(p => {
      stats.by_platform[p.platform] = (stats.by_platform[p.platform] || 0) + 1;
    });

    return res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Get stats error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}
