/**
 * KardexForm Component
 * 
 * A comprehensive clinical documentation form for Colombian IPS (Home Care) visits.
 * KARDEX is the structured clinical notes format used in Colombian healthcare.
 * 
 * Features:
 * - KARDEX sections: general observations, skin condition, mobility, nutrition,
 *   pain level, mental status, environmental safety, caregiver support, internal notes
 * - Vitals input section with validation (sys, dia, spo2, hr, temperature, weight)
 * - Dynamic medications list with add/remove functionality
 * - Dynamic tasks list with add/remove functionality
 * - Spanish language labels (Colombian IPS context)
 * - Tailwind CSS styling consistent with NotificationBell component
 * - Support for disabled prop for read-only mode
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.6
 * 
 * @example
 * <KardexForm
 *   kardex={kardexData}
 *   vitals={vitalsData}
 *   medications={medicationsData}
 *   tasks={tasksData}
 *   onKardexChange={setKardexData}
 *   onVitalsChange={setVitalsData}
 *   onMedicationsChange={setMedicationsData}
 *   onTasksChange={setTasksData}
 *   disabled={false}
 * />
 */

import React, { useCallback } from 'react';
import type {
  KardexData,
  VitalsData,
  MedicationAdminData,
  TaskCompletionData,
} from '../types/workflow';

// ============================================================================
// Component Props Interface
// ============================================================================

export interface KardexFormComponentProps {
  /** Current KARDEX clinical documentation data */
  kardex: KardexData;
  /** Current vitals data */
  vitals: VitalsData;
  /** List of medications administered */
  medications: MedicationAdminData[];
  /** List of tasks completed */
  tasks: TaskCompletionData[];
  /** Callback when KARDEX data changes */
  onKardexChange: (kardex: KardexData) => void;
  /** Callback when vitals data changes */
  onVitalsChange: (vitals: VitalsData) => void;
  /** Callback when medications list changes */
  onMedicationsChange: (medications: MedicationAdminData[]) => void;
  /** Callback when tasks list changes */
  onTasksChange: (tasks: TaskCompletionData[]) => void;
  /** Whether form is in read-only mode */
  disabled?: boolean;
  /** Validation errors for vitals fields */
  vitalsErrors?: string[];
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Section header component for form sections.
 */
const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
    <span className="text-indigo-600">{icon}</span>
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
  </div>
);

/**
 * Form field wrapper with label.
 */
const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-xs text-red-600">Este campo es requerido</p>
    )}
  </div>
);

// ============================================================================
// Icons
// ============================================================================

const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const PillIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

const ChecklistIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);


// ============================================================================
// KardexForm Component
// ============================================================================

export const KardexForm: React.FC<KardexFormComponentProps> = ({
  kardex,
  vitals,
  medications,
  tasks,
  onKardexChange,
  onVitalsChange,
  onMedicationsChange,
  onTasksChange,
  disabled = false,
  vitalsErrors = [],
}) => {
  // ============================================================================
  // KARDEX Field Handlers
  // ============================================================================

  const handleKardexFieldChange = useCallback(
    (field: keyof KardexData, value: string | number | undefined) => {
      onKardexChange({
        ...kardex,
        [field]: value,
      });
    },
    [kardex, onKardexChange]
  );

  // ============================================================================
  // Vitals Field Handlers
  // ============================================================================

  const handleVitalsFieldChange = useCallback(
    (field: keyof VitalsData, value: number | undefined) => {
      onVitalsChange({
        ...vitals,
        [field]: value,
      });
    },
    [vitals, onVitalsChange]
  );

  // ============================================================================
  // Medications Handlers
  // ============================================================================

  const handleAddMedication = useCallback(() => {
    const newMedication: MedicationAdminData = {
      medicationName: '',
      intendedDosage: '',
      dosageGiven: '',
      time: new Date().toISOString(),
      route: '',
      notes: '',
    };
    onMedicationsChange([...medications, newMedication]);
  }, [medications, onMedicationsChange]);

  const handleRemoveMedication = useCallback(
    (index: number) => {
      const updated = medications.filter((_, i) => i !== index);
      onMedicationsChange(updated);
    },
    [medications, onMedicationsChange]
  );

  const handleMedicationFieldChange = useCallback(
    (index: number, field: keyof MedicationAdminData, value: string) => {
      const updated = medications.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      );
      onMedicationsChange(updated);
    },
    [medications, onMedicationsChange]
  );

  // ============================================================================
  // Tasks Handlers
  // ============================================================================

  const handleAddTask = useCallback(() => {
    const newTask: TaskCompletionData = {
      taskDescription: '',
      completedAt: new Date().toISOString(),
      notes: '',
    };
    onTasksChange([...tasks, newTask]);
  }, [tasks, onTasksChange]);

  const handleRemoveTask = useCallback(
    (index: number) => {
      const updated = tasks.filter((_, i) => i !== index);
      onTasksChange(updated);
    },
    [tasks, onTasksChange]
  );

  const handleTaskFieldChange = useCallback(
    (index: number, field: keyof TaskCompletionData, value: string) => {
      const updated = tasks.map((task, i) =>
        i === index ? { ...task, [field]: value } : task
      );
      onTasksChange(updated);
    },
    [tasks, onTasksChange]
  );

  // ============================================================================
  // Input Styles
  // ============================================================================

  const inputBaseClass = `w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
    disabled
      ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
      : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400'
  }`;

  const textareaBaseClass = `w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
    disabled
      ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
      : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400'
  }`;

  const inputErrorClass = 'border-red-500 focus:ring-red-500 focus:border-red-500';

  return (
    <div className="space-y-8">
      {/* ================================================================== */}
      {/* KARDEX Clinical Documentation Section */}
      {/* ================================================================== */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader title="Documentación Clínica KARDEX" icon={<ClipboardIcon />} />
        
        <div className="space-y-6">
          {/* General Observations - Required */}
          <FormField label="Observaciones Generales" required>
            <textarea
              value={kardex.generalObservations || ''}
              onChange={(e) => handleKardexFieldChange('generalObservations', e.target.value)}
              disabled={disabled}
              className={textareaBaseClass}
              rows={4}
              placeholder="Describa las observaciones generales del paciente durante la visita..."
            />
          </FormField>

          {/* Two-column grid for optional fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skin Condition */}
            <FormField label="Condición de la Piel">
              <textarea
                value={kardex.skinCondition || ''}
                onChange={(e) => handleKardexFieldChange('skinCondition', e.target.value)}
                disabled={disabled}
                className={textareaBaseClass}
                rows={2}
                placeholder="Estado de la piel, úlceras, heridas..."
              />
            </FormField>

            {/* Mobility Status */}
            <FormField label="Estado de Movilidad">
              <textarea
                value={kardex.mobilityStatus || ''}
                onChange={(e) => handleKardexFieldChange('mobilityStatus', e.target.value)}
                disabled={disabled}
                className={textareaBaseClass}
                rows={2}
                placeholder="Capacidad de movimiento, limitaciones..."
              />
            </FormField>

            {/* Nutrition Intake */}
            <FormField label="Ingesta Nutricional">
              <textarea
                value={kardex.nutritionIntake || ''}
                onChange={(e) => handleKardexFieldChange('nutritionIntake', e.target.value)}
                disabled={disabled}
                className={textareaBaseClass}
                rows={2}
                placeholder="Alimentación, hidratación, apetito..."
              />
            </FormField>

            {/* Pain Level */}
            <FormField label="Nivel de Dolor (0-10)">
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={kardex.painLevel ?? 0}
                  onChange={(e) => handleKardexFieldChange('painLevel', parseInt(e.target.value))}
                  disabled={disabled}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:cursor-not-allowed"
                />
                <span className={`text-lg font-semibold min-w-[2rem] text-center ${
                  (kardex.painLevel ?? 0) >= 7 ? 'text-red-600' :
                  (kardex.painLevel ?? 0) >= 4 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {kardex.painLevel ?? 0}
                </span>
              </div>
            </FormField>

            {/* Mental Status */}
            <FormField label="Estado Mental/Cognitivo">
              <textarea
                value={kardex.mentalStatus || ''}
                onChange={(e) => handleKardexFieldChange('mentalStatus', e.target.value)}
                disabled={disabled}
                className={textareaBaseClass}
                rows={2}
                placeholder="Orientación, memoria, estado de ánimo..."
              />
            </FormField>

            {/* Environmental Safety */}
            <FormField label="Seguridad Ambiental">
              <textarea
                value={kardex.environmentalSafety || ''}
                onChange={(e) => handleKardexFieldChange('environmentalSafety', e.target.value)}
                disabled={disabled}
                className={textareaBaseClass}
                rows={2}
                placeholder="Condiciones del hogar, riesgos identificados..."
              />
            </FormField>

            {/* Caregiver Support */}
            <FormField label="Apoyo del Cuidador">
              <textarea
                value={kardex.caregiverSupport || ''}
                onChange={(e) => handleKardexFieldChange('caregiverSupport', e.target.value)}
                disabled={disabled}
                className={textareaBaseClass}
                rows={2}
                placeholder="Disponibilidad y capacidad del cuidador..."
              />
            </FormField>
          </div>

          {/* Internal Notes - Full width */}
          <FormField label="Notas Internas (No visible para familiares)">
            <textarea
              value={kardex.internalNotes || ''}
              onChange={(e) => handleKardexFieldChange('internalNotes', e.target.value)}
              disabled={disabled}
              className={`${textareaBaseClass} bg-yellow-50 border-yellow-200`}
              rows={3}
              placeholder="Notas confidenciales para uso interno del equipo médico..."
            />
            <p className="text-xs text-yellow-700 mt-1">
              ⚠️ Estas notas son confidenciales y no serán visibles para los familiares del paciente.
            </p>
          </FormField>
        </div>
      </section>


      {/* ================================================================== */}
      {/* Vitals Section */}
      {/* ================================================================== */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader title="Signos Vitales" icon={<HeartIcon />} />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Systolic Blood Pressure - Required */}
          <FormField label="Presión Sistólica" required error={vitalsErrors.includes('sys')}>
            <div className="relative">
              <input
                type="number"
                value={vitals.sys || ''}
                onChange={(e) => handleVitalsFieldChange('sys', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled}
                className={`${inputBaseClass} ${vitalsErrors.includes('sys') ? inputErrorClass : ''}`}
                placeholder="120"
                min="0"
                max="300"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">mmHg</span>
            </div>
          </FormField>

          {/* Diastolic Blood Pressure - Required */}
          <FormField label="Presión Diastólica" required error={vitalsErrors.includes('dia')}>
            <div className="relative">
              <input
                type="number"
                value={vitals.dia || ''}
                onChange={(e) => handleVitalsFieldChange('dia', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled}
                className={`${inputBaseClass} ${vitalsErrors.includes('dia') ? inputErrorClass : ''}`}
                placeholder="80"
                min="0"
                max="200"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">mmHg</span>
            </div>
          </FormField>

          {/* Oxygen Saturation - Required */}
          <FormField label="Saturación O₂" required error={vitalsErrors.includes('spo2')}>
            <div className="relative">
              <input
                type="number"
                value={vitals.spo2 || ''}
                onChange={(e) => handleVitalsFieldChange('spo2', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled}
                className={`${inputBaseClass} ${vitalsErrors.includes('spo2') ? inputErrorClass : ''}`}
                placeholder="98"
                min="0"
                max="100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
            </div>
          </FormField>

          {/* Heart Rate - Required */}
          <FormField label="Frecuencia Cardíaca" required error={vitalsErrors.includes('hr')}>
            <div className="relative">
              <input
                type="number"
                value={vitals.hr || ''}
                onChange={(e) => handleVitalsFieldChange('hr', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={disabled}
                className={`${inputBaseClass} ${vitalsErrors.includes('hr') ? inputErrorClass : ''}`}
                placeholder="72"
                min="0"
                max="300"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">bpm</span>
            </div>
          </FormField>

          {/* Temperature - Optional */}
          <FormField label="Temperatura">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={vitals.temperature || ''}
                onChange={(e) => handleVitalsFieldChange('temperature', e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={disabled}
                className={inputBaseClass}
                placeholder="36.5"
                min="30"
                max="45"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">°C</span>
            </div>
          </FormField>

          {/* Weight - Optional */}
          <FormField label="Peso">
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={vitals.weight || ''}
                onChange={(e) => handleVitalsFieldChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                disabled={disabled}
                className={inputBaseClass}
                placeholder="70"
                min="0"
                max="500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">kg</span>
            </div>
          </FormField>
        </div>

        {/* Vitals validation message */}
        {vitalsErrors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <span className="font-medium">⚠️ Campos requeridos incompletos:</span> Por favor complete todos los signos vitales obligatorios (Presión Sistólica, Presión Diastólica, Saturación O₂, Frecuencia Cardíaca).
            </p>
          </div>
        )}
      </section>


      {/* ================================================================== */}
      {/* Medications Section */}
      {/* ================================================================== */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-indigo-600"><PillIcon /></span>
            <h3 className="text-lg font-semibold text-slate-800">Medicamentos Administrados</h3>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleAddMedication}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <PlusIcon />
              Agregar Medicamento
            </button>
          )}
        </div>

        {medications.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <PillIcon />
            <p className="mt-2 text-sm">No se han registrado medicamentos administrados.</p>
            {!disabled && (
              <button
                type="button"
                onClick={handleAddMedication}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Agregar primer medicamento
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((medication, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">
                    Medicamento #{index + 1}
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar medicamento"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Medication Name */}
                  <FormField label="Nombre del Medicamento" required>
                    <input
                      type="text"
                      value={medication.medicationName}
                      onChange={(e) => handleMedicationFieldChange(index, 'medicationName', e.target.value)}
                      disabled={disabled}
                      className={inputBaseClass}
                      placeholder="Ej: Acetaminofén"
                    />
                  </FormField>

                  {/* Intended Dosage */}
                  <FormField label="Dosis Prescrita" required>
                    <input
                      type="text"
                      value={medication.intendedDosage}
                      onChange={(e) => handleMedicationFieldChange(index, 'intendedDosage', e.target.value)}
                      disabled={disabled}
                      className={inputBaseClass}
                      placeholder="Ej: 500mg"
                    />
                  </FormField>

                  {/* Dosage Given */}
                  <FormField label="Dosis Administrada" required>
                    <input
                      type="text"
                      value={medication.dosageGiven}
                      onChange={(e) => handleMedicationFieldChange(index, 'dosageGiven', e.target.value)}
                      disabled={disabled}
                      className={inputBaseClass}
                      placeholder="Ej: 500mg"
                    />
                  </FormField>

                  {/* Route */}
                  <FormField label="Vía de Administración">
                    <select
                      value={medication.route || ''}
                      onChange={(e) => handleMedicationFieldChange(index, 'route', e.target.value)}
                      disabled={disabled}
                      className={inputBaseClass}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="oral">Oral</option>
                      <option value="iv">Intravenosa (IV)</option>
                      <option value="im">Intramuscular (IM)</option>
                      <option value="sc">Subcutánea (SC)</option>
                      <option value="topical">Tópica</option>
                      <option value="inhalation">Inhalación</option>
                      <option value="sublingual">Sublingual</option>
                      <option value="rectal">Rectal</option>
                      <option value="other">Otra</option>
                    </select>
                  </FormField>

                  {/* Time */}
                  <FormField label="Hora de Administración" required>
                    <input
                      type="datetime-local"
                      value={medication.time ? medication.time.slice(0, 16) : ''}
                      onChange={(e) => handleMedicationFieldChange(index, 'time', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      disabled={disabled}
                      className={inputBaseClass}
                    />
                  </FormField>

                  {/* Notes */}
                  <FormField label="Notas">
                    <input
                      type="text"
                      value={medication.notes || ''}
                      onChange={(e) => handleMedicationFieldChange(index, 'notes', e.target.value)}
                      disabled={disabled}
                      className={inputBaseClass}
                      placeholder="Observaciones adicionales..."
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* ================================================================== */}
      {/* Tasks Section */}
      {/* ================================================================== */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-indigo-600"><ChecklistIcon /></span>
            <h3 className="text-lg font-semibold text-slate-800">Tareas Completadas</h3>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleAddTask}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <PlusIcon />
              Agregar Tarea
            </button>
          )}
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <ChecklistIcon />
            <p className="mt-2 text-sm">No se han registrado tareas completadas.</p>
            {!disabled && (
              <button
                type="button"
                onClick={handleAddTask}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                + Agregar primera tarea
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">
                    Tarea #{index + 1}
                  </span>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(index)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar tarea"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Task Description */}
                  <FormField label="Descripción de la Tarea" required>
                    <input
                      type="text"
                      value={task.taskDescription}
                      onChange={(e) => handleTaskFieldChange(index, 'taskDescription', e.target.value)}
                      disabled={disabled}
                      className={inputBaseClass}
                      placeholder="Ej: Curación de herida"
                    />
                  </FormField>

                  {/* Completed At */}
                  <FormField label="Hora de Finalización" required>
                    <input
                      type="datetime-local"
                      value={task.completedAt ? task.completedAt.slice(0, 16) : ''}
                      onChange={(e) => handleTaskFieldChange(index, 'completedAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
                      disabled={disabled}
                      className={inputBaseClass}
                    />
                  </FormField>

                  {/* Notes */}
                  <FormField label="Notas">
                    <input
                      type="text"
                      value={task.notes || ''}
                      onChange={(e) => handleTaskFieldChange(index, 'notes', e.target.value)}
                      disabled={disabled}
                      className={inputBaseClass}
                      placeholder="Observaciones adicionales..."
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default KardexForm;