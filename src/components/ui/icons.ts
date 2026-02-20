/**
 * Unified Icon Adapter Module
 *
 * Normalizes API differences between healthicons-react (width/height props)
 * and @phosphor-icons/react (size prop) so both can be used interchangeably.
 */
import { createElement, forwardRef } from 'react';
import type { ComponentType, SVGAttributes } from 'react';

// ---------------------------------------------------------------------------
// Unified icon type
// ---------------------------------------------------------------------------
export type AppIcon = ComponentType<{
  size?: number | string;
  className?: string;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}>;

// ---------------------------------------------------------------------------
// Healthicons wrapper — converts width/height API → size API
// ---------------------------------------------------------------------------
type HealthIconComponent = ComponentType<SVGAttributes<SVGSVGElement> & {
  width?: number | string;
  height?: number | string;
  color?: string;
}>;

export function wrapHealthicon(HealthIcon: HealthIconComponent, displayName: string): AppIcon {
  const Wrapped: AppIcon = ({ size = 24, className, color, ...rest }) =>
    createElement(HealthIcon, { width: size, height: size, className, color });
  (Wrapped as any).displayName = displayName;
  return Wrapped;
}

// ---------------------------------------------------------------------------
// Healthcare domain icons (healthicons-react/outline)
// ---------------------------------------------------------------------------
import {
  Cardiogram,
  HeartOrgan,
  HeartCardiogram,
  Stethoscope as HStethoscope,
  Neurology,
  Medicines,
  Thermometer as HThermometer,
  Weight,
  BloodDrop,
  Lungs,
  Nurse,
  HealthWorker,
  MedicalRecords,
  Hospital as HHospital,
} from 'healthicons-react/outline';

export const ActivityIcon = wrapHealthicon(Cardiogram, 'ActivityIcon');
export const HeartIcon = wrapHealthicon(HeartOrgan, 'HeartIcon');
export const HeartPulseIcon = wrapHealthicon(HeartCardiogram, 'HeartPulseIcon');
export const StethoscopeIcon = wrapHealthicon(HStethoscope, 'StethoscopeIcon');
export const BrainIcon = wrapHealthicon(Neurology, 'BrainIcon');
export const PillIcon = wrapHealthicon(Medicines, 'PillIcon');
export const ThermometerIcon = wrapHealthicon(HThermometer, 'ThermometerIcon');
export const ScaleIcon = wrapHealthicon(Weight, 'ScaleIcon');
export const DropletsIcon = wrapHealthicon(BloodDrop, 'DropletsIcon');
export const RespiratoryIcon = wrapHealthicon(Lungs, 'RespiratoryIcon');
export const NurseIcon = wrapHealthicon(Nurse, 'NurseIcon');
export const HealthWorkerIcon = wrapHealthicon(HealthWorker, 'HealthWorkerIcon');
export const MedicalRecordsIcon = wrapHealthicon(MedicalRecords, 'MedicalRecordsIcon');
export const HospitalIcon = wrapHealthicon(HHospital, 'HospitalIcon');
