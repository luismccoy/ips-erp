/**
 * AssessmentTrendChart Component
 * 
 * Displays historical trends of clinical assessment scores over time.
 * Shows improvement/decline with visual indicators.
 */

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity } from 'lucide-react';
import { client } from '../amplify-utils';
import type { PatientAssessment } from '../types/clinical-scales';

interface AssessmentTrendChartProps {
  patientId: string;
  patientName?: string;
  scale?: 'all' | 'glasgow' | 'pain' | 'braden' | 'morse' | 'news' | 'barthel' | 'norton';
  daysBack?: number;
}

interface ScaleConfig {
  key: string;
  label: string;
  maxScore: number;
  higherIsBetter: boolean;
  color: string;
  getScore: (a: PatientAssessment) => number | null;
}

const SCALE_CONFIGS: ScaleConfig[] = [
  { key: 'glasgow', label: 'Glasgow', maxScore: 15, higherIsBetter: true, color: '#6366f1', getScore: a => a.glasgowScore?.total ?? null },
  { key: 'pain', label: 'Dolor', maxScore: 10, higherIsBetter: false, color: '#ef4444', getScore: a => a.painScore ?? null },
  { key: 'braden', label: 'Braden', maxScore: 23, higherIsBetter: true, color: '#22c55e', getScore: a => a.bradenScore?.total ?? null },
  { key: 'morse', label: 'Morse', maxScore: 125, higherIsBetter: false, color: '#f59e0b', getScore: a => a.morseScore?.total ?? null },
  { key: 'news', label: 'NEWS', maxScore: 20, higherIsBetter: false, color: '#ec4899', getScore: a => a.newsScore?.total ?? null },
  { key: 'barthel', label: 'Barthel', maxScore: 100, higherIsBetter: true, color: '#3b82f6', getScore: a => a.barthelScore?.total ?? null },
  { key: 'norton', label: 'Norton', maxScore: 20, higherIsBetter: true, color: '#14b8a6', getScore: a => a.nortonScore?.total ?? null },
];

function TrendIndicator({ current, previous, higherIsBetter }: { current: number; previous: number; higherIsBetter: boolean }) {
  const diff = current - previous;
  const isImproving = higherIsBetter ? diff > 0 : diff < 0;
  const isWorsening = higherIsBetter ? diff < 0 : diff > 0;
  
  if (diff === 0) {
    return <Minus size={16} className="text-gray-400" />;
  }
  
  if (isImproving) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <TrendingUp size={16} />
        <span className="text-xs font-medium">Mejorando</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1 text-red-600">
      <TrendingDown size={16} />
      <span className="text-xs font-medium">Empeorando</span>
    </div>
  );
}

function MiniChart({ data, maxScore, color }: { data: number[]; maxScore: number; color: string }) {
  if (data.length < 2) return null;
  
  const width = 120;
  const height = 40;
  const padding = 4;
  
  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
    const y = height - padding - (value / maxScore) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - (value / maxScore) * (height - 2 * padding);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

export function AssessmentTrendChart({
  patientId,
  patientName,
  scale = 'all',
  daysBack = 30
}: AssessmentTrendChartProps) {
  const [assessments, setAssessments] = useState<PatientAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScale, setSelectedScale] = useState<string>(scale === 'all' ? 'morse' : scale);

  useEffect(() => {
    loadAssessments();
  }, [patientId, daysBack]);

  async function loadAssessments() {
    setLoading(true);
    try {
      const response = await client.models.PatientAssessment.list({
        filter: { patientId: { eq: patientId } }
      });
      
      // Sort by date ascending for trend display
      const sorted = [...response.data].sort((a, b) => 
        new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime()
      );
      
      // Filter to daysBack
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysBack);
      const filtered = sorted.filter(a => new Date(a.assessedAt) >= cutoff);
      
      setAssessments(filtered);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  }

  const trendData = useMemo(() => {
    return SCALE_CONFIGS.map(config => {
      const scores = assessments
        .map(a => config.getScore(a))
        .filter((s): s is number => s !== null);
      
      const current = scores[scores.length - 1];
      const previous = scores.length > 1 ? scores[scores.length - 2] : current;
      
      return {
        ...config,
        scores,
        current,
        previous,
        hasData: scores.length > 0,
      };
    });
  }, [assessments]);

  const selectedConfig = trendData.find(t => t.key === selectedScale);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (assessments.length < 2) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <Activity className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin Datos de Tendencia</h3>
        <p className="mt-1 text-sm text-gray-500">
          {assessments.length === 0
            ? 'No hay valoraciones registradas para este paciente.'
            : 'Se necesita al menos 1 valoración adicional para mostrar tendencias.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {patientName && <h3 className="font-semibold text-gray-900">{patientName}</h3>}
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar size={14} />
            Últimos {daysBack} días • {assessments.length} valoraciones
          </p>
        </div>
      </div>

      {/* Scale Selector */}
      {scale === 'all' && (
        <div className="flex flex-wrap gap-2">
          {trendData.filter(t => t.hasData).map(t => (
            <button
              key={t.key}
              onClick={() => setSelectedScale(t.key)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedScale === t.key
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={selectedScale === t.key ? { backgroundColor: t.color } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Selected Scale Detail */}
      {selectedConfig && selectedConfig.hasData && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900">{selectedConfig.label}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold" style={{ color: selectedConfig.color }}>
                  {selectedConfig.current}
                </span>
                <span className="text-sm text-gray-500">/ {selectedConfig.maxScore}</span>
                {selectedConfig.scores.length > 1 && (
                  <TrendIndicator
                    current={selectedConfig.current!}
                    previous={selectedConfig.previous!}
                    higherIsBetter={selectedConfig.higherIsBetter}
                  />
                )}
              </div>
            </div>
            <MiniChart
              data={selectedConfig.scores}
              maxScore={selectedConfig.maxScore}
              color={selectedConfig.color}
            />
          </div>
          
          {/* Score History */}
          <div className="border-t pt-3">
            <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Historial</h5>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {assessments.map((a, i) => {
                const score = selectedConfig.getScore(a);
                if (score === null) return null;
                return (
                  <div
                    key={a.id}
                    className="flex-shrink-0 text-center p-2 bg-gray-50 rounded-lg min-w-[60px]"
                  >
                    <div className="text-lg font-bold" style={{ color: selectedConfig.color }}>
                      {score}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(a.assessedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* All Scales Summary */}
      {scale === 'all' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {trendData.filter(t => t.hasData && t.key !== selectedScale).map(t => (
            <button
              key={t.key}
              onClick={() => setSelectedScale(t.key)}
              className="p-3 bg-white border rounded-lg hover:border-gray-300 transition-colors text-left"
            >
              <div className="text-xs text-gray-500 mb-1">{t.label}</div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold" style={{ color: t.color }}>
                  {t.current}/{t.maxScore}
                </span>
                {t.scores.length > 1 && (
                  <TrendIndicator
                    current={t.current!}
                    previous={t.previous!}
                    higherIsBetter={t.higherIsBetter}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssessmentTrendChart;
