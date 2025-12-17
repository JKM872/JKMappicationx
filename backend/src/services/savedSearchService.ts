/**
 * Saved Searches Service
 * Manages user's saved/favorite search queries
 * Uses local storage on frontend + optional Supabase sync
 */

export interface SavedSearch {
  id: string;
  query: string;
  platform?: 'all' | 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
  createdAt: string;
  lastUsed?: string;
  useCount: number;
  isPinned: boolean;
}

// In-memory storage for demo (replace with Supabase for persistence)
const savedSearches: Map<string, SavedSearch[]> = new Map();

/**
 * Get all saved searches for a user
 */
export function getSavedSearches(userId: string = 'default'): SavedSearch[] {
  return savedSearches.get(userId) || [];
}

/**
 * Save a new search
 */
export function saveSearch(
  query: string,
  platform: SavedSearch['platform'] = 'all',
  userId: string = 'default'
): SavedSearch {
  const userSearches = savedSearches.get(userId) || [];
  
  // Check if already exists
  const existing = userSearches.find(s => 
    s.query.toLowerCase() === query.toLowerCase() && s.platform === platform
  );
  
  if (existing) {
    existing.lastUsed = new Date().toISOString();
    existing.useCount += 1;
    return existing;
  }
  
  const newSearch: SavedSearch = {
    id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    query,
    platform,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    useCount: 1,
    isPinned: false
  };
  
  userSearches.push(newSearch);
  savedSearches.set(userId, userSearches);
  
  return newSearch;
}

/**
 * Delete a saved search
 */
export function deleteSearch(searchId: string, userId: string = 'default'): boolean {
  const userSearches = savedSearches.get(userId) || [];
  const index = userSearches.findIndex(s => s.id === searchId);
  
  if (index > -1) {
    userSearches.splice(index, 1);
    savedSearches.set(userId, userSearches);
    return true;
  }
  
  return false;
}

/**
 * Toggle pin status of a saved search
 */
export function togglePinSearch(searchId: string, userId: string = 'default'): SavedSearch | null {
  const userSearches = savedSearches.get(userId) || [];
  const search = userSearches.find(s => s.id === searchId);
  
  if (search) {
    search.isPinned = !search.isPinned;
    return search;
  }
  
  return null;
}

/**
 * Get most used searches
 */
export function getMostUsedSearches(userId: string = 'default', limit: number = 5): SavedSearch[] {
  const userSearches = savedSearches.get(userId) || [];
  return [...userSearches]
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, limit);
}

/**
 * Get pinned searches
 */
export function getPinnedSearches(userId: string = 'default'): SavedSearch[] {
  const userSearches = savedSearches.get(userId) || [];
  return userSearches.filter(s => s.isPinned);
}

