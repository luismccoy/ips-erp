import React, { useState, useEffect } from 'react';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { Modal } from './Modal';

interface AssessmentFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: any;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  onSubmit,
  onClose,
  initialData,
}) => {
  const [formData, setFormData] = useState(initialData || {});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const {
    showWarningModal,
    handleDiscard,
    handleContinueEditing,
    warningMessages,
  } = useUnsavedChangesWarning({
    isDirty,
    onDiscard: onClose,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setIsDirty(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Clinical Assessment Fields */}
        <div className="space-y-4">
          {/* Pain Scale Field */}
          <div>
            <label className="text-sm font-medium">
              Escala de Dolor (0-10)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={formData.painScale || 0}
              onChange={(e) => handleChange('painScale', e.target.value)}
              className="w-full"
            />
          </div>

          {/* Other assessment fields would go here */}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleDiscard}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Guardar Evaluación
          </button>
        </div>
      </form>

      {showWarningModal && (
        <Modal
          isOpen={showWarningModal}
          onClose={handleContinueEditing}
          title={warningMessages.title}
        >
          <div className="p-6">
            <p className="text-gray-700 mb-4">{warningMessages.message}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleContinueEditing}
                className="px-4 py-2 text-primary-600 hover:text-primary-700"
              >
                {warningMessages.continueButton}
              </button>
              <button
                onClick={handleDiscard}
                className="px-4 py-2 text-red-600 hover:text-red-700"
              >
                {warningMessages.discardButton}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};