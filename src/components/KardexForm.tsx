/**
 * KardexForm Component
 *
 * Full clinical documentation form for Colombian IPS home healthcare visits.
 * Renders KARDEX assessment fields, vital signs inputs, and medication tracking.
 * Controlled component — all state lives in VisitDocumentationForm parent.
 */

import React from 'react';
import { Heart, Thermometer, Scale, Activity, Droplets, Wind } from 'lucide-react';
import type { KardexData, VitalsData, MedicationAdminData, TaskCompletionData } from '../types/workflow';

interface KardexFormProps {
  kardex: KardexData;
  vitals: VitalsData;
  medications: MedicationAdminData[];
  tasks: TaskCompletionData[];
  onKardexChange: (kardex: KardexData) => void;
  onVitalsChange: (vitals: VitalsData) => void;
  onMedicationsChange: (meds: MedicationAdminData[]) => void;
  onTasksChange: (tasks: TaskCompletionData[]) => void;
  disabled?: boolean;
  vitalsErrors?: string[];
}

function VitalInput({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
  icon: Icon,
  hasError,
  disabled,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  icon: React.ElementType;
  hasError?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${hasError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={hasError ? 'text-red-500' : 'text-blue-500'} />
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-[10px] text-slate-400 ml-auto">{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - (step || 1)))}
          disabled={disabled || value <= min}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg disabled:opacity-30 touch-manipulation"
          aria-label={`Disminuir ${label}`}
        >
          −
        </button>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          min={min}
          max={max}
          step={step || 1}
          disabled={disabled}
          className="flex-1 text-center text-lg font-semibold text-slate-900 bg-transparent border-none outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="0"
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + (step || 1)))}
          disabled={disabled || value >= max}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-lg disabled:opacity-30 touch-manipulation"
          aria-label={`Aumentar ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export const KardexForm: React.FC<KardexFormProps> = ({
  kardex,
  vitals,
  onKardexChange,
  onVitalsChange,
  disabled = false,
  vitalsErrors = [],
}) => {
  const updateKardex = (field: keyof KardexData, value: string | number | undefined) => {
    onKardexChange({ ...kardex, [field]: value });
  };

  const updateVital = (field: keyof VitalsData, value: number) => {
    onVitalsChange({ ...vitals, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* ── Section 1: Observaciones Generales (Required) ── */}
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-1.5">
          Observaciones Generales <span className="text-red-500">*</span>
        </label>
        <textarea
          value={kardex.generalObservations || ''}
          onChange={(e) => updateKardex('generalObservations', e.target.value)}
          disabled={disabled}
          placeholder="Describa el estado general del paciente, hallazgos relevantes, y novedades de la visita..."
          rows={4}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none resize-y disabled:bg-slate-100 disabled:text-slate-500"
        />
        <p className="text-[11px] text-slate-400 mt-1">Campo obligatorio. Mínimo describir estado de conciencia, hallazgos y plan.</p>
      </div>

      {/* ── Section 2: Signos Vitales ── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Heart size={16} className="text-red-500" />
          Signos Vitales
          {vitalsErrors.length > 0 && (
            <span className="text-[11px] text-red-500 font-normal ml-2">— Complete todos los campos requeridos</span>
          )}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <VitalInput
            label="Sistólica"
            unit="mmHg"
            value={vitals.sys}
            onChange={(v) => updateVital('sys', v)}
            min={60}
            max={250}
            icon={Activity}
            hasError={vitalsErrors.includes('sys')}
            disabled={disabled}
          />
          <VitalInput
            label="Diastólica"
            unit="mmHg"
            value={vitals.dia}
            onChange={(v) => updateVital('dia', v)}
            min={30}
            max={160}
            icon={Activity}
            hasError={vitalsErrors.includes('dia')}
            disabled={disabled}
          />
          <VitalInput
            label="SpO₂"
            unit="%"
            value={vitals.spo2}
            onChange={(v) => updateVital('spo2', v)}
            min={50}
            max={100}
            icon={Droplets}
            hasError={vitalsErrors.includes('spo2')}
            disabled={disabled}
          />
          <VitalInput
            label="Frec. Cardíaca"
            unit="lpm"
            value={vitals.hr}
            onChange={(v) => updateVital('hr', v)}
            min={30}
            max={220}
            icon={Heart}
            hasError={vitalsErrors.includes('hr')}
            disabled={disabled}
          />
          <VitalInput
            label="Temperatura"
            unit="°C"
            value={vitals.temperature || 0}
            onChange={(v) => updateVital('temperature', v)}
            min={34}
            max={42}
            step={0.1}
            icon={Thermometer}
            disabled={disabled}
          />
          <VitalInput
            label="Peso"
            unit="kg"
            value={vitals.weight || 0}
            onChange={(v) => updateVital('weight', v)}
            min={20}
            max={200}
            step={0.5}
            icon={Scale}
            disabled={disabled}
          />
        </div>
      </div>

      {/* ── Section 3: Evaluación Clínica ── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 mb-3">Evaluación Clínica</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextAreaField
            label="Condición de Piel"
            value={kardex.skinCondition || ''}
            onChange={(v) => updateKardex('skinCondition', v)}
            placeholder="Integridad, coloración, lesiones, edema..."
            disabled={disabled}
          />
          <TextAreaField
            label="Estado de Movilidad"
            value={kardex.mobilityStatus || ''}
            onChange={(v) => updateKardex('mobilityStatus', v)}
            placeholder="Marcha, traslados, rango de movimiento..."
            disabled={disabled}
          />
          <TextAreaField
            label="Ingesta Nutricional"
            value={kardex.nutritionIntake || ''}
            onChange={(v) => updateKardex('nutritionIntake', v)}
            placeholder="Dieta, ingesta de líquidos, tolerancia..."
            disabled={disabled}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Nivel de Dolor (EVA 0-10)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={10}
                value={kardex.painLevel ?? 0}
                onChange={(e) => updateKardex('painLevel', Number(e.target.value))}
                disabled={disabled}
                className="flex-1 accent-blue-500"
              />
              <span className={`text-lg font-bold min-w-[2ch] text-center ${
                (kardex.painLevel ?? 0) >= 7 ? 'text-red-600' :
                (kardex.painLevel ?? 0) >= 4 ? 'text-amber-600' :
                'text-green-600'
              }`}>
                {kardex.painLevel ?? 0}
              </span>
            </div>
          </div>
          <TextAreaField
            label="Estado Mental"
            value={kardex.mentalStatus || ''}
            onChange={(v) => updateKardex('mentalStatus', v)}
            placeholder="Orientación, estado de ánimo, colaboración..."
            disabled={disabled}
          />
          <TextAreaField
            label="Seguridad del Entorno"
            value={kardex.environmentalSafety || ''}
            onChange={(v) => updateKardex('environmentalSafety', v)}
            placeholder="Riesgos de caída, ventilación, iluminación..."
            disabled={disabled}
          />
          <TextAreaField
            label="Apoyo del Cuidador"
            value={kardex.caregiverSupport || ''}
            onChange={(v) => updateKardex('caregiverSupport', v)}
            placeholder="Cuidador presente, adherencia, capacitación..."
            disabled={disabled}
          />
          <TextAreaField
            label="Notas Internas"
            value={kardex.internalNotes || ''}
            onChange={(v) => updateKardex('internalNotes', v)}
            placeholder="Notas clínicas internas (no visibles para la familia)..."
            disabled={disabled}
            isInternal
          />
        </div>
      </div>
    </div>
  );
};

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  isInternal,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  isInternal?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3 ${isInternal ? 'border-amber-200 bg-amber-50/50' : 'border-slate-200 bg-white'}`}>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        {isInternal && <span className="text-[10px] text-amber-600 ml-1.5">(interno)</span>}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={2}
        className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 resize-none disabled:text-slate-500"
      />
    </div>
  );
}
