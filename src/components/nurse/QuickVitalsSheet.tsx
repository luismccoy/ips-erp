/**
 * QuickVitalsSheet Component
 *
 * Bottom sheet for rapid vitals entry. Target: 13 seconds for all 4 vitals.
 * Uses Framer Motion drag for pull-up/dismiss gesture and large stepper inputs
 * optimized for tablet touch targets.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Activity, Minus, Plus } from 'lucide-react';
import type { VitalsData } from '../../types/workflow';

export interface QuickVitalsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (vitals: VitalsData) => void;
  initialValues?: Partial<VitalsData>;
  patientName: string;
}

// Clinical thresholds for color coding
function vitalColor(value: number, type: 'sys' | 'dia' | 'spo2' | 'hr'): string {
  switch (type) {
    case 'sys':
      if (value > 160 || value < 90) return 'text-red-600';
      if (value > 140 || value < 100) return 'text-amber-600';
      return 'text-slate-900';
    case 'dia':
      if (value > 100 || value < 60) return 'text-red-600';
      if (value > 90 || value < 65) return 'text-amber-600';
      return 'text-slate-900';
    case 'spo2':
      if (value < 92) return 'text-red-600';
      if (value < 95) return 'text-amber-600';
      return 'text-slate-900';
    case 'hr':
      if (value > 120 || value < 50) return 'text-red-600';
      if (value > 100 || value < 60) return 'text-amber-600';
      return 'text-slate-900';
    default:
      return 'text-slate-900';
  }
}

interface StepperProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  type: 'sys' | 'dia' | 'spo2' | 'hr';
  onChange: (v: number) => void;
}

function VitalStepper({ label, unit, value, min, max, step, type, onChange }: StepperProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const increment = useCallback(() => {
    onChange(Math.min(max, value + step));
  }, [max, value, step, onChange]);

  const decrement = useCallback(() => {
    onChange(Math.max(min, value - step));
  }, [min, value, step, onChange]);

  const startLongPress = useCallback(
    (action: () => void) => {
      action();
      intervalRef.current = setInterval(action, 120);
    },
    [],
  );

  const stopLongPress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => stopLongPress, [stopLongPress]);

  const colorClass = vitalColor(value, type);

  return (
    <div className="flex flex-col items-center bg-white rounded-xl border border-slate-200 p-3">
      <span className="text-xs font-medium text-slate-500 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={() => startLongPress(decrement)}
          onPointerUp={stopLongPress}
          onPointerLeave={stopLongPress}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors select-none touch-manipulation"
          aria-label={`Disminuir ${label}`}
        >
          <Minus size={20} className="text-slate-600" />
        </button>
        <span className={`text-3xl font-bold tabular-nums min-w-[64px] text-center ${colorClass}`}>
          {value}
        </span>
        <button
          type="button"
          onPointerDown={() => startLongPress(increment)}
          onPointerUp={stopLongPress}
          onPointerLeave={stopLongPress}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors select-none touch-manipulation"
          aria-label={`Aumentar ${label}`}
        >
          <Plus size={20} className="text-slate-600" />
        </button>
      </div>
      <span className="text-xs text-slate-400 mt-1">{unit}</span>
    </div>
  );
}

export function QuickVitalsSheet({
  isOpen,
  onClose,
  onSave,
  initialValues,
  patientName,
}: QuickVitalsSheetProps) {
  const [sys, setSys] = useState(initialValues?.sys || 120);
  const [dia, setDia] = useState(initialValues?.dia || 80);
  const [spo2, setSpo2] = useState(initialValues?.spo2 || 97);
  const [hr, setHr] = useState(initialValues?.hr || 78);

  // Reset values when sheet opens with new initial values
  useEffect(() => {
    if (isOpen) {
      setSys(initialValues?.sys || 120);
      setDia(initialValues?.dia || 80);
      setSpo2(initialValues?.spo2 || 97);
      setHr(initialValues?.hr || 78);
    }
  }, [isOpen, initialValues?.sys, initialValues?.dia, initialValues?.spo2, initialValues?.hr]);

  const handleSave = () => {
    onSave({ sys, dia, spo2, hr });
    onClose();
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Dismiss if dragged down past threshold or with high velocity
    if (info.offset.y > 120 || info.velocity.y > 300) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-w-lg mx-auto touch-pan-x"
            role="dialog"
            aria-modal="true"
            aria-label="Signos vitales rápidos"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Signos Vitales</h3>
                  <p className="text-xs text-slate-500">{patientName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Stepper Grid */}
            <div className="px-5 pb-3 grid grid-cols-2 gap-3">
              <VitalStepper
                label="Sistólica"
                unit="mmHg"
                value={sys}
                min={60}
                max={250}
                step={1}
                type="sys"
                onChange={setSys}
              />
              <VitalStepper
                label="Diastólica"
                unit="mmHg"
                value={dia}
                min={30}
                max={150}
                step={1}
                type="dia"
                onChange={setDia}
              />
              <VitalStepper
                label="SpO2"
                unit="%"
                value={spo2}
                min={50}
                max={100}
                step={1}
                type="spo2"
                onChange={setSpo2}
              />
              <VitalStepper
                label="Frec. Cardíaca"
                unit="lpm"
                value={hr}
                min={30}
                max={220}
                step={1}
                type="hr"
                onChange={setHr}
              />
            </div>

            {/* Save Button */}
            <div className="px-5 pb-6 pt-2">
              <button
                onClick={handleSave}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-base transition-colors min-h-[56px] touch-manipulation"
              >
                Guardar Signos Vitales
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default QuickVitalsSheet;
