/**
 * AssessmentEntryForm Component
 * 
 * Form for nurses to enter clinical assessment scale scores during visits.
 * Auto-calculates totals and generates risk alerts.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Save, X, AlertTriangle, CheckCircle, Brain, Activity,
  Shield, Heart, User, ChevronDown, ChevronUp
} from 'lucide-react';
import { client, MOCK_USER } from '../amplify-utils';
import type { PatientAssessment } from '../types/clinical-scales';
import {
  calculateGlasgowTotal,
  calculateBradenTotal,
  calculateMorseTotal,
  calculateNEWSTotal,
  calculateBarthelTotal,
  calculateNortonTotal,
  generateAssessmentAlerts,
  DEFAULT_GLASGOW,
  DEFAULT_BRADEN,
  DEFAULT_MORSE,
  DEFAULT_NEWS,
  DEFAULT_BARTHEL,
  DEFAULT_NORTON,
} from '../types/clinical-scales';

interface AssessmentEntryFormProps {
  patientId: string;
  patientName: string;
  nurseId: string;
  visitId?: string;
  onSave: (assessment: PatientAssessment) => void;
  onCancel: () => void;
}

interface ScaleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  score?: number;
  maxScore?: number | string; // Allow string for bipolar scales like RASS (±4)
}

function ScaleSection({ title, icon, expanded, onToggle, children, score, maxScore }: ScaleSectionProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-gray-600">{icon}</span>
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {score !== undefined && maxScore !== undefined && (
            <span className="text-sm font-bold text-gray-700">
              {score}/{maxScore}
            </span>
          )}
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>
      {expanded && (
        <div className="p-4 border-t bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

export function AssessmentEntryForm({
  patientId,
  patientName,
  nurseId,
  visitId,
  onSave,
  onCancel
}: AssessmentEntryFormProps) {
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['glasgow']));
  
  // Scale states
  const [glasgow, setGlasgow] = useState(DEFAULT_GLASGOW);
  const [painScore, setPainScore] = useState(0);
  const [braden, setBraden] = useState(DEFAULT_BRADEN);
  const [morse, setMorse] = useState(DEFAULT_MORSE);
  const [news, setNews] = useState(DEFAULT_NEWS);
  const [barthel, setBarthel] = useState(DEFAULT_BARTHEL);
  const [norton, setNorton] = useState(DEFAULT_NORTON);
  const [rassScore, setRassScore] = useState(0);
  const [notes, setNotes] = useState('');

  // Auto-calculate totals
  useEffect(() => {
    setGlasgow(prev => ({ ...prev, total: calculateGlasgowTotal(prev.eye, prev.verbal, prev.motor) }));
  }, [glasgow.eye, glasgow.verbal, glasgow.motor]);

  useEffect(() => {
    setBraden(prev => ({ ...prev, total: calculateBradenTotal(prev) }));
  }, [braden.sensoryPerception, braden.moisture, braden.activity, braden.mobility, braden.nutrition, braden.frictionShear]);

  useEffect(() => {
    setMorse(prev => ({ ...prev, total: calculateMorseTotal(prev) }));
  }, [morse.historyOfFalling, morse.secondaryDiagnosis, morse.ambulatoryAid, morse.ivHeparinLock, morse.gait, morse.mentalStatus]);

  useEffect(() => {
    setNews(prev => ({ ...prev, total: calculateNEWSTotal(prev) }));
  }, [news.respirationRate, news.oxygenSaturation, news.supplementalO2, news.temperature, news.systolicBP, news.heartRate, news.consciousness]);

  useEffect(() => {
    setBarthel(prev => ({ ...prev, total: calculateBarthelTotal(prev) }));
  }, [barthel.feeding, barthel.bathing, barthel.grooming, barthel.dressing, barthel.bowels, barthel.bladder, barthel.toiletUse, barthel.transfers, barthel.mobility, barthel.stairs]);

  useEffect(() => {
    setNorton(prev => ({ ...prev, total: calculateNortonTotal(prev) }));
  }, [norton.physicalCondition, norton.mentalCondition, norton.activity, norton.mobility, norton.incontinence]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  // Check if at least one scale has been modified from defaults
  const hasModifiedScales = useCallback(() => {
    const isGlasgowModified = glasgow.eye !== DEFAULT_GLASGOW.eye || 
                              glasgow.verbal !== DEFAULT_GLASGOW.verbal || 
                              glasgow.motor !== DEFAULT_GLASGOW.motor;
    const isPainModified = painScore !== 0;
    const isBradenModified = JSON.stringify(braden) !== JSON.stringify({ ...DEFAULT_BRADEN, total: braden.total });
    const isMorseModified = JSON.stringify(morse) !== JSON.stringify({ ...DEFAULT_MORSE, total: morse.total });
    const isNewsModified = JSON.stringify(news) !== JSON.stringify({ ...DEFAULT_NEWS, total: news.total });
    const isBarthelModified = JSON.stringify(barthel) !== JSON.stringify({ ...DEFAULT_BARTHEL, total: barthel.total });
    const isNortonModified = JSON.stringify(norton) !== JSON.stringify({ ...DEFAULT_NORTON, total: norton.total });
    const isRassModified = rassScore !== 0;

    return isGlasgowModified || isPainModified || isBradenModified || isMorseModified || 
           isNewsModified || isBarthelModified || isNortonModified || isRassModified;
  }, [glasgow, painScore, braden, morse, news, barthel, norton, rassScore]);

  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * SENTINEL FIX #2: Unsaved changes confirmation
   * Prevents data loss by warning nurses before discarding clinical assessment data
   */
  const handleClose = useCallback(() => {
    if (hasModifiedScales()) {
      // Has unsaved changes - confirm before closing
      const confirmed = window.confirm(
        "¿Descartar cambios?\n\nTiene datos sin guardar en esta valoración clínica. ¿Está seguro de cerrar sin guardar?"
      );
      if (confirmed) {
        onCancel(); // User confirmed discard - close the form
      }
      // If not confirmed, do nothing (stay open)
    } else {
      // No changes, close immediately
      onCancel();
    }
  }, [hasModifiedScales, onCancel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one scale has been modified
    if (!hasModifiedScales()) {
      setValidationError('Debe modificar al menos una escala antes de guardar.');
      return;
    }
    setValidationError(null);
    setSaving(true);

    try {
      const assessment: Partial<PatientAssessment> = {
        patientId,
        nurseId,
        tenantId: MOCK_USER.attributes['custom:tenantId'],
        assessedAt: new Date().toISOString(),
        glasgowScore: glasgow,
        painScore,
        bradenScore: braden,
        morseScore: morse,
        newsScore: news,
        barthelScore: barthel,
        nortonScore: norton,
        rassScore,
        notes,
        visitId,
      };

      // Generate alerts
      assessment.alerts = generateAssessmentAlerts(assessment);

      const result = await client.models.PatientAssessment.create(assessment as any);
      onSave(result.data as PatientAssessment);
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Error al guardar la valoración');
    } finally {
      setSaving(false);
    }
  };

  // Preview alerts
  const previewAlerts = generateAssessmentAlerts({
    glasgowScore: glasgow,
    painScore,
    bradenScore: braden,
    morseScore: morse,
    newsScore: news,
    barthelScore: barthel,
    nortonScore: norton,
    rassScore,
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Nueva Valoración</h2>
          <p className="text-sm text-gray-500">{patientName}</p>
        </div>
        <button type="button" onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 font-medium">
            <AlertTriangle size={18} />
            <span>{validationError}</span>
          </div>
        </div>
      )}

      {/* Alert Preview */}
      {previewAlerts.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
            <AlertTriangle size={18} />
            <span>{previewAlerts.length} Alerta(s) Detectada(s)</span>
          </div>
          <ul className="text-sm text-amber-700 space-y-1">
            {previewAlerts.slice(0, 3).map((alert, i) => (
              <li key={i}>• {alert.message}</li>
            ))}
            {previewAlerts.length > 3 && (
              <li className="text-amber-600">+{previewAlerts.length - 3} más...</li>
            )}
          </ul>
        </div>
      )}

      {/* Glasgow */}
      <ScaleSection
        title="Glasgow (Consciencia)"
        icon={<Brain size={20} />}
        expanded={expandedSections.has('glasgow')}
        onToggle={() => toggleSection('glasgow')}
        score={glasgow.total}
        maxScore={15}
      >
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ocular (1-4)</label>
            <select
              value={glasgow.eye}
              onChange={e => setGlasgow(prev => ({ ...prev, eye: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={1}>1 - Sin respuesta</option>
              <option value={2}>2 - Al dolor</option>
              <option value={3}>3 - A la voz</option>
              <option value={4}>4 - Espontánea</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verbal (1-5)</label>
            <select
              value={glasgow.verbal}
              onChange={e => setGlasgow(prev => ({ ...prev, verbal: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={1}>1 - Sin respuesta</option>
              <option value={2}>2 - Incomprensible</option>
              <option value={3}>3 - Inapropiada</option>
              <option value={4}>4 - Confusa</option>
              <option value={5}>5 - Orientada</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motor (1-6)</label>
            <select
              value={glasgow.motor}
              onChange={e => setGlasgow(prev => ({ ...prev, motor: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={1}>1 - Sin respuesta</option>
              <option value={2}>2 - Extensión</option>
              <option value={3}>3 - Flexión anormal</option>
              <option value={4}>4 - Retira al dolor</option>
              <option value={5}>5 - Localiza dolor</option>
              <option value={6}>6 - Obedece órdenes</option>
            </select>
          </div>
        </div>
      </ScaleSection>

      {/* Pain */}
      <ScaleSection
        title="Dolor (EVA)"
        icon={<Activity size={20} />}
        expanded={expandedSections.has('pain')}
        onToggle={() => toggleSection('pain')}
        score={painScore}
        maxScore={10}
      >
        <div>
          <input
            type="range"
            min={0}
            max={10}
            value={painScore}
            onChange={e => setPainScore(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0 - Sin dolor</span>
            <span className="font-bold text-lg">{painScore}</span>
            <span>10 - Máximo dolor</span>
          </div>
        </div>
      </ScaleSection>

      {/* Morse (Fall Risk) */}
      <ScaleSection
        title="Morse (Riesgo de Caídas)"
        icon={<AlertTriangle size={20} />}
        expanded={expandedSections.has('morse')}
        onToggle={() => toggleSection('morse')}
        score={morse.total}
        maxScore={125}
      >
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={morse.historyOfFalling === 25}
              onChange={e => setMorse(prev => ({ ...prev, historyOfFalling: e.target.checked ? 25 : 0 }))}
              className="w-5 h-5"
            />
            <span>Historia de caídas (+25)</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={morse.secondaryDiagnosis === 15}
              onChange={e => setMorse(prev => ({ ...prev, secondaryDiagnosis: e.target.checked ? 15 : 0 }))}
              className="w-5 h-5"
            />
            <span>Diagnóstico secundario (+15)</span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Ayuda para caminar</label>
            <select
              value={morse.ambulatoryAid}
              onChange={e => setMorse(prev => ({ ...prev, ambulatoryAid: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={0}>Ninguna / Silla de ruedas / Reposo</option>
              <option value={15}>Muletas / Bastón / Andador</option>
              <option value={30}>Se apoya en muebles</option>
            </select>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={morse.ivHeparinLock === 20}
              onChange={e => setMorse(prev => ({ ...prev, ivHeparinLock: e.target.checked ? 20 : 0 }))}
              className="w-5 h-5"
            />
            <span>Vía IV / Heparina (+20)</span>
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Marcha</label>
            <select
              value={morse.gait}
              onChange={e => setMorse(prev => ({ ...prev, gait: parseInt(e.target.value) }))}
              className="w-full p-2 border rounded-lg"
            >
              <option value={0}>Normal / Reposo / Silla</option>
              <option value={10}>Débil</option>
              <option value={20}>Deteriorada</option>
            </select>
          </div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={morse.mentalStatus === 15}
              onChange={e => setMorse(prev => ({ ...prev, mentalStatus: e.target.checked ? 15 : 0 }))}
              className="w-5 h-5"
            />
            <span>Sobreestima capacidad / Olvida limitaciones (+15)</span>
          </label>
        </div>
      </ScaleSection>

      {/* Braden */}
      <ScaleSection
        title="Braden (Úlceras por Presión)"
        icon={<Shield size={20} />}
        expanded={expandedSections.has('braden')}
        onToggle={() => toggleSection('braden')}
        score={braden.total}
        maxScore={23}
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'sensoryPerception', label: 'Percepción Sensorial', max: 4 },
            { key: 'moisture', label: 'Humedad', max: 4 },
            { key: 'activity', label: 'Actividad', max: 4 },
            { key: 'mobility', label: 'Movilidad', max: 4 },
            { key: 'nutrition', label: 'Nutrición', max: 4 },
            { key: 'frictionShear', label: 'Fricción/Cizalla', max: 3 },
          ].map(({ key, label, max }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <select
                value={(braden as any)[key]}
                onChange={e => setBraden(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              >
                {Array.from({ length: max }, (_, i) => i + 1).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </ScaleSection>

      {/* NEWS */}
      <ScaleSection
        title="NEWS (Alerta Temprana)"
        icon={<Heart size={20} />}
        expanded={expandedSections.has('news')}
        onToggle={() => toggleSection('news')}
        score={news.total}
        maxScore={20}
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'respirationRate', label: 'Frec. Respiratoria' },
            { key: 'oxygenSaturation', label: 'Saturación O2' },
            { key: 'supplementalO2', label: 'O2 Suplementario', max: 2 },
            { key: 'temperature', label: 'Temperatura' },
            { key: 'systolicBP', label: 'Presión Sistólica' },
            { key: 'heartRate', label: 'Frec. Cardíaca' },
            { key: 'consciousness', label: 'Consciencia' },
          ].map(({ key, label, max = 3 }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <select
                value={(news as any)[key]}
                onChange={e => setNews(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              >
                {Array.from({ length: max + 1 }, (_, i) => i).map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </ScaleSection>

      {/* Barthel */}
      <ScaleSection
        title="Barthel (Independencia AVD)"
        icon={<User size={20} />}
        expanded={expandedSections.has('barthel')}
        onToggle={() => toggleSection('barthel')}
        score={barthel.total}
        maxScore={100}
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            { key: 'feeding', label: 'Alimentación', options: [0, 5, 10] },
            { key: 'bathing', label: 'Baño', options: [0, 5] },
            { key: 'grooming', label: 'Aseo Personal', options: [0, 5] },
            { key: 'dressing', label: 'Vestirse', options: [0, 5, 10] },
            { key: 'bowels', label: 'Control Intestinal', options: [0, 5, 10] },
            { key: 'bladder', label: 'Control Vesical', options: [0, 5, 10] },
            { key: 'toiletUse', label: 'Uso del WC', options: [0, 5, 10] },
            { key: 'transfers', label: 'Traslados', options: [0, 5, 10, 15] },
            { key: 'mobility', label: 'Deambulación', options: [0, 5, 10, 15] },
            { key: 'stairs', label: 'Escaleras', options: [0, 5, 10] },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label className="block font-medium text-gray-700 mb-1">{label}</label>
              <select
                value={(barthel as any)[key]}
                onChange={e => setBarthel(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              >
                {options.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </ScaleSection>

      {/* Norton */}
      <ScaleSection
        title="Norton (Riesgo de Escaras)"
        icon={<Shield size={20} />}
        expanded={expandedSections.has('norton')}
        onToggle={() => toggleSection('norton')}
        score={norton.total}
        maxScore={20}
      >
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'physicalCondition', label: 'Condición Física' },
            { key: 'mentalCondition', label: 'Condición Mental' },
            { key: 'activity', label: 'Actividad' },
            { key: 'mobility', label: 'Movilidad' },
            { key: 'incontinence', label: 'Incontinencia' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <select
                value={(norton as any)[key]}
                onChange={e => setNorton(prev => ({ ...prev, [key]: parseInt(e.target.value) }))}
                className="w-full p-2 border rounded-lg"
              >
                {[1, 2, 3, 4].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </ScaleSection>

      {/* RASS */}
      <ScaleSection
        title="RASS (Sedación/Agitación)"
        icon={<Activity size={20} />}
        expanded={expandedSections.has('rass')}
        onToggle={() => toggleSection('rass')}
        score={rassScore}
        maxScore="±4"
      >
        <select
          value={rassScore}
          onChange={e => setRassScore(parseInt(e.target.value))}
          className="w-full p-2 border rounded-lg"
        >
          <option value={4}>+4 Combativo</option>
          <option value={3}>+3 Muy agitado</option>
          <option value={2}>+2 Agitado</option>
          <option value={1}>+1 Inquieto</option>
          <option value={0}>0 Alerta y tranquilo</option>
          <option value={-1}>-1 Somnoliento</option>
          <option value={-2}>-2 Sedación ligera</option>
          <option value={-3}>-3 Sedación moderada</option>
          <option value={-4}>-4 Sedación profunda</option>
          <option value={-5}>-5 Sin respuesta</option>
        </select>
      </ScaleSection>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas Clínicas</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full p-3 border rounded-lg resize-none"
          placeholder="Observaciones adicionales..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={handleClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Save size={18} />
              Guardar Valoración
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default AssessmentEntryForm;
