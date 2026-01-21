import { useEffect } from 'react';

type AnalyticsEvent = {
    name: string;
    properties?: Record<string, any>;
    timestamp?: number;
};

// Mock analytics service
const AnalyticsService = {
    track: (event: AnalyticsEvent) => {
        // In a real app, this would send data to Mixpanel/Amplitude/Google Analytics
        console.groupCollapsed(`[Analytics] ${event.name}`);
        console.log('Properties:', event.properties);
        console.log('Timestamp:', new Date(event.timestamp || Date.now()).toISOString());
        console.groupEnd();
    },

    identify: (userId: string, traits?: Record<string, any>) => {
        console.log(`[Analytics] Identify User: ${userId}`, traits);
    }
};

export const useAnalytics = () => {

    const trackEvent = (eventName: string, properties?: Record<string, any>) => {
        AnalyticsService.track({
            name: eventName,
            properties,
            timestamp: Date.now()
        });
    };

    const identifyUser = (userId: string, traits?: Record<string, any>) => {
        AnalyticsService.identify(userId, traits);
    };

    return {
        trackEvent,
        identifyUser
    };
};

// Auto-track page views helper
export const usePageTracking = (pageName: string) => {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        trackEvent('Page View', { page: pageName });
    }, [pageName]);
};
