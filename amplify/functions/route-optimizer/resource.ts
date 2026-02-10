import { defineFunction } from '@aws-amplify/backend';

export const routeOptimizer = defineFunction({
    name: 'route-optimizer',
    entry: './handler.ts',
    timeoutSeconds: 30,
    memoryMB: 256,
    environment: {
        // AWS Location Service resources (created via CDK in backend.ts)
        LOCATION_ROUTE_CALCULATOR: 'IPS-ERP-RouteCalculator',
        LOCATION_PLACE_INDEX: 'IPS-ERP-PlaceIndex',
    },
});
