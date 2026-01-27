/**
 * RiskIndicatorBadge Component
 * 
 * Displays a colored badge indicating the risk level for clinical assessments.
 * Used across all 8 clinical scales to provide visual risk indicators.
 * 
 * @component
 */

import React from 'react';
import type { RiskLevel } from '../../types/clinical-scales';

interface RiskIndicatorBadgeProps {
  /** Risk level (none, low, moderate, high, critical) */
  riskLevel: RiskLevel;
  /** Optional scale type for context */
  scaleType?: string;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Get Tailwind color classes for risk levels.
 */
const getRiskColorClasses = (level: RiskLevel): string => {
  switch (level) {
    case 'critical':
      return 'bg-red-500 text-white ring-red-600';
    case 'high':
      return 'bg-orange-500 text-white ring-orange-600';
    case 'moderate':
      return 'bg-yellow-500 text-white ring-yellow-600';
    case 'low':
      return 'bg-green-500 text-white ring-green-600';
    case 'none':
      return 'bg-gray-100 text-gray-700 ring-gray-300';
    default:
      return 'bg-gray-100 text-gray-700 ring-gray-300';
  }
};

/**
 * Get human-readable label for risk level (Spanish).
 */
const getRiskLabel = (level: RiskLevel): string => {
  switch (level) {
    case 'critical':
      return 'Crítico';
    case 'high':
      return 'Alto';
    case 'moderate':
      return 'Moderado';
    case 'low':
      return 'Bajo';
    case 'none':
      return 'Sin Riesgo';
    default:
      return 'Desconocido';
  }
};

/**
 * RiskIndicatorBadge - Visual indicator for clinical assessment risk levels.
 */
export const RiskIndicatorBadge: React.FC<RiskIndicatorBadgeProps> = ({
  riskLevel,
  scaleType,
  className = '',
}) => {
  const colorClasses = getRiskColorClasses(riskLevel);
  const label = getRiskLabel(riskLevel);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${colorClasses} ${className}`}
      title={scaleType ? `${scaleType}: ${label}` : label}
    >
      {/* Risk indicator dot */}
      <span
        className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-75"
        aria-hidden="true"
      />
      {label}
    </span>
  );
};

export default RiskIndicatorBadge;
