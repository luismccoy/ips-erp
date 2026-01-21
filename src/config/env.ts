export const env = {
    apiUrl: import.meta.env.VITE_API_URL || '',
    apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA !== 'false', // Default to true if not set
    appName: import.meta.env.VITE_APP_NAME || 'IPS ERP',
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
};
