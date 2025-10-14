/**
 * Utility functions for debugging session-related issues
 */

export interface SessionDebugInfo {
    hasToken: boolean;
    hasRefreshToken: boolean;
    hasLastActivity: boolean;
    lastActivity: string | null;
    lastActivityDate: Date | null;
    timeSinceActivity: number; // in minutes
    isActivityValid: boolean;
    sessionTimeout: number;
    allLocalStorageKeys: string[];
}

/**
 * Get comprehensive session debug information
 */
export const getSessionDebugInfo = (sessionTimeout: number = 30): SessionDebugInfo => {
    const token = localStorage.getItem('flowcrm_token');
    const refreshToken = localStorage.getItem('flowcrm_refresh_token');
    const lastActivity = localStorage.getItem('flowcrm_last_activity');

    let lastActivityDate: Date | null = null;
    let timeSinceActivity = 0;
    let isActivityValid = false;

    if (lastActivity) {
        try {
            lastActivityDate = new Date(lastActivity);
            const now = new Date();
            timeSinceActivity = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60);
            isActivityValid = timeSinceActivity <= sessionTimeout;
        } catch (error) {
            console.error('Error parsing last activity date:', error);
        }
    }

    // Get all localStorage keys for debugging
    const allLocalStorageKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            allLocalStorageKeys.push(key);
        }
    }

    return {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        hasLastActivity: !!lastActivity,
        lastActivity,
        lastActivityDate,
        timeSinceActivity,
        isActivityValid,
        sessionTimeout,
        allLocalStorageKeys: allLocalStorageKeys.filter(key => key.startsWith('flowcrm')),
    };
};

/**
 * Log session debug information to console
 */
export const logSessionDebugInfo = (sessionTimeout?: number): void => {
    const debugInfo = getSessionDebugInfo(sessionTimeout);

    console.group('🔍 Session Debug Information');
    console.log('Token present:', debugInfo.hasToken);
    console.log('Refresh token present:', debugInfo.hasRefreshToken);
    console.log('Last activity present:', debugInfo.hasLastActivity);
    console.log('Last activity value:', debugInfo.lastActivity);
    console.log('Last activity date:', debugInfo.lastActivityDate);
    console.log('Time since activity (minutes):', debugInfo.timeSinceActivity.toFixed(2));
    console.log('Activity valid:', debugInfo.isActivityValid);
    console.log('Session timeout (minutes):', debugInfo.sessionTimeout);
    console.log('FlowCRM localStorage keys:', debugInfo.allLocalStorageKeys);
    console.groupEnd();
};

/**
 * Clear all FlowCRM related localStorage items
 */
export const clearFlowCRMStorage = (): void => {
    const keysToRemove = [
        'flowcrm_token',
        'flowcrm_refresh_token',
        'flowcrm_last_activity',
        'temp_reports_permission'
    ];

    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log('🧹 Cleared FlowCRM localStorage items:', keysToRemove);
};

/**
 * Reset session activity to current time
 */
export const resetSessionActivity = (): void => {
    const now = new Date().toISOString();
    localStorage.setItem('flowcrm_last_activity', now);
    console.log('🔄 Reset session activity to:', now);
};

/**
 * Check if session should be considered expired
 */
export const isSessionExpired = (sessionTimeout: number = 30): boolean => {
    const debugInfo = getSessionDebugInfo(sessionTimeout);
    return debugInfo.hasLastActivity && !debugInfo.isActivityValid;
};