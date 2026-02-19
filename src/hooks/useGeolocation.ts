/**
 * Geolocation Hook
 *
 * Provides GPS position tracking using the browser Geolocation API.
 * Supports one-shot positioning and continuous tracking via watchPosition.
 * Includes a Haversine distance helper for calculating distance to targets.
 */

import { useState, useRef, useCallback, useEffect } from 'react';

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export interface UseGeolocationReturn {
  /** Current GPS position */
  position: GeoPosition | null;
  /** Error message if geolocation failed */
  error: string | null;
  /** Whether actively tracking position via watchPosition */
  isTracking: boolean;
  /** Whether the browser supports geolocation */
  isSupported: boolean;
  /** Start continuous position tracking */
  startTracking: () => void;
  /** Stop continuous tracking */
  stopTracking: () => void;
  /** Get a one-shot position reading */
  getCurrentPosition: () => void;
  /** Calculate distance in km to a target coordinate (Haversine) */
  distanceTo: (lat: number, lng: number) => number | null;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 30_000,
};

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine formula — returns distance in km */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const watchIdRef = useRef<number | null>(null);

  const isSupported =
    typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      timestamp: pos.timestamp,
    });
    setError(null);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    const messages: Record<number, string> = {
      1: 'Permiso de ubicación denegado. Habilite el acceso a la ubicación.',
      2: 'No se pudo determinar la ubicación. Verifique su GPS.',
      3: 'Tiempo de espera agotado al obtener ubicación.',
    };
    setError(messages[err.code] || `Error de ubicación: ${err.message}`);
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setError('Geolocalización no soportada en este navegador');
      return;
    }
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, GEO_OPTIONS);
  }, [isSupported, handleSuccess, handleError]);

  const startTracking = useCallback(() => {
    if (!isSupported) {
      setError('Geolocalización no soportada en este navegador');
      return;
    }
    if (watchIdRef.current !== null) return; // Already tracking

    setError(null);
    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, GEO_OPTIONS);
    watchIdRef.current = id;
    setIsTracking(true);
  }, [isSupported, handleSuccess, handleError]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const distanceTo = useCallback(
    (lat: number, lng: number): number | null => {
      if (!position) return null;
      return haversineDistance(position.lat, position.lng, lat, lng);
    },
    [position],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    position,
    error,
    isTracking,
    isSupported,
    startTracking,
    stopTracking,
    getCurrentPosition,
    distanceTo,
  };
}
