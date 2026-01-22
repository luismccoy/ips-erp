/**
 * ApprovalModal Component
 * 
 * Modal dialog for admin approval of submitted visits.
 * Displays visit summary for confirmation before calling the approveVisit mutation.
 * 
 * Features:
 * - Displays visit summary (patient name, nurse name, visit date)
 * - Shows confirmation message
 * - Loading state during mutation
 * - Spanish language UI (Colombian IPS context)
 * 
 * Requirements: 6.2, 6.3
 * 
 * @example
 * <ApprovalModal
 *   visit={selectedVisit}
 *   onConfirm={handleApprove}
 *   onCancel={() => setShowModal(false)}
 *   isLoading={isApproving}
 * />
 */

import React from 'react';
import { Modal } from './ui/Modal';
import { LoadingSpinner } from './ui/LoadingSpinner';
import type { ApprovalModalProps } from '../types/workflow';

// ============================================================================
// Icons
// ============================================================================

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const ClipboardCheckIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats a date string to a localized display format.
 */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ============================================================================
// ApprovalModal Component
// ============================================================================

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  visit,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  /**
   * Handles the approval confirmation.
   * Calls the onConfirm callback which triggers the approveVisit mutation.
   * Validates: Requirement 6.2
   */
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Aprobar Visita"
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <ClipboardCheckIcon />
          </div>
        </div>

        {/* Confirmation Message */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            ¿Confirmar aprobación de visita?
          </h3>
          <p className="text-sm text-slate-600">
            Una vez aprobada, la documentación será visible para los familiares del paciente
            y no podrá ser modificada.
          </p>
        </div>

        {/* Visit Summary Card */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Paciente
            </label>
            <p className="text-lg font-bold text-slate-900">{visit.patientName}</p>
          </div>

          {/* Nurse and Date Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Nurse Name */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Enfermero/a
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <UserIcon />
                <span>{visit.nurseName}</span>
              </div>
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Fecha de Visita
              </label>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CalendarIcon />
                <span>{formatDate(visit.visitDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 text-sm font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Aprobando...</span>
              </>
            ) : (
              <>
                <CheckIcon />
                <span>Aprobar Visita</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApprovalModal;
