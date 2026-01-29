import React, { useState, useEffect } from 'react';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { Modal } from './ui/Modal';

interface KardexFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: any;
}

export const KardexForm: React.FC<KardexFormProps> = ({
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
        {/* KARDEX Fields */}
        <div className="space-y-4">
          {/* Medication Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium mb-3">Medicamentos</h3>
            {/* Medication fields would go here */}
          </div>

          {/* Treatment Plan Section */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-medium mb-3">Plan de Tratamiento</h3>
            {/* Treatment plan fields would go here */}
          </div>

          {/* Care Instructions Section */}
          <div>
            <h3 className="text-lg font-medium mb-3">Instrucciones de Cuidado</h3>
            {/* Care instruction fields would go here */}
          </div>
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
            Guardar KARDEX
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