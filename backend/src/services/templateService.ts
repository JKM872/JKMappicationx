/**
 * Post Templates Service
 * Manages reusable post templates for different platforms
 */

export interface PostTemplate {
  id: string;
  name: string;
  description: string;
  platform: 'all' | 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
  content: string;
  variables: string[]; // e.g., {{topic}}, {{product}}, {{link}}
  hashtags?: string[];
  category: string;
  useCount: number;
  createdAt: string;
  updatedAt: string;
}

// Built-in templates
const defaultTemplates: PostTemplate[] = [
  {
    id: 'template-1',
    name: 'Product Launch',
    description: 'Announce a new product or feature',
    platform: 'all',
    content: '🚀 Exciting news! We just launched {{product}}!\n\n{{description}}\n\nCheck it out: {{link}}',
    variables: ['product', 'description', 'link'],
    hashtags: ['#launch', '#newproduct', '#innovation'],
    category: 'announcement',
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-2',
    name: 'Tutorial/How-to',
    description: 'Share a tutorial or educational content',
    platform: 'Dev.to',
    content: '📚 New Tutorial: {{title}}\n\nLearn how to {{topic}} in just {{time}}!\n\nKey takeaways:\n- {{point1}}\n- {{point2}}\n- {{point3}}\n\nFull guide: {{link}}',
    variables: ['title', 'topic', 'time', 'point1', 'point2', 'point3', 'link'],
    hashtags: ['#tutorial', '#learning', '#coding'],
    category: 'educational',
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-3',
    name: 'Question/Poll',
    description: 'Engage audience with a question',
    platform: 'Twitter',
    content: '🤔 Quick question for {{audience}}:\n\n{{question}}\n\nDrop your thoughts below! 👇',
    variables: ['audience', 'question'],
    hashtags: ['#discussion', '#poll'],
    category: 'engagement',
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-4',
    name: 'Thread Starter',
    description: 'Start a Twitter/Threads thread',
    platform: 'Twitter',
    content: '🧵 Thread: {{topic}}\n\n{{hook}}\n\nHere\'s what you need to know:\n\n👇',
    variables: ['topic', 'hook'],
    hashtags: ['#thread'],
    category: 'educational',
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-5',
    name: 'Reddit Discussion',
    description: 'Start a discussion on Reddit',
    platform: 'Reddit',
    content: '{{title}}\n\nHey r/{{subreddit}},\n\n{{body}}\n\nWhat do you think? I\'d love to hear your experiences.\n\nEdit: {{edit}}',
    variables: ['title', 'subreddit', 'body', 'edit'],
    hashtags: [],
    category: 'discussion',
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-6',
    name: 'Milestone Celebration',
    description: 'Celebrate an achievement',
    platform: 'all',
    content: '🎉 Milestone reached!\n\n{{milestone}}\n\nThank you to everyone who made this possible! {{mentions}}\n\n#{{hashtag}}',
    variables: ['milestone', 'mentions', 'hashtag'],
    hashtags: ['#milestone', '#celebration', '#achievement'],
    category: 'announcement',
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-7',
    name: 'Dev.to Article Promo',
    description: 'Promote a Dev.to article',
    platform: 'Twitter',
    content: '✍️ New article on Dev.to:\n\n"{{title}}"\n\n{{summary}}\n\nRead more: {{link}}\n\n#devto #programming',
    variables: ['title', 'summary', 'link'],
    hashtags: ['#devto', '#programming', '#webdev'],
    category: 'promotion',
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'template-8',
    name: 'Tool/Resource Share',
    description: 'Share a useful tool or resource',
    platform: 'all',
    content: '🔧 Tool of the day: {{tool}}\n\n{{description}}\n\nWhy I love it:\n✅ {{benefit1}}\n✅ {{benefit2}}\n✅ {{benefit3}}\n\nLink: {{link}}',
    variables: ['tool', 'description', 'benefit1', 'benefit2', 'benefit3', 'link'],
    hashtags: ['#tools', '#productivity', '#resources'],
    category: 'resource',
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Custom templates storage (in-memory for demo)
const customTemplates: Map<string, PostTemplate[]> = new Map();

/**
 * Get all templates (built-in + custom)
 */
export function getTemplates(userId: string = 'default'): PostTemplate[] {
  const userTemplates = customTemplates.get(userId) || [];
  return [...defaultTemplates, ...userTemplates];
}

/**
 * Get templates by platform
 */
export function getTemplatesByPlatform(
  platform: PostTemplate['platform'],
  userId: string = 'default'
): PostTemplate[] {
  return getTemplates(userId).filter(t => 
    t.platform === platform || t.platform === 'all'
  );
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: string,
  userId: string = 'default'
): PostTemplate[] {
  return getTemplates(userId).filter(t => t.category === category);
}

/**
 * Create a custom template
 */
export function createTemplate(
  template: Omit<PostTemplate, 'id' | 'useCount' | 'createdAt' | 'updatedAt'>,
  userId: string = 'default'
): PostTemplate {
  const newTemplate: PostTemplate = {
    ...template,
    id: `template-custom-${Date.now()}`,
    useCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const userTemplates = customTemplates.get(userId) || [];
  userTemplates.push(newTemplate);
  customTemplates.set(userId, userTemplates);
  
  return newTemplate;
}

/**
 * Update a custom template
 */
export function updateTemplate(
  templateId: string,
  updates: Partial<PostTemplate>,
  userId: string = 'default'
): PostTemplate | null {
  const userTemplates = customTemplates.get(userId) || [];
  const index = userTemplates.findIndex(t => t.id === templateId);
  
  if (index > -1) {
    userTemplates[index] = {
      ...userTemplates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    customTemplates.set(userId, userTemplates);
    return userTemplates[index];
  }
  
  return null;
}

/**
 * Delete a custom template
 */
export function deleteTemplate(templateId: string, userId: string = 'default'): boolean {
  const userTemplates = customTemplates.get(userId) || [];
  const index = userTemplates.findIndex(t => t.id === templateId);
  
  if (index > -1) {
    userTemplates.splice(index, 1);
    customTemplates.set(userId, userTemplates);
    return true;
  }
  
  return false;
}

/**
 * Fill template variables with actual values
 */
export function fillTemplate(
  templateId: string,
  values: Record<string, string>,
  userId: string = 'default'
): string | null {
  const templates = getTemplates(userId);
  const template = templates.find(t => t.id === templateId);
  
  if (!template) return null;
  
  let content = template.content;
  
  for (const [key, value] of Object.entries(values)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  
  // Increment use count for custom templates
  const userTemplates = customTemplates.get(userId) || [];
  const customIndex = userTemplates.findIndex(t => t.id === templateId);
  if (customIndex > -1) {
    userTemplates[customIndex].useCount += 1;
    customTemplates.set(userId, userTemplates);
  }
  
  return content;
}

/**
 * Get template categories
 */
export function getCategories(): string[] {
  return ['announcement', 'educational', 'engagement', 'discussion', 'promotion', 'resource'];
}

