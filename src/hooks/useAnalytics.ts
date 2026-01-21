import { useEffect, useCallback } from 'react';


type AnalyticsProperties = Record<string, unknown>;

type AnalyticsEvent = {
    name: string;
    properties?: AnalyticsProperties;
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

    identify: (userId: string, traits?: AnalyticsProperties) => {
        console.log(`[Analytics] Identify User: ${userId}`, traits);
    }
};

export const useAnalytics = () => {

    const trackEvent = useCallback((eventName: string, properties?: AnalyticsProperties) => {
        AnalyticsService.track({
            name: eventName,
            properties,
            timestamp: Date.now()
        });
    }, []);

    const identifyUser = useCallback((userId: string, traits?: AnalyticsProperties) => {
        AnalyticsService.identify(userId, traits);
    }, []);

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
    }, [pageName, trackEvent]);
};
