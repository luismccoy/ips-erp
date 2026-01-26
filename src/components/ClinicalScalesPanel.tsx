/**
 * ClinicalScalesPanel Component
 * 
 * Displays clinical assessment scales for a patient with risk indicators.
 * Used in both Admin Dashboard (read-only) and Nurse App (entry/edit).
 * 
 * Scales displayed:
 * - Glasgow (GCS) - Consciousness
 * - Pain (EVA) - Pain intensity
 * - Braden - Pressure ulcer risk
 * - Morse - Fall risk
 * - NEWS - Early warning
 * - Barthel - ADL independence
 * - Norton - Pressure sore risk
 * - RASS - Sedation/agitation
 */

import { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, Brain, Heart, Shield, 
  TrendingDown, TrendingUp, Minus, Clock, User,
  ChevronDown, ChevronUp, FileText, BarChart3
} from 'lucide-react';
import { AssessmentTrendChart } from './AssessmentTrendChart';
import { client } from '../amplify-utils';
import type { 
  PatientAssessment, 
  AssessmentAlert,
  RiskLevel 
} from '../types/clinical-scales';
import {
  getBradenRiskLevel,
  getMorseRiskLevel,
  getNEWSRiskLevel,
  getBarthelRiskLevel,
  getNortonRiskLevel,
  RASS_LEVELS
} from '../types/clinical-scales';

// ============================================================================
// Types
// ============================================================================

interface ClinicalScalesPanelProps {
  patientId: string;
  patientName?: string;
  showHistory?: boolean;
  showTrends?: boolean;
  compact?: boolean;
  onAssessmentClick?: (assessment: PatientAssessment) => void;
}

// ============================================================================
// Risk Badge Component
// ============================================================================

function RiskBadge({ level, label }: { level: RiskLevel; label?: string }) {
  const colors: Record<RiskLevel, string> = {
    none: 'bg-green-100 text-green-800 border-green-200',
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    critical: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels: Record<RiskLevel, string> = {
    none: 'Sin Riesgo',
    low: 'Bajo',
    moderate: 'Moderado',
    high: 'Alto',
    critical: 'Crítico',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colors[level]}`}>
      {label || labels[level]}
    </span>
  );
}

// ============================================================================
// Scale Card Component
// ============================================================================

interface ScaleCardProps {
  title: string;
  icon: React.ReactNode;
  score: number | string;
  maxScore: number | string;
  riskLevel: RiskLevel;
  details?: React.ReactNode;
  compact?: boolean;
}

function ScaleCard({ title, icon, score, maxScore, riskLevel, details, compact }: ScaleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const riskColors: Record<RiskLevel, string> = {
    none: 'border-l-green-500',
    low: 'border-l-blue-500',
    moderate: 'border-l-yellow-500',
    high: 'border-l-orange-500',
    critical: 'border-l-red-500',
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-2 bg-white rounded border-l-4 ${riskColors[riskLevel]}`}>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{icon}</span>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{score}/{maxScore}</span>
          <RiskBadge level={riskLevel} />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${riskColors[riskLevel]} overflow-hidden`}>
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => details && setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
            {icon}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{title}</h4>
            <p className="text-2xl font-bold text-gray-900">
              {score}<span className="text-sm font-normal text-gray-500">/{maxScore}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RiskBadge level={riskLevel} />
          {details && (
            <button className="p-1 text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>
      {expanded && details && (
        <div className="px-3 pb-3 pt-0 border-t bg-gray-50">
          {details}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Alert Banner Component
// ============================================================================

function AlertBanner({ alerts }: { alerts: AssessmentAlert[] }) {
  if (!alerts || alerts.length === 0) return null;

  const criticalAlerts = alerts.filter(a => a.level === 'CRITICAL');
  const warningAlerts = alerts.filter(a => a.level === 'WARNING');

  return (
    <div className="space-y-2 mb-4">
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5\" size={18} />
            <div>
              <h4 className="font-semibold text-red-800">Alertas Críticas</h4>
              <ul className="mt-1 space-y-1">
                {criticalAlerts.map((alert, i) => (
                  <li key={i} className="text-sm text-red-700">• {alert.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {warningAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="font-semibold text-yellow-800">Advertencias</h4>
              <ul className="mt-1 space-y-1">
                {warningAlerts.map((alert, i) => (
                  <li key={i} className="text-sm text-yellow-700">• {alert.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ClinicalScalesPanel({ 
  patientId, 
  patientName,
  showHistory = false,
  showTrends = false,
  compact = false,
  onAssessmentClick
}: ClinicalScalesPanelProps) {
  const [assessments, setAssessments] = useState<PatientAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeView, setActiveView] = useState<'scales' | 'trends'>('scales');

  useEffect(() => {
    loadAssessments();
  }, [patientId]);

  async function loadAssessments() {
    setLoading(true);
    try {
      const response = await client.models.PatientAssessment.list({
        filter: { patientId: { eq: patientId } }
      });
      // Sort by date descending (most recent first)
      const sorted = [...response.data].sort((a, b) => 
        new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
      );
      setAssessments(sorted);
    } catch (error) {
      console.error('Error loading assessments:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin Valoraciones</h3>
        <p className="mt-1 text-sm text-gray-500">
          No hay escalas de valoración registradas para este paciente.
        </p>
      </div>
    );
  }

  const currentAssessment = assessments[selectedIndex];
  const assessmentDate = new Date(currentAssessment.assessedAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate risk levels for current assessment
  const bradenRisk = currentAssessment.bradenScore 
    ? getBradenRiskLevel(currentAssessment.bradenScore.total) 
    : 'none';
  const morseRisk = currentAssessment.morseScore 
    ? getMorseRiskLevel(currentAssessment.morseScore.total) 
    : 'none';
  const newsRisk = currentAssessment.newsScore 
    ? getNEWSRiskLevel(currentAssessment.newsScore.total) 
    : 'none';
  const barthelRisk = currentAssessment.barthelScore 
    ? getBarthelRiskLevel(currentAssessment.barthelScore.total) 
    : 'none';
  const nortonRisk = currentAssessment.nortonScore 
    ? getNortonRiskLevel(currentAssessment.nortonScore.total) 
    : 'none';

  // Pain risk
  const painRisk: RiskLevel = !currentAssessment.painScore ? 'none' 
    : currentAssessment.painScore <= 3 ? 'low'
    : currentAssessment.painScore <= 6 ? 'moderate'
    : 'critical';

  // Glasgow risk
  const glasgowRisk: RiskLevel = !currentAssessment.glasgowScore ? 'none'
    : currentAssessment.glasgowScore.total >= 13 ? 'low'
    : currentAssessment.glasgowScore.total >= 9 ? 'high'
    : 'critical';

  // RASS risk
  const rassRisk: RiskLevel = currentAssessment.rassScore === null || currentAssessment.rassScore === undefined ? 'none'
    : currentAssessment.rassScore === 0 ? 'none'
    : Math.abs(currentAssessment.rassScore) <= 1 ? 'low'
    : Math.abs(currentAssessment.rassScore) <= 2 ? 'moderate'
    : 'critical';

  return (
    <div className="space-y-4">
      {/* Header with tabs */}
      <div className="flex items-center justify-between">
        <div>
          {patientName && (
            <h3 className="text-lg font-semibold text-gray-900">{patientName}</h3>
          )}
          {activeView === 'scales' && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              <span>{assessmentDate}</span>
              {assessments.length > 1 && (
                <span className="text-gray-400">
                  ({selectedIndex + 1} de {assessments.length})
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showTrends && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('scales')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeView === 'scales' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Escalas
              </button>
              <button
                onClick={() => setActiveView('trends')}
                className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                  activeView === 'trends' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                <BarChart3 size={14} />
                Tendencias
              </button>
            </div>
          )}
          {showHistory && assessments.length > 1 && activeView === 'scales' && (
            <>
              <button
                onClick={() => setSelectedIndex(Math.min(selectedIndex + 1, assessments.length - 1))}
                disabled={selectedIndex >= assessments.length - 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <TrendingDown size={18} />
              </button>
              <button
                onClick={() => setSelectedIndex(Math.max(selectedIndex - 1, 0))}
                disabled={selectedIndex === 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <TrendingUp size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Trends View */}
      {activeView === 'trends' && (
        <AssessmentTrendChart patientId={patientId} patientName={patientName} daysBack={30} />
      )}

      {/* Scales View */}
      {activeView === 'scales' && (
        <>

      {/* Alerts */}
      <AlertBanner alerts={currentAssessment.alerts || []} />

      {/* Scale Cards Grid */}
      <div className={compact ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
        {/* Glasgow */}
        {currentAssessment.glasgowScore && (
          <ScaleCard
            title="Glasgow (GCS)"
            icon={<Brain size={20} />}
            score={currentAssessment.glasgowScore.total}
            maxScore={15}
            riskLevel={glasgowRisk}
            compact={compact}
            details={
              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-medium">Ocular</div>
                  <div className="text-lg font-bold">{currentAssessment.glasgowScore.eye}</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-medium">Verbal</div>
                  <div className="text-lg font-bold">{currentAssessment.glasgowScore.verbal}</div>
                </div>
                <div className="text-center p-2 bg-white rounded">
                  <div className="font-medium">Motor</div>
                  <div className="text-lg font-bold">{currentAssessment.glasgowScore.motor}</div>
                </div>
              </div>
            }
          />
        )}

        {/* Pain (EVA) */}
        {currentAssessment.painScore !== null && currentAssessment.painScore !== undefined && (
          <ScaleCard
            title="Dolor (EVA)"
            icon={<Activity size={20} />}
            score={currentAssessment.painScore}
            maxScore={10}
            riskLevel={painRisk}
            compact={compact}
          />
        )}

        {/* Braden */}
        {currentAssessment.bradenScore && (
          <ScaleCard
            title="Braden (Úlceras)"
            icon={<Shield size={20} />}
            score={currentAssessment.bradenScore.total}
            maxScore={23}
            riskLevel={bradenRisk}
            compact={compact}
            details={
              <div className="grid grid-cols-3 gap-1 text-xs mt-2">
                <div className="p-1 bg-white rounded text-center">
                  <div className="text-gray-500">Sensorial</div>
                  <div className="font-bold">{currentAssessment.bradenScore.sensoryPerception}</div>
                </div>
                <div className="p-1 bg-white rounded text-center">
                  <div className="text-gray-500">Humedad</div>
                  <div className="font-bold">{currentAssessment.bradenScore.moisture}</div>
                </div>
                <div className="p-1 bg-white rounded text-center">
                  <div className="text-gray-500">Actividad</div>
                  <div className="font-bold">{currentAssessment.bradenScore.activity}</div>
                </div>
                <div className="p-1 bg-white rounded text-center">
                  <div className="text-gray-500">Movilidad</div>
                  <div className="font-bold">{currentAssessment.bradenScore.mobility}</div>
                </div>
                <div className="p-1 bg-white rounded text-center">
                  <div className="text-gray-500">Nutrición</div>
                  <div className="font-bold">{currentAssessment.bradenScore.nutrition}</div>
                </div>
                <div className="p-1 bg-white rounded text-center">
                  <div className="text-gray-500">Fricción</div>
                  <div className="font-bold">{currentAssessment.bradenScore.frictionShear}</div>
                </div>
              </div>
            }
          />
        )}

        {/* Morse */}
        {currentAssessment.morseScore && (
          <ScaleCard
            title="Morse (Caídas)"
            icon={<AlertTriangle size={20} />}
            score={currentAssessment.morseScore.total}
            maxScore={125}
            riskLevel={morseRisk}
            compact={compact}
          />
        )}

        {/* NEWS */}
        {currentAssessment.newsScore && (
          <ScaleCard
            title="NEWS (Alerta Temprana)"
            icon={<Heart size={20} />}
            score={currentAssessment.newsScore.total}
            maxScore={20}
            riskLevel={newsRisk}
            compact={compact}
          />
        )}

        {/* Barthel */}
        {currentAssessment.barthelScore && (
          <ScaleCard
            title="Barthel (Independencia)"
            icon={<User size={20} />}
            score={currentAssessment.barthelScore.total}
            maxScore={100}
            riskLevel={barthelRisk}
            compact={compact}
          />
        )}

        {/* Norton */}
        {currentAssessment.nortonScore && (
          <ScaleCard
            title="Norton (Escaras)"
            icon={<Shield size={20} />}
            score={currentAssessment.nortonScore.total}
            maxScore={20}
            riskLevel={nortonRisk}
            compact={compact}
          />
        )}

        {/* RASS */}
        {currentAssessment.rassScore !== null && currentAssessment.rassScore !== undefined && (
          <ScaleCard
            title="RASS (Sedación)"
            icon={<Minus size={20} />}
            score={currentAssessment.rassScore > 0 ? `+${currentAssessment.rassScore}` : currentAssessment.rassScore}
            maxScore="±4"
            riskLevel={rassRisk}
            compact={compact}
            details={
              <div className="text-xs mt-2 p-2 bg-white rounded">
                {RASS_LEVELS[currentAssessment.rassScore.toString() as keyof typeof RASS_LEVELS] || 'Valor no definido'}
              </div>
            }
          />
        )}
      </div>

      {/* Clinical Notes */}
      {currentAssessment.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-1">Notas Clínicas</h4>
          <p className="text-sm text-gray-600">{currentAssessment.notes}</p>
        </div>
      )}
      </>
      )}
    </div>
  );
}

export default ClinicalScalesPanel;
