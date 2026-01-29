/**
 * Simple Logger for PWA and Service Worker
 */

export const logger = {
    info: (...args: any[]) => {
        if (import.meta.env.DEV) {
            console.log('[PWA]', ...args);
        }
    },
    error: (...args: any[]) => {
        console.error('[PWA Error]', ...args);
    }
};