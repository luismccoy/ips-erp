import type { Schema } from '../../data/resource';
import {
    LocationClient,
    CalculateRouteCommand,
    SearchPlaceIndexForTextCommand,
} from '@aws-sdk/client-location';

const locationClient = new LocationClient({ region: 'us-east-1' });

type RouteOptimizerInput = {
    shifts: Array<{
        id: string;
        patientId: string;
        patientName: string;
        address: string;
        scheduledTime: string;
        nurseId: string;
    }>;
    nurseLocation?: {
        lat: number;
        lng: number;
    };
    optimizationMode: 'TIME' | 'DISTANCE';
};

type OptimizedShift = {
    id: string;
    patientId: string;
    patientName: string;
    address: string;
    scheduledTime: string;
    coordinates: { lat: number; lng: number } | null;
    estimatedArrival: string | null;
    travelTimeMinutes: number | null;
    distanceKm: number | null;
    order: number;
};

type RouteOptimizerOutput = {
    success: boolean;
    optimizedShifts: OptimizedShift[];
    totalTravelTimeMinutes: number;
    totalDistanceKm: number;
    routeSummary: string;
    error?: string;
};

/**
 * Route Optimizer Lambda - AWS Location Service Integration
 * 
 * Optimizes nurse visit routes using AWS Location Service:
 * 1. Geocodes patient addresses to coordinates
 * 2. Calculates optimal route order (nearest neighbor algorithm)
 * 3. Returns travel times and distances
 * 
 * @param event - GraphQL query arguments
 * @returns Optimized shift order with travel estimates
 */
export const handler: Schema['optimizeRoute']['functionHandler'] = async (event) => {
    console.log('[RouteOptimizer] Received event:', JSON.stringify(event, null, 2));
    
    const input = event.arguments.input as RouteOptimizerInput;
    
    if (!input?.shifts || input.shifts.length === 0) {
        return {
            success: false,
            optimizedShifts: [],
            totalTravelTimeMinutes: 0,
            totalDistanceKm: 0,
            routeSummary: 'No hay turnos para optimizar',
            error: 'No shifts provided',
        };
    }
    
    try {
        // Step 1: Geocode all patient addresses
        const geocodedShifts = await geocodeShifts(input.shifts);
        
        // Step 2: Get starting point (nurse location or first shift)
        const startPoint = input.nurseLocation || 
            geocodedShifts.find(s => s.coordinates)?.coordinates ||
            { lat: 4.6097, lng: -74.0817 }; // Default: Bogotá center
        
        // Step 3: Optimize route order using nearest neighbor
        const optimizedOrder = optimizeRouteOrder(geocodedShifts, startPoint);
        
        // Step 4: Calculate route segments and travel times
        const routeDetails = await calculateRouteDetails(
            optimizedOrder,
            startPoint,
            input.optimizationMode || 'TIME'
        );
        
        // Step 5: Build response
        const totalTravelTime = routeDetails.reduce((sum, s) => sum + (s.travelTimeMinutes || 0), 0);
        const totalDistance = routeDetails.reduce((sum, s) => sum + (s.distanceKm || 0), 0);
        
        return {
            success: true,
            optimizedShifts: routeDetails,
            totalTravelTimeMinutes: Math.round(totalTravelTime),
            totalDistanceKm: Math.round(totalDistance * 10) / 10,
            routeSummary: `Ruta optimizada: ${routeDetails.length} visitas, ${Math.round(totalTravelTime)} min, ${Math.round(totalDistance * 10) / 10} km`,
        };
        
    } catch (error) {
        console.error('[RouteOptimizer] Error:', error);
        return {
            success: false,
            optimizedShifts: input.shifts.map((s, i) => ({
                ...s,
                coordinates: null,
                estimatedArrival: null,
                travelTimeMinutes: null,
                distanceKm: null,
                order: i + 1,
            })),
            totalTravelTimeMinutes: 0,
            totalDistanceKm: 0,
            routeSummary: 'Error al optimizar ruta',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

/**
 * Geocode patient addresses using AWS Location Service Place Index
 */
async function geocodeShifts(shifts: RouteOptimizerInput['shifts']): Promise<OptimizedShift[]> {
    const placeIndex = process.env.LOCATION_PLACE_INDEX || 'IPS-ERP-PlaceIndex';
    
    const geocoded: OptimizedShift[] = [];
    
    for (const shift of shifts) {
        let coordinates: { lat: number; lng: number } | null = null;
        
        if (shift.address) {
            try {
                const command = new SearchPlaceIndexForTextCommand({
                    IndexName: placeIndex,
                    Text: `${shift.address}, Bogotá, Colombia`,
                    MaxResults: 1,
                    BiasPosition: [-74.0817, 4.6097], // Bogotá center
                });
                
                const response = await locationClient.send(command);
                
                if (response.Results && response.Results.length > 0) {
                    const point = response.Results[0].Place?.Geometry?.Point;
                    if (point) {
                        coordinates = { lng: point[0], lat: point[1] };
                    }
                }
            } catch (error) {
                console.warn(`[RouteOptimizer] Geocoding failed for: ${shift.address}`, error);
            }
        }
        
        geocoded.push({
            id: shift.id,
            patientId: shift.patientId,
            patientName: shift.patientName,
            address: shift.address,
            scheduledTime: shift.scheduledTime,
            coordinates,
            estimatedArrival: null,
            travelTimeMinutes: null,
            distanceKm: null,
            order: 0,
        });
    }
    
    return geocoded;
}

/**
 * Optimize route order using nearest neighbor algorithm
 * Simple but effective for small number of stops (typical nurse route: 5-10 patients)
 */
function optimizeRouteOrder(
    shifts: OptimizedShift[],
    startPoint: { lat: number; lng: number }
): OptimizedShift[] {
    const unvisited = [...shifts];
    const optimized: OptimizedShift[] = [];
    let currentPoint = startPoint;
    let order = 1;
    
    while (unvisited.length > 0) {
        // Find nearest unvisited shift
        let nearestIndex = 0;
        let nearestDistance = Infinity;
        
        for (let i = 0; i < unvisited.length; i++) {
            const shift = unvisited[i];
            if (shift.coordinates) {
                const distance = haversineDistance(
                    currentPoint.lat, currentPoint.lng,
                    shift.coordinates.lat, shift.coordinates.lng
                );
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = i;
                }
            }
        }
        
        // Add nearest to optimized list
        const nearest = unvisited.splice(nearestIndex, 1)[0];
        nearest.order = order++;
        optimized.push(nearest);
        
        // Update current point
        if (nearest.coordinates) {
            currentPoint = nearest.coordinates;
        }
    }
    
    return optimized;
}

/**
 * Calculate route details using AWS Location Service Route Calculator
 */
async function calculateRouteDetails(
    shifts: OptimizedShift[],
    startPoint: { lat: number; lng: number },
    mode: 'TIME' | 'DISTANCE'
): Promise<OptimizedShift[]> {
    const routeCalculator = process.env.LOCATION_ROUTE_CALCULATOR || 'IPS-ERP-RouteCalculator';
    let currentPoint = startPoint;
    let currentTime = new Date();
    
    for (const shift of shifts) {
        if (!shift.coordinates) {
            // No coordinates - estimate based on order
            shift.travelTimeMinutes = 15; // Default 15 min
            shift.distanceKm = 5; // Default 5 km
            currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
            shift.estimatedArrival = currentTime.toISOString();
            continue;
        }
        
        try {
            const command = new CalculateRouteCommand({
                CalculatorName: routeCalculator,
                DeparturePosition: [currentPoint.lng, currentPoint.lat],
                DestinationPosition: [shift.coordinates.lng, shift.coordinates.lat],
                TravelMode: 'Car',
                DistanceUnit: 'Kilometers',
                OptimizeFor: mode === 'TIME' ? 'FastestRoute' : 'ShortestRoute',
            });
            
            const response = await locationClient.send(command);
            
            if (response.Summary) {
                shift.travelTimeMinutes = Math.round(response.Summary.DurationSeconds / 60);
                shift.distanceKm = Math.round(response.Summary.Distance * 10) / 10;
                currentTime = new Date(currentTime.getTime() + response.Summary.DurationSeconds * 1000);
                shift.estimatedArrival = currentTime.toISOString();
            }
        } catch (error) {
            console.warn(`[RouteOptimizer] Route calculation failed for shift ${shift.id}`, error);
            // Fallback to haversine estimate
            const distance = haversineDistance(
                currentPoint.lat, currentPoint.lng,
                shift.coordinates.lat, shift.coordinates.lng
            );
            shift.distanceKm = Math.round(distance * 10) / 10;
            shift.travelTimeMinutes = Math.round(distance / 30 * 60); // Assume 30 km/h average
            currentTime = new Date(currentTime.getTime() + (shift.travelTimeMinutes || 15) * 60 * 1000);
            shift.estimatedArrival = currentTime.toISOString();
        }
        
        // Update current point for next iteration
        currentPoint = shift.coordinates;
        // Add visit duration (30 min default)
        currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }
    
    return shifts;
}

/**
 * Calculate distance between two points using Haversine formula
 * @returns Distance in kilometers
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
