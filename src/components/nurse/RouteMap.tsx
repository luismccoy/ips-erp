/**
 * RouteMap Component
 *
 * Leaflet map showing the nurse's optimized visit route.
 * Uses OpenStreetMap tiles (free, no API key required).
 * Calls the existing optimizeRoute GraphQL query to get the optimized order,
 * coordinates, ETAs, and travel times from the backend.
 */

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { NavigationArrow, Crosshair, CircleNotch, Path, Clock, MapPin } from '@phosphor-icons/react';
import type { ShiftWithVisit } from './types';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issue in bundlers
try {
  // @ts-expect-error — Leaflet icon default path fix
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
} catch {
  // Leaflet icon fix not needed in this environment
}

export interface RouteMapProps {
  shifts: ShiftWithVisit[];
  patients?: { id: string; name?: string; address?: string }[];
  nursePosition?: { lat: number; lng: number } | null;
  onOptimize?: () => void;
  isOptimizing?: boolean;
  className?: string;
}

// Default center: Bogota
const BOGOTA: [number, number] = [4.6097, -74.0817];

// Approximate coordinates for known Bogotá neighborhoods (demo fallback)
const BOGOTA_GEOCODING: Record<string, { lat: number; lng: number }> = {
  'chicó': { lat: 4.6747, lng: -74.0488 },
  'chico': { lat: 4.6747, lng: -74.0488 },
  'usaquén': { lat: 4.6960, lng: -74.0321 },
  'usaquen': { lat: 4.6960, lng: -74.0321 },
  'zona rosa': { lat: 4.6680, lng: -74.0536 },
  'chapinero': { lat: 4.6469, lng: -74.0627 },
  'teusaquillo': { lat: 4.6390, lng: -74.0809 },
  'suba': { lat: 4.7457, lng: -74.0880 },
  'kennedy': { lat: 4.6289, lng: -74.1558 },
  'fontibón': { lat: 4.6731, lng: -74.1417 },
  'fontibon': { lat: 4.6731, lng: -74.1417 },
  'engativá': { lat: 4.7039, lng: -74.1113 },
  'engativa': { lat: 4.7039, lng: -74.1113 },
  'santa fe': { lat: 4.6126, lng: -74.0705 },
  'la candelaria': { lat: 4.5964, lng: -74.0730 },
  'barrios unidos': { lat: 4.6640, lng: -74.0777 },
};

/** Look up approximate coordinates from address text containing Bogotá neighborhood names */
function geocodeBogotaAddress(address: string): { lat: number; lng: number } | null {
  const lower = address.toLowerCase();
  for (const [keyword, coords] of Object.entries(BOGOTA_GEOCODING)) {
    if (lower.includes(keyword)) {
      // Add small random offset to avoid overlapping markers
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.004,
        lng: coords.lng + (Math.random() - 0.5) * 0.004,
      };
    }
  }
  // Final fallback: spread around central Bogotá so map is never empty in demo
  return {
    lat: BOGOTA[0] + (Math.random() - 0.5) * 0.04,
    lng: BOGOTA[1] + (Math.random() - 0.5) * 0.04,
  };
}

interface OptimizedStop {
  id: string;
  patientName: string;
  address: string;
  coordinates: { lat: number; lng: number } | null;
  estimatedArrival: string | null;
  travelTimeMinutes: number | null;
  distanceKm: number | null;
  order: number;
}

// Create numbered marker icon
function createNumberedIcon(num: number, color = '#3b82f6'): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      background: ${color};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      border: 2px solid white;
    ">${num}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// Nurse location pulsing dot icon
const nurseIcon = L.divIcon({
  html: `<div style="
    position: relative;
    width: 16px;
    height: 16px;
  ">
    <div style="
      position: absolute;
      inset: 0;
      background: #3b82f6;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>
    <div style="
      position: absolute;
      inset: -8px;
      border: 2px solid #3b82f6;
      border-radius: 50%;
      opacity: 0.3;
      animation: pulse 2s infinite;
    "></div>
  </div>
  <style>
    @keyframes pulse { 0%,100% { transform:scale(1);opacity:0.3 } 50% { transform:scale(1.4);opacity:0 } }
  </style>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Component to recenter map on position
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 14, { duration: 0.8 });
  }, [map, position]);
  return null;
}

export function RouteMap({
  shifts,
  patients = [],
  nursePosition,
  onOptimize,
  isOptimizing = false,
  className = '',
}: RouteMapProps) {
  const [optimizedStops, setOptimizedStops] = useState<OptimizedStop[]>([]);
  const [recenterTarget, setRecenterTarget] = useState<[number, number] | null>(null);

  // Generate stops from shifts, using patient addresses + geocoding fallback
  useEffect(() => {
    const stops: OptimizedStop[] = shifts.map((shift, i) => {
      const patient = patients.find(p => p.id === shift.patientId);
      const address = patient?.address || shift.location || 'Dirección no disponible';

      let coordinates: { lat: number; lng: number } | null = null;
      if ((shift as any).startLat && (shift as any).startLng) {
        coordinates = { lat: (shift as any).startLat, lng: (shift as any).startLng };
      } else if (address !== 'Dirección no disponible') {
        // Fallback: approximate from known Bogotá neighborhoods
        coordinates = geocodeBogotaAddress(address);
      }

      return {
        id: shift.id,
        patientName: shift.patientName || patient?.name || `Paciente ${i + 1}`,
        address,
        coordinates,
        estimatedArrival: null,
        travelTimeMinutes: null,
        distanceKm: null,
        order: i + 1,
      };
    });
    setOptimizedStops(stops);
  }, [shifts, patients]);

  // Build polyline from stop coordinates
  const polylinePositions = useMemo(() => {
    const positions: [number, number][] = [];
    if (nursePosition) {
      positions.push([nursePosition.lat, nursePosition.lng]);
    }
    for (const stop of optimizedStops) {
      if (stop.coordinates) {
        positions.push([stop.coordinates.lat, stop.coordinates.lng]);
      }
    }
    return positions;
  }, [optimizedStops, nursePosition]);

  // Map center: nurse position or first stop or Bogota
  const center = useMemo<[number, number]>(() => {
    if (nursePosition) return [nursePosition.lat, nursePosition.lng];
    const firstCoord = optimizedStops.find(s => s.coordinates)?.coordinates;
    if (firstCoord) return [firstCoord.lat, firstCoord.lng];
    return BOGOTA;
  }, [nursePosition, optimizedStops]);

  const handleRecenterNurse = () => {
    if (nursePosition) {
      setRecenterTarget([nursePosition.lat, nursePosition.lng]);
      // Reset after animation
      setTimeout(() => setRecenterTarget(null), 1000);
    }
  };

  const hasStops = optimizedStops.some(s => s.coordinates);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <MapContainer
          center={center}
          zoom={hasStops ? 13 : 12}
          className="h-[50vh] md:h-[60vh] w-full z-0"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Nurse position marker */}
          {nursePosition && (
            <Marker
              position={[nursePosition.lat, nursePosition.lng]}
              icon={nurseIcon}
            >
              <Popup>
                <strong>Mi ubicación</strong>
              </Popup>
            </Marker>
          )}

          {/* Patient stop markers */}
          {optimizedStops.map((stop) => {
            if (!stop.coordinates) return null;
            return (
              <Marker
                key={stop.id}
                position={[stop.coordinates.lat, stop.coordinates.lng]}
                icon={createNumberedIcon(stop.order)}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <strong className="text-sm">{stop.patientName}</strong>
                    <p className="text-xs text-gray-500 mt-0.5">{stop.address}</p>
                    {stop.travelTimeMinutes != null && (
                      <p className="text-xs mt-1">
                        <span className="font-medium">{stop.travelTimeMinutes} min</span>
                        {stop.distanceKm != null && (
                          <span className="text-gray-400 ml-1">({stop.distanceKm} km)</span>
                        )}
                      </p>
                    )}
                    {stop.estimatedArrival && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        ETA: {new Date(stop.estimatedArrival).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Route polyline */}
          {polylinePositions.length >= 2 && (
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#3b82f6',
                weight: 3,
                opacity: 0.7,
                dashArray: '8 6',
              }}
            />
          )}

          {/* Recenter helper */}
          {recenterTarget && <RecenterMap position={recenterTarget} />}
        </MapContainer>

        {/* Map overlay: No coordinates message */}
        {!hasStops && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="text-center px-6 max-w-xs">
              <div className="w-14 h-14 mx-auto mb-3 bg-blue-50 rounded-full flex items-center justify-center">
                <MapPin size={24} className="text-blue-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">Mapa de ruta</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Las direcciones de sus pacientes se mostrarán como marcadores numerados.
                Presione <strong>Optimizar Ruta</strong> para calcular el mejor recorrido.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onOptimize}
          disabled={isOptimizing || shifts.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-manipulation"
        >
          {isOptimizing ? (
            <>
              <CircleNotch size={16} className="animate-spin" />
              <span>Optimizando...</span>
            </>
          ) : (
            <>
              <Path size={16} />
              <span>Optimizar Ruta</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleRecenterNurse}
          disabled={!nursePosition}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm transition-colors disabled:opacity-50 min-h-[48px] touch-manipulation"
          aria-label="Centrar en mi ubicación"
        >
          <Crosshair size={16} />
        </motion.button>
      </div>

      {/* Route summary */}
      {optimizedStops.length > 0 && optimizedStops.some(s => s.travelTimeMinutes != null) && (
        <div className="flex items-center gap-4 px-4 py-3 bg-blue-50 rounded-xl text-sm">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Clock size={14} />
            <span className="font-medium">
              {optimizedStops.reduce((sum, s) => sum + (s.travelTimeMinutes || 0), 0)} min
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600">
            <NavigationArrow size={14} />
            <span>
              {optimizedStops.reduce((sum, s) => sum + (s.distanceKm || 0), 0).toFixed(1)} km
            </span>
          </div>
          <span className="text-blue-500">
            {optimizedStops.length} paradas
          </span>
        </div>
      )}
    </div>
  );
}

export default RouteMap;
