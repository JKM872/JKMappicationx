/**
 * 🤖 Automation Service
 * Auto-repost, auto-plug, and auto-delete functionality
 */

import { PlannedPost } from '../types';

export interface AutomationSettings {
    autoRepost: {
        enabled: boolean;
        delayHours: number;  // Hours after original post
        minEngagement: number;  // Min likes to trigger repost
        maxReposts: number;  // Max number of reposts per tweet
    };
    autoPlug: {
        enabled: boolean;
        threshold: number;  // Engagement threshold to trigger plug
        ctaContent: string;  // The CTA to post
        waitMinutes: number;  // Wait before posting plug
    };
    autoDelete: {
        enabled: boolean;
        thresholdHours: number;  // Hours before checking
        minEngagement: number;  // Posts below this get deleted
        excludeDrafts: boolean;
    };
}

// Default automation settings
const defaultSettings: AutomationSettings = {
    autoRepost: {
        enabled: false,
        delayHours: 6,
        minEngagement: 100,
        maxReposts: 2,
    },
    autoPlug: {
        enabled: false,
        threshold: 500,
        ctaContent: '🔔 Follow me for more content like this!',
        waitMinutes: 30,
    },
    autoDelete: {
        enabled: false,
        thresholdHours: 24,
        minEngagement: 10,
        excludeDrafts: true,
    },
};

// In-memory storage for settings (would be replaced with DB in production)
let currentSettings: AutomationSettings = { ...defaultSettings };
let scheduledTasks: Map<string, NodeJS.Timeout> = new Map();

/**
 * Get current automation settings
 */
export function getSettings(): AutomationSettings {
    return { ...currentSettings };
}

/**
 * Update automation settings
 */
export function updateSettings(newSettings: Partial<AutomationSettings>): AutomationSettings {
    currentSettings = {
        ...currentSettings,
        ...newSettings,
        autoRepost: { ...currentSettings.autoRepost, ...newSettings.autoRepost },
        autoPlug: { ...currentSettings.autoPlug, ...newSettings.autoPlug },
        autoDelete: { ...currentSettings.autoDelete, ...newSettings.autoDelete },
    };
    console.log('✅ Automation settings updated');
    return currentSettings;
}

/**
 * Schedule an auto-repost for a post
 */
export function scheduleAutoRepost(
    postId: string,
    delayHours: number = currentSettings.autoRepost.delayHours
): { success: boolean; scheduledFor?: Date; message?: string } {
    if (!currentSettings.autoRepost.enabled) {
        return { success: false, message: 'Auto-repost is disabled' };
    }

    const existingTask = scheduledTasks.get(`repost-${postId}`);
    if (existingTask) {
        clearTimeout(existingTask);
    }

    const scheduledTime = new Date(Date.now() + delayHours * 60 * 60 * 1000);

    const task = setTimeout(async () => {
        console.log(`🔄 Auto-reposting post ${postId}`);
        // In production, this would call the publishing service
        scheduledTasks.delete(`repost-${postId}`);
    }, delayHours * 60 * 60 * 1000);

    scheduledTasks.set(`repost-${postId}`, task);

    console.log(`⏰ Scheduled repost for post ${postId} at ${scheduledTime.toISOString()}`);

    return {
        success: true,
        scheduledFor: scheduledTime,
        message: `Repost scheduled for ${scheduledTime.toLocaleString()}`
    };
}

/**
 * Check and apply auto-plug to a post based on engagement
 */
export async function checkAutoPlug(
    postId: string,
    currentEngagement: number
): Promise<{ shouldPlug: boolean; message?: string }> {
    if (!currentSettings.autoPlug.enabled) {
        return { shouldPlug: false, message: 'Auto-plug is disabled' };
    }

    if (currentEngagement < currentSettings.autoPlug.threshold) {
        return {
            shouldPlug: false,
            message: `Engagement (${currentEngagement}) below threshold (${currentSettings.autoPlug.threshold})`
        };
    }

    console.log(`📌 Post ${postId} reached plug threshold with ${currentEngagement} engagement`);

    return {
        shouldPlug: true,
        message: `Ready to plug! Engagement: ${currentEngagement}`
    };
}

/**
 * Get the plug content to post
 */
export function getPlugContent(): string {
    return currentSettings.autoPlug.ctaContent;
}

/**
 * Check posts for auto-delete
 */
export async function checkAutoDelete(
    posts: Array<{ id: string; engagement: number; createdAt: Date; status: string }>
): Promise<{ toDelete: string[]; message: string }> {
    if (!currentSettings.autoDelete.enabled) {
        return { toDelete: [], message: 'Auto-delete is disabled' };
    }

    const thresholdTime = new Date(
        Date.now() - currentSettings.autoDelete.thresholdHours * 60 * 60 * 1000
    );

    const toDelete = posts
        .filter(post => {
            // Skip drafts if configured
            if (currentSettings.autoDelete.excludeDrafts && post.status === 'draft') {
                return false;
            }

            // Check if post is old enough and has low engagement
            const isOldEnough = new Date(post.createdAt) < thresholdTime;
            const hasLowEngagement = post.engagement < currentSettings.autoDelete.minEngagement;

            return isOldEnough && hasLowEngagement;
        })
        .map(post => post.id);

    console.log(`🗑️ Auto-delete check: ${toDelete.length} posts marked for deletion`);

    return {
        toDelete,
        message: `${toDelete.length} low-performing posts identified for deletion`
    };
}

/**
 * Cancel all scheduled automation tasks
 */
export function cancelAllScheduledTasks(): void {
    scheduledTasks.forEach((task, key) => {
        clearTimeout(task);
        console.log(`❌ Cancelled scheduled task: ${key}`);
    });
    scheduledTasks.clear();
}

/**
 * Get all scheduled tasks
 */
export function getScheduledTasks(): string[] {
    return Array.from(scheduledTasks.keys());
}

/**
 * Reset settings to defaults
 */
export function resetSettings(): AutomationSettings {
    currentSettings = { ...defaultSettings };
    console.log('🔄 Automation settings reset to defaults');
    return currentSettings;
}
