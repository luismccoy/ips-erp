/**
 * AssessmentForm Component
 * 
 * Comprehensive form to capture all 8 clinical assessment scales:
 * - Glasgow Coma Scale (GCS)
 * - Pain Scale (EVA)
 * - Braden Scale
 * - Morse Fall Scale
 * - NEWS/NEWS2
 * - Barthel Index
 * - Norton Scale
 * - RASS
 * 
 * Features:
 * - Tabbed interface for each scale
 * - Auto-calculation of composite scores
 * - Real-time risk level indicators
 * - GraphQL mutation integration
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import { RiskIndicatorBadge } from './RiskIndicatorBadge';
import {
  PatientAssessment,
  GlasgowScore,
  BradenScore,
  MorseScore,
  NEWSScore,
  BarthelScore,
  NortonScore,
  calculateGlasgowTotal,
  calculateBradenTotal,
  calculateMorseTotal,
  calculateNEWSTotal,
  calculateBarthelTotal,
  calculateNortonTotal,
  generateAssessmentAlerts,
  getGlasgowRiskLevel,
  getBradenRiskLevel,
  getMorseRiskLevel,
  getNEWSRiskLevel,
  getBarthelRiskLevel,
  getNortonRiskLevel,
  DEFAULT_GLASGOW,
  DEFAULT_BRADEN,
  DEFAULT_MORSE,
  DEFAULT_NEWS,
  DEFAULT_BARTHEL,
  DEFAULT_NORTON,
} from '@/types/clinical-scales';

interface AssessmentFormProps {
  /** Patient ID for this assessment */
  patientId: string;
  /** Nurse ID (current user) */
  nurseId: string;
  /** Optional existing assessment to edit */
  existingAssessment?: Partial<PatientAssessment>;
  /** Callback when assessment is submitted */
  onSubmit: (assessment: Partial<PatientAssessment>) => void | Promise<void>;
  /** Optional callback for cancel */
  onCancel?: () => void;
}

type ScaleTab = 
  | 'glasgow'
  | 'pain'
  | 'braden'
  | 'morse'
  | 'news'
  | 'barthel'
  | 'norton'
  | 'rass';

/**
 * AssessmentForm - Multi-scale clinical assessment form with auto-calculation.
 */
export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  patientId,
  nurseId,
  existingAssessment,
  onSubmit,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<ScaleTab>('glasgow');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state for each scale
  const [glasgowScore, setGlasgowScore] = useState<GlasgowScore>(
    existingAssessment?.glasgowScore || { ...DEFAULT_GLASGOW }
  );
  const [painScore, setPainScore] = useState<number>(
    existingAssessment?.painScore ?? 0
  );
  const [bradenScore, setBradenScore] = useState<BradenScore>(
    existingAssessment?.bradenScore || { ...DEFAULT_BRADEN }
  );
  const [morseScore, setMorseScore] = useState<MorseScore>(
    existingAssessment?.morseScore || { ...DEFAULT_MORSE }
  );
  const [newsScore, setNEWSScore] = useState<NEWSScore>(
    existingAssessment?.newsScore || { ...DEFAULT_NEWS }
  );
  const [barthelScore, setBarthelScore] = useState<BarthelScore>(
    existingAssessment?.barthelScore || { ...DEFAULT_BARTHEL }
  );
  const [nortonScore, setNortonScore] = useState<NortonScore>(
    existingAssessment?.nortonScore || { ...DEFAULT_NORTON }
  );
  const [rassScore, setRassScore] = useState<number>(
    existingAssessment?.rassScore ?? 0
  );
  const [notes, setNotes] = useState<string>(existingAssessment?.notes || '');

  // Auto-calculate totals when component values change
  useEffect(() => {
    setGlasgowScore((prev) => ({
      ...prev,
      total: calculateGlasgowTotal(prev.eye, prev.verbal, prev.motor),
    }));
  }, [glasgowScore.eye, glasgowScore.verbal, glasgowScore.motor]);

  useEffect(() => {
    setBradenScore((prev) => ({ ...prev, total: calculateBradenTotal(prev) }));
  }, [
    bradenScore.sensoryPerception,
    bradenScore.moisture,
    bradenScore.activity,
    bradenScore.mobility,
    bradenScore.nutrition,
    bradenScore.frictionShear,
  ]);

  useEffect(() => {
    setMorseScore((prev) => ({ ...prev, total: calculateMorseTotal(prev) }));
  }, [
    morseScore.historyOfFalling,
    morseScore.secondaryDiagnosis,
    morseScore.ambulatoryAid,
    morseScore.ivHeparinLock,
    morseScore.gait,
    morseScore.mentalStatus,
  ]);

  useEffect(() => {
    setNEWSScore((prev) => ({ ...prev, total: calculateNEWSTotal(prev) }));
  }, [
    newsScore.respirationRate,
    newsScore.oxygenSaturation,
    newsScore.supplementalO2,
    newsScore.temperature,
    newsScore.systolicBP,
    newsScore.heartRate,
    newsScore.consciousness,
  ]);

  useEffect(() => {
    setBarthelScore((prev) => ({ ...prev, total: calculateBarthelTotal(prev) }));
  }, [
    barthelScore.feeding,
    barthelScore.bathing,
    barthelScore.grooming,
    barthelScore.dressing,
    barthelScore.bowels,
    barthelScore.bladder,
    barthelScore.toiletUse,
    barthelScore.transfers,
    barthelScore.mobility,
    barthelScore.stairs,
  ]);

  useEffect(() => {
    setNortonScore((prev) => ({ ...prev, total: calculateNortonTotal(prev) }));
  }, [
    nortonScore.physicalCondition,
    nortonScore.mentalCondition,
    nortonScore.activity,
    nortonScore.mobility,
    nortonScore.incontinence,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const assessment: Partial<PatientAssessment> = {
        patientId,
        nurseId,
        assessedAt: new Date().toISOString(),
        glasgowScore,
        painScore,
        bradenScore,
        morseScore,
        newsScore,
        barthelScore,
        nortonScore,
        rassScore,
        notes,
      };

      // Generate alerts based on scores
      assessment.alerts = generateAssessmentAlerts(assessment);

      await onSubmit(assessment);
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: Array<{ id: ScaleTab; label: string }> = [
    { id: 'glasgow', label: 'Glasgow' },
    { id: 'pain', label: 'Dolor' },
    { id: 'braden', label: 'Braden' },
    { id: 'morse', label: 'Morse' },
    { id: 'news', label: 'NEWS' },
    { id: 'barthel', label: 'Barthel' },
    { id: 'norton', label: 'Norton' },
    { id: 'rass', label: 'RASS' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Scales">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {/* Glasgow Coma Scale */}
        {activeTab === 'glasgow' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Escala de Glasgow (GCS)
              </h3>
              <RiskIndicatorBadge
                riskLevel={getGlasgowRiskLevel(glasgowScore.total)}
                scaleType="Glasgow"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apertura Ocular (1-4)
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={glasgowScore.eye}
                  onChange={(e) =>
                    setGlasgowScore({ ...glasgowScore, eye: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Respuesta Verbal (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={glasgowScore.verbal}
                  onChange={(e) =>
                    setGlasgowScore({ ...glasgowScore, verbal: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Respuesta Motora (1-6)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={glasgowScore.motor}
                  onChange={(e) =>
                    setGlasgowScore({ ...glasgowScore, motor: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Puntaje Total: <span className="text-2xl">{glasgowScore.total}</span> / 15
              </p>
            </div>
          </div>
        )}

        {/* Pain Scale */}
        {activeTab === 'pain' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Escala de Dolor (EVA)
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensidad del Dolor (0-10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={painScore}
                onChange={(e) => setPainScore(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Sin dolor</span>
                <span>Dolor severo</span>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Puntaje: <span className="text-2xl">{painScore}</span> / 10
              </p>
            </div>
          </div>
        )}

        {/* Braden Scale */}
        {activeTab === 'braden' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Escala de Braden (Riesgo de Úlceras)
              </h3>
              <RiskIndicatorBadge
                riskLevel={getBradenRiskLevel(bradenScore.total)}
                scaleType="Braden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'sensoryPerception', label: 'Percepción Sensorial', max: 4 },
                { key: 'moisture', label: 'Humedad', max: 4 },
                { key: 'activity', label: 'Actividad', max: 4 },
                { key: 'mobility', label: 'Movilidad', max: 4 },
                { key: 'nutrition', label: 'Nutrición', max: 4 },
                { key: 'frictionShear', label: 'Fricción/Cizallamiento', max: 3 },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label} (1-{field.max})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={field.max}
                    value={bradenScore[field.key as keyof BradenScore] as number}
                    onChange={(e) =>
                      setBradenScore({
                        ...bradenScore,
                        [field.key]: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Puntaje Total: <span className="text-2xl">{bradenScore.total}</span> / 23
              </p>
            </div>
          </div>
        )}

        {/* Morse Fall Scale */}
        {activeTab === 'morse' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Escala de Morse (Riesgo de Caídas)
              </h3>
              <RiskIndicatorBadge
                riskLevel={getMorseRiskLevel(morseScore.total)}
                scaleType="Morse"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Historial de Caídas
                </label>
                <select
                  value={morseScore.historyOfFalling}
                  onChange={(e) =>
                    setMorseScore({
                      ...morseScore,
                      historyOfFalling: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="0">No (0)</option>
                  <option value="25">Sí (25)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Diagnóstico Secundario
                </label>
                <select
                  value={morseScore.secondaryDiagnosis}
                  onChange={(e) =>
                    setMorseScore({
                      ...morseScore,
                      secondaryDiagnosis: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="0">No (0)</option>
                  <option value="15">Sí (15)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ayuda Ambulatoria
                </label>
                <select
                  value={morseScore.ambulatoryAid}
                  onChange={(e) =>
                    setMorseScore({
                      ...morseScore,
                      ambulatoryAid: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="0">Ninguna/Reposo (0)</option>
                  <option value="15">Muletas/Bastón (15)</option>
                  <option value="30">Muebles (30)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vía IV/Heparina
                </label>
                <select
                  value={morseScore.ivHeparinLock}
                  onChange={(e) =>
                    setMorseScore({
                      ...morseScore,
                      ivHeparinLock: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="0">No (0)</option>
                  <option value="20">Sí (20)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Marcha
                </label>
                <select
                  value={morseScore.gait}
                  onChange={(e) =>
                    setMorseScore({ ...morseScore, gait: parseInt(e.target.value) })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="0">Normal (0)</option>
                  <option value="10">Débil (10)</option>
                  <option value="20">Impedida (20)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Estado Mental
                </label>
                <select
                  value={morseScore.mentalStatus}
                  onChange={(e) =>
                    setMorseScore({
                      ...morseScore,
                      mentalStatus: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="0">Orientado (0)</option>
                  <option value="15">Confuso (15)</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Puntaje Total: <span className="text-2xl">{morseScore.total}</span> / 125
              </p>
            </div>
          </div>
        )}

        {/* NEWS Score */}
        {activeTab === 'news' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                NEWS (Alerta Temprana)
              </h3>
              <RiskIndicatorBadge
                riskLevel={getNEWSRiskLevel(newsScore.total)}
                scaleType="NEWS"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'respirationRate', label: 'Frecuencia Respiratoria' },
                { key: 'oxygenSaturation', label: 'Saturación de Oxígeno' },
                { key: 'supplementalO2', label: 'Oxígeno Suplementario', max: 2 },
                { key: 'temperature', label: 'Temperatura' },
                { key: 'systolicBP', label: 'Presión Arterial Sistólica' },
                { key: 'heartRate', label: 'Frecuencia Cardíaca' },
                { key: 'consciousness', label: 'Nivel de Conciencia' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label} (0-{field.max || 3})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={field.max || 3}
                    value={newsScore[field.key as keyof NEWSScore] as number}
                    onChange={(e) =>
                      setNEWSScore({
                        ...newsScore,
                        [field.key]: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Puntaje Total: <span className="text-2xl">{newsScore.total}</span> / 20
              </p>
            </div>
          </div>
        )}

        {/* Barthel Index */}
        {activeTab === 'barthel' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Índice de Barthel (Independencia AVD)
              </h3>
              <RiskIndicatorBadge
                riskLevel={getBarthelRiskLevel(barthelScore.total)}
                scaleType="Barthel"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'feeding', label: 'Alimentación', options: [0, 5, 10] },
                { key: 'bathing', label: 'Baño', options: [0, 5] },
                { key: 'grooming', label: 'Arreglo Personal', options: [0, 5] },
                { key: 'dressing', label: 'Vestirse', options: [0, 5, 10] },
                { key: 'bowels', label: 'Deposiciones', options: [0, 5, 10] },
                { key: 'bladder', label: 'Micción', options: [0, 5, 10] },
                { key: 'toiletUse', label: 'Uso del WC', options: [0, 5, 10] },
                { key: 'transfers', label: 'Traslados', options: [0, 5, 10, 15] },
                { key: 'mobility', label: 'Movilidad', options: [0, 5, 10, 15] },
                { key: 'stairs', label: 'Escaleras', options: [0, 5, 10] },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <select
                    value={barthelScore[field.key as keyof BarthelScore]}
                    onChange={(e) =>
                      setBarthelScore({
                        ...barthelScore,
                        [field.key]: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {field.options.map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Puntaje Total: <span className="text-2xl">{barthelScore.total}</span> / 100
              </p>
            </div>
          </div>
        )}

        {/* Norton Scale */}
        {activeTab === 'norton' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Escala de Norton (Riesgo de Escaras)
              </h3>
              <RiskIndicatorBadge
                riskLevel={getNortonRiskLevel(nortonScore.total)}
                scaleType="Norton"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'physicalCondition', label: 'Condición Física' },
                { key: 'mentalCondition', label: 'Condición Mental' },
                { key: 'activity', label: 'Actividad' },
                { key: 'mobility', label: 'Movilidad' },
                { key: 'incontinence', label: 'Incontinencia' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label} (1-4)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="4"
                    value={nortonScore[field.key as keyof NortonScore] as number}
                    onChange={(e) =>
                      setNortonScore({
                        ...nortonScore,
                        [field.key]: parseInt(e.target.value),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Puntaje Total: <span className="text-2xl">{nortonScore.total}</span> / 20
              </p>
            </div>
          </div>
        )}

        {/* RASS */}
        {activeTab === 'rass' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                RASS (Sedación/Agitación)
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Sedación/Agitación (-5 a +4)
              </label>
              <select
                value={rassScore}
                onChange={(e) => setRassScore(parseInt(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="4">+4 - Combativo</option>
                <option value="3">+3 - Muy Agitado</option>
                <option value="2">+2 - Agitado</option>
                <option value="1">+1 - Inquieto</option>
                <option value="0">0 - Alerta y Tranquilo</option>
                <option value="-1">-1 - Somnoliento</option>
                <option value="-2">-2 - Sedación Ligera</option>
                <option value="-3">-3 - Sedación Moderada</option>
                <option value="-4">-4 - Sedación Profunda</option>
                <option value="-5">-5 - Sin Respuesta</option>
              </select>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">
                Puntaje: <span className="text-2xl">{rassScore > 0 ? '+' : ''}{rassScore}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Notas Clínicas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Evaluación'}
        </button>
      </div>
    </form>
  );
};

export default AssessmentForm;
