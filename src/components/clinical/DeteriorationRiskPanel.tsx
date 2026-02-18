import React from 'react';

interface DeteriorationRisk {
    type: string;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    description: string;
    affectedScales: string[];
    recommendedActions: string[];
}

interface Correlation {
    scales: string[];
    pattern: string;
}

interface TrendInfo {
    scale: string;
    direction: 'improving' | 'stable' | 'worsening';
    latestValue: number;
    delta: number;
    pointCount: number;
}

export interface DeteriorationAnalysis {
    hasRisk: boolean;
    overallRiskLevel: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    confidence: number;
    predictedTimeToThreshold?: string | null;
    risks: DeteriorationRisk[];
    correlations: Correlation[];
    summary: string;
    patientName?: string;
    assessmentCount?: number;
    vitalsCount?: number;
    analyzedAt?: string;
    trends?: TrendInfo[];
    error?: string;
}

interface DeteriorationRiskPanelProps {
    analysis: DeteriorationAnalysis;
    onDismiss: () => void;
}

const RISK_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    NONE: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-100 text-green-800' },
    LOW: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-800' },
    MODERATE: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' },
    HIGH: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-100 text-orange-800' },
    CRITICAL: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-800' },
};

const SEVERITY_LABELS: Record<string, string> = {
    NONE: 'Sin Riesgo',
    LOW: 'Bajo',
    MODERATE: 'Moderado',
    HIGH: 'Alto',
    CRITICAL: 'Critico',
};

const DIRECTION_ICONS: Record<string, { icon: string; color: string }> = {
    improving: { icon: '\u2193', color: 'text-green-600' },
    stable: { icon: '\u2192', color: 'text-slate-500' },
    worsening: { icon: '\u2191', color: 'text-red-600' },
};

export const DeteriorationRiskPanel: React.FC<DeteriorationRiskPanelProps> = ({ analysis, onDismiss }) => {
    const riskColor = RISK_COLORS[analysis.overallRiskLevel] || RISK_COLORS.NONE;
    const confidencePercent = Math.round((analysis.confidence || 0) * 100);

    return (
        <div className={`rounded-xl border-2 ${riskColor.border} ${riskColor.bg} p-4 space-y-4`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${riskColor.badge}`}>
                        {SEVERITY_LABELS[analysis.overallRiskLevel] || analysis.overallRiskLevel}
                    </span>
                    {confidencePercent > 0 && (
                        <span className="text-sm text-slate-500">
                            Confianza: {confidencePercent}%
                        </span>
                    )}
                    {analysis.predictedTimeToThreshold && (
                        <span className="text-sm text-slate-600 font-medium">
                            Tiempo estimado: {analysis.predictedTimeToThreshold}
                        </span>
                    )}
                </div>
                <button
                    onClick={onDismiss}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-white/50 transition-colors"
                    aria-label="Cerrar"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Summary */}
            <p className={`text-sm font-medium ${riskColor.text}`}>
                {analysis.summary}
            </p>

            {/* Error state */}
            {analysis.error && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">Error: {analysis.error}</p>
                </div>
            )}

            {/* Trends */}
            {analysis.trends && analysis.trends.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Tendencias ({analysis.assessmentCount} evaluaciones, {analysis.vitalsCount} registros de signos vitales)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {analysis.trends.map((trend) => {
                            const dir = DIRECTION_ICONS[trend.direction] || DIRECTION_ICONS.stable;
                            return (
                                <div key={trend.scale} className="bg-white/70 rounded-lg px-3 py-2 text-center">
                                    <p className="text-xs text-slate-500 truncate">{trend.scale}</p>
                                    <p className="text-lg font-bold text-slate-800">{trend.latestValue}</p>
                                    <p className={`text-xs font-medium ${dir.color}`}>
                                        {dir.icon} {trend.delta > 0 ? '+' : ''}{trend.delta}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Risk cards */}
            {analysis.risks && analysis.risks.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Riesgos Detectados</h4>
                    <div className="space-y-2">
                        {analysis.risks.map((risk, i) => {
                            const sevColor = RISK_COLORS[risk.severity] || RISK_COLORS.LOW;
                            return (
                                <div key={i} className="bg-white/80 rounded-lg p-3 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${sevColor.badge}`}>
                                            {risk.severity}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800">{risk.type}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-2">{risk.description}</p>
                                    {risk.affectedScales.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {risk.affectedScales.map((scale) => (
                                                <span key={scale} className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                                    {scale}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {risk.recommendedActions.length > 0 && (
                                        <ul className="list-disc list-inside text-xs text-slate-500 space-y-0.5">
                                            {risk.recommendedActions.map((action, j) => (
                                                <li key={j}>{action}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Correlations */}
            {analysis.correlations && analysis.correlations.length > 0 && (
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Correlaciones Detectadas</h4>
                    <div className="space-y-2">
                        {analysis.correlations.map((corr, i) => (
                            <div key={i} className="bg-white/70 rounded-lg p-3 border border-slate-100">
                                <div className="flex flex-wrap gap-1 mb-1">
                                    {corr.scales.map((scale) => (
                                        <span key={scale} className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                                            {scale}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600">{corr.pattern}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            {analysis.analyzedAt && (
                <p className="text-xs text-slate-400 text-right">
                    Analizado: {new Date(analysis.analyzedAt).toLocaleString('es-CO')}
                </p>
            )}
        </div>
    );
};
