/**
 * AssessmentHistory Component
 * 
 * Timeline view of a patient's clinical assessments with trend analysis.
 * Features:
 * - Chronological timeline of all assessments
 * - Score trends over time
 * - Filter by scale type
 * - Visual indicators for improving/stable/declining trends
 * 
 * @component
 */

import React, { useState, useMemo, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { isDemoMode } from '@/amplify-utils';
import { RiskIndicatorBadge } from './RiskIndicatorBadge';
import {
  PatientAssessment,
  getGlasgowRiskLevel,
  getBradenRiskLevel,
  getMorseRiskLevel,
  getNEWSRiskLevel,
  getBarthelRiskLevel,
  getNortonRiskLevel,
} from '@/types/clinical-scales';

const client = generateClient<Schema>();

interface AssessmentHistoryProps {
  /** Patient ID to fetch assessments for */
  patientId: string;
  /** Optional filter for scale type */
  filterScale?: ScaleType | 'all';
  /** Callback when assessment is clicked */
  onAssessmentClick?: (assessment: PatientAssessment) => void;
}

type ScaleType = 
  | 'glasgow'
  | 'pain'
  | 'braden'
  | 'morse'
  | 'news'
  | 'barthel'
  | 'norton'
  | 'rass';

type TrendDirection = 'improving' | 'stable' | 'declining';

/**
 * Calculate trend direction by comparing current and previous scores.
 * For scales where lower is better (Braden, Norton): decreasing = declining
 * For scales where higher is better (Glasgow, Barthel): decreasing = declining
 */
function calculateTrend(
  current: number,
  previous: number,
  scaleType: ScaleType
): TrendDirection {
  const diff = current - previous;
  const threshold = 2; // Minimum difference to consider a trend

  // Scales where lower scores are worse
  const lowerIsBetter: ScaleType[] = ['morse', 'news', 'pain', 'rass'];
  
  // Scales where lower scores are worse (inverse)
  const higherIsBetter: ScaleType[] = ['glasgow', 'barthel'];
  
  // Scales where higher scores are better (pressure sore risk)
  const higherIsBetterPressure: ScaleType[] = ['braden', 'norton'];

  if (Math.abs(diff) < threshold) {
    return 'stable';
  }

  if (lowerIsBetter.includes(scaleType)) {
    return diff < 0 ? 'improving' : 'declining';
  }

  if (higherIsBetter.includes(scaleType)) {
    return diff > 0 ? 'improving' : 'declining';
  }

  if (higherIsBetterPressure.includes(scaleType)) {
    return diff > 0 ? 'improving' : 'declining';
  }

  return 'stable';
}

/**
 * Get trend icon and color classes.
 */
function getTrendIndicator(trend: TrendDirection): {
  icon: string;
  color: string;
  label: string;
} {
  switch (trend) {
    case 'improving':
      return {
        icon: '↑',
        color: 'text-green-600 bg-green-50',
        label: 'Mejorando',
      };
    case 'declining':
      return {
        icon: '↓',
        color: 'text-red-600 bg-red-50',
        label: 'Empeorando',
      };
    case 'stable':
    default:
      return {
        icon: '→',
        color: 'text-gray-600 bg-gray-50',
        label: 'Estable',
      };
  }
}

/**
 * Format date for display (Spanish).
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * AssessmentHistory - Timeline view of patient assessments.
 */
export const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({
  patientId,
  filterScale = 'all',
  onAssessmentClick,
}) => {
  const [selectedScale, setSelectedScale] = useState<ScaleType | 'all'>(filterScale);
  const [assessments, setAssessments] = useState<PatientAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch assessments from backend
  useEffect(() => {
    const fetchAssessments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isDemoMode()) {
          // Demo mode: Use mock client (will auto-return demo data)
          const { data } = await client.models.PatientAssessment.list({
            filter: { patientId: { eq: patientId } },
          });
          setAssessments((data || []) as PatientAssessment[]);
        } else {
          // Real backend: Fetch from GraphQL
          const { data } = await client.models.PatientAssessment.list({
            filter: { patientId: { eq: patientId } },
          });
          setAssessments((data || []) as PatientAssessment[]);
        }
      } catch (err) {
        console.error('Error fetching assessments:', err);
        setError('Error al cargar el historial de evaluaciones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [patientId]);

  // Sort assessments by date (newest first)
  const sortedAssessments = useMemo(() => {
    return [...assessments].sort(
      (a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
    );
  }, [assessments]);

  // Filter scales to show
  const scaleFilters: Array<{ value: ScaleType | 'all'; label: string }> = [
    { value: 'all', label: 'Todas las Escalas' },
    { value: 'glasgow', label: 'Glasgow' },
    { value: 'pain', label: 'Dolor' },
    { value: 'braden', label: 'Braden' },
    { value: 'morse', label: 'Morse' },
    { value: 'news', label: 'NEWS' },
    { value: 'barthel', label: 'Barthel' },
    { value: 'norton', label: 'Norton' },
    { value: 'rass', label: 'RASS' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (sortedAssessments.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin Evaluaciones</h3>
        <p className="mt-1 text-sm text-gray-500">
          No hay evaluaciones clínicas registradas para este paciente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Historial de Evaluaciones
        </h3>
        <div className="w-full sm:w-auto">
          <select
            value={selectedScale}
            onChange={(e) => setSelectedScale(e.target.value as ScaleType | 'all')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            {scaleFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="flow-root">
        <ul className="-mb-8">
          {sortedAssessments.map((assessment, assessmentIdx) => {
            const previousAssessment = sortedAssessments[assessmentIdx + 1];

            return (
              <li key={assessment.id}>
                <div className="relative pb-8">
                  {/* Timeline connector */}
                  {assessmentIdx !== sortedAssessments.length - 1 && (
                    <span
                      className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}

                  <div className="relative flex space-x-3">
                    {/* Timeline dot */}
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <svg
                          className="h-5 w-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>

                    {/* Assessment Card */}
                    <div
                      className="flex-1 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onAssessmentClick?.(assessment)}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(assessment.assessedAt)}
                        </p>
                        {assessment.alerts && assessment.alerts.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            {assessment.alerts.length} alerta{assessment.alerts.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Scores Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Glasgow */}
                        {(selectedScale === 'all' || selectedScale === 'glasgow') &&
                          assessment.glasgowScore && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Glasgow</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {assessment.glasgowScore.total}/15
                                </span>
                                {previousAssessment?.glasgowScore && (
                                  <TrendBadge
                                    trend={calculateTrend(
                                      assessment.glasgowScore.total,
                                      previousAssessment.glasgowScore.total,
                                      'glasgow'
                                    )}
                                  />
                                )}
                              </div>
                              <RiskIndicatorBadge
                                riskLevel={getGlasgowRiskLevel(assessment.glasgowScore.total)}
                                className="mt-1"
                              />
                            </div>
                          )}

                        {/* Pain */}
                        {(selectedScale === 'all' || selectedScale === 'pain') &&
                          assessment.painScore !== null &&
                          assessment.painScore !== undefined && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Dolor</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {assessment.painScore}/10
                                </span>
                                {previousAssessment?.painScore !== null &&
                                  previousAssessment?.painScore !== undefined && (
                                    <TrendBadge
                                      trend={calculateTrend(
                                        assessment.painScore,
                                        previousAssessment.painScore,
                                        'pain'
                                      )}
                                    />
                                  )}
                              </div>
                            </div>
                          )}

                        {/* Braden */}
                        {(selectedScale === 'all' || selectedScale === 'braden') &&
                          assessment.bradenScore && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Braden</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {assessment.bradenScore.total}/23
                                </span>
                                {previousAssessment?.bradenScore && (
                                  <TrendBadge
                                    trend={calculateTrend(
                                      assessment.bradenScore.total,
                                      previousAssessment.bradenScore.total,
                                      'braden'
                                    )}
                                  />
                                )}
                              </div>
                              <RiskIndicatorBadge
                                riskLevel={getBradenRiskLevel(assessment.bradenScore.total)}
                                className="mt-1"
                              />
                            </div>
                          )}

                        {/* Morse */}
                        {(selectedScale === 'all' || selectedScale === 'morse') &&
                          assessment.morseScore && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Morse</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {assessment.morseScore.total}/125
                                </span>
                                {previousAssessment?.morseScore && (
                                  <TrendBadge
                                    trend={calculateTrend(
                                      assessment.morseScore.total,
                                      previousAssessment.morseScore.total,
                                      'morse'
                                    )}
                                  />
                                )}
                              </div>
                              <RiskIndicatorBadge
                                riskLevel={getMorseRiskLevel(assessment.morseScore.total)}
                                className="mt-1"
                              />
                            </div>
                          )}

                        {/* NEWS */}
                        {(selectedScale === 'all' || selectedScale === 'news') &&
                          assessment.newsScore && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">NEWS</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {assessment.newsScore.total}/20
                                </span>
                                {previousAssessment?.newsScore && (
                                  <TrendBadge
                                    trend={calculateTrend(
                                      assessment.newsScore.total,
                                      previousAssessment.newsScore.total,
                                      'news'
                                    )}
                                  />
                                )}
                              </div>
                              <RiskIndicatorBadge
                                riskLevel={getNEWSRiskLevel(assessment.newsScore.total)}
                                className="mt-1"
                              />
                            </div>
                          )}

                        {/* Barthel */}
                        {(selectedScale === 'all' || selectedScale === 'barthel') &&
                          assessment.barthelScore && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Barthel</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {assessment.barthelScore.total}/100
                                </span>
                                {previousAssessment?.barthelScore && (
                                  <TrendBadge
                                    trend={calculateTrend(
                                      assessment.barthelScore.total,
                                      previousAssessment.barthelScore.total,
                                      'barthel'
                                    )}
                                  />
                                )}
                              </div>
                              <RiskIndicatorBadge
                                riskLevel={getBarthelRiskLevel(assessment.barthelScore.total)}
                                className="mt-1"
                              />
                            </div>
                          )}

                        {/* Norton */}
                        {(selectedScale === 'all' || selectedScale === 'norton') &&
                          assessment.nortonScore && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Norton</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {assessment.nortonScore.total}/20
                                </span>
                                {previousAssessment?.nortonScore && (
                                  <TrendBadge
                                    trend={calculateTrend(
                                      assessment.nortonScore.total,
                                      previousAssessment.nortonScore.total,
                                      'norton'
                                    )}
                                  />
                                )}
                              </div>
                              <RiskIndicatorBadge
                                riskLevel={getNortonRiskLevel(assessment.nortonScore.total)}
                                className="mt-1"
                              />
                            </div>
                          )}

                        {/* RASS */}
                        {(selectedScale === 'all' || selectedScale === 'rass') &&
                          assessment.rassScore !== null &&
                          assessment.rassScore !== undefined && (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">RASS</span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-semibold text-gray-900">
                                  {assessment.rassScore > 0 ? '+' : ''}
                                  {assessment.rassScore}
                                </span>
                                {previousAssessment?.rassScore !== null &&
                                  previousAssessment?.rassScore !== undefined && (
                                    <TrendBadge
                                      trend={calculateTrend(
                                        assessment.rassScore,
                                        previousAssessment.rassScore,
                                        'rass'
                                      )}
                                    />
                                  )}
                              </div>
                            </div>
                          )}
                      </div>

                      {/* Alerts */}
                      {assessment.alerts && assessment.alerts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-700 mb-2">Alertas:</p>
                          <div className="space-y-1">
                            {assessment.alerts.map((alert, idx) => (
                              <div
                                key={idx}
                                className={`text-xs px-2 py-1 rounded ${
                                  alert.level === 'CRITICAL'
                                    ? 'bg-red-50 text-red-700'
                                    : alert.level === 'WARNING'
                                    ? 'bg-orange-50 text-orange-700'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                <strong>{alert.scale}:</strong> {alert.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {assessment.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-600 italic">"{assessment.notes}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

/**
 * TrendBadge - Shows trend indicator (improving/stable/declining).
 */
const TrendBadge: React.FC<{ trend: TrendDirection }> = ({ trend }) => {
  const indicator = getTrendIndicator(trend);

  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${indicator.color}`}
      title={indicator.label}
    >
      {indicator.icon}
    </span>
  );
};

export default AssessmentHistory;
