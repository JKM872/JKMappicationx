import { UnifiedPost } from './unifiedScraper';

export interface ExportOptions {
  format: 'json' | 'csv';
  includeMetadata?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Export posts to JSON format
 */
export function exportToJson(posts: any[], options: ExportOptions): string {
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalPosts: posts.length,
    options: options,
    posts: posts.map(post => ({
      id: post.id,
      platform: post.platform,
      title: post.title,
      content: post.content,
      author: post.author,
      url: post.url,
      likes: post.likes,
      comments: post.comments,
      timestamp: post.timestamp,
      ...(options.includeMetadata && {
        score: post.score,
        subreddit: post.subreddit,
        image: post.image
      })
    }))
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Export posts to CSV format
 */
export function exportToCsv(posts: any[], options: ExportOptions): string {
  const headers = [
    'id', 'platform', 'title', 'content', 'author', 'url',
    'likes', 'comments', 'timestamp'
  ];
  
  if (options.includeMetadata) {
    headers.push('score', 'subreddit', 'image');
  }
  
  const rows = [headers.join(',')];
  
  for (const post of posts) {
    const row = [
      escapeCsv(post.id),
      escapeCsv(post.platform),
      escapeCsv(post.title || ''),
      escapeCsv((post.content || '').substring(0, 500)),
      escapeCsv(post.author || ''),
      escapeCsv(post.url || ''),
      post.likes || 0,
      post.comments || 0,
      escapeCsv(post.timestamp || '')
    ];
    
    if (options.includeMetadata) {
      row.push(
        post.score || 0,
        escapeCsv(post.subreddit || ''),
        escapeCsv(post.image || '')
      );
    }
    
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
}

/**
 * Escape CSV value
 */
function escapeCsv(value: string | number): string {
  if (typeof value === 'number') return String(value);
  if (!value) return '""';
  
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains special chars
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Import posts from JSON
 */
export function importFromJson(jsonString: string): any[] {
  try {
    const data = JSON.parse(jsonString);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data.posts && Array.isArray(data.posts)) {
      return data.posts;
    }
    
    throw new Error('Invalid JSON format');
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${err instanceof Error ? err.message : 'unknown'}`);
  }
}

/**
 * Import posts from CSV
 */
export function importFromCsv(csvString: string): any[] {
  const lines = csvString.split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file is empty or has no data rows');
  }
  
  const headers = parseCsvLine(lines[0]);
  const posts: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCsvLine(lines[i]);
    const post: any = {};
    
    headers.forEach((header, idx) => {
      post[header] = values[idx] || '';
    });
    
    posts.push(post);
  }
  
  return posts;
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

