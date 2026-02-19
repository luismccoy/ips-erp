/**
 * HealthRings Component
 *
 * Apple Watch–inspired concentric SVG rings showing patient vital signs.
 * Each ring represents a vital: SpO2 (outer, green), Heart Rate (middle, blue),
 * Blood Pressure (inner, purple). Color shifts to amber/red for abnormal values.
 *
 * Used at two scales:
 * - Small (size=48) on shift cards for at-a-glance status
 * - Large (size=120) in vitals timeline/detail view
 */

import { motion } from 'framer-motion';

export interface HealthRingsProps {
  /** Oxygen saturation % (0–100) — outer ring */
  spo2?: number;
  /** Heart rate bpm (40–200) — middle ring */
  heartRate?: number;
  /** Systolic blood pressure mmHg (60–200) — inner ring */
  systolic?: number;
  /** SVG size in px */
  size?: number;
  /** Additional CSS classes */
  className?: string;
}

// Clinical thresholds
function spo2Color(v: number): string {
  if (v < 92) return '#ef4444'; // red-500
  if (v < 95) return '#f59e0b'; // amber-500
  return '#22c55e'; // green-500
}

function hrColor(v: number): string {
  if (v > 120 || v < 50) return '#ef4444';
  if (v > 100 || v < 60) return '#f59e0b';
  return '#3b82f6'; // blue-500
}

function bpColor(v: number): string {
  if (v > 160 || v < 90) return '#ef4444';
  if (v > 140 || v < 100) return '#f59e0b';
  return '#8b5cf6'; // purple-500
}

// Normalize value to 0–1 range for ring fill
function normalize(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function HealthRings({
  spo2,
  heartRate,
  systolic,
  size = 120,
  className = '',
}: HealthRingsProps) {
  const center = size / 2;
  const strokeWidth = size >= 80 ? 6 : 4;
  const gap = size >= 80 ? 4 : 3;

  // Ring radii (outer → inner)
  const r1 = center - strokeWidth / 2 - 1;
  const r2 = r1 - strokeWidth - gap;
  const r3 = r2 - strokeWidth - gap;

  const rings = [
    {
      value: spo2,
      radius: r1,
      color: spo2 != null ? spo2Color(spo2) : '#e2e8f0',
      fill: spo2 != null ? normalize(spo2, 80, 100) : 0,
      label: 'SpO2',
    },
    {
      value: heartRate,
      radius: r2,
      color: heartRate != null ? hrColor(heartRate) : '#e2e8f0',
      fill: heartRate != null ? normalize(heartRate, 40, 200) : 0,
      label: 'FC',
    },
    {
      value: systolic,
      radius: r3,
      color: systolic != null ? bpColor(systolic) : '#e2e8f0',
      fill: systolic != null ? normalize(systolic, 60, 200) : 0,
      label: 'PA',
    },
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={[
        spo2 != null && `SpO2: ${spo2}%`,
        heartRate != null && `FC: ${heartRate} lpm`,
        systolic != null && `PAS: ${systolic} mmHg`,
      ]
        .filter(Boolean)
        .join(', ')}
      role="img"
    >
      {rings.map((ring, i) => {
        const circumference = 2 * Math.PI * ring.radius;
        const dashOffset = circumference * (1 - ring.fill);

        return (
          <g key={i}>
            {/* Background track */}
            <circle
              cx={center}
              cy={center}
              r={ring.radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              opacity={0.6}
            />
            {/* Filled arc */}
            {ring.value != null && (
              <motion.circle
                cx={center}
                cy={center}
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 0.8, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                transform={`rotate(-90 ${center} ${center})`}
              />
            )}
          </g>
        );
      })}

      {/* Center text — show most critical value */}
      {size >= 80 && (
        <text
          x={center}
          y={center + 1}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-700"
          fontSize={size >= 100 ? 14 : 11}
          fontWeight={600}
        >
          {spo2 != null ? `${spo2}%` : heartRate != null ? heartRate : '—'}
        </text>
      )}
    </svg>
  );
}

export default HealthRings;
