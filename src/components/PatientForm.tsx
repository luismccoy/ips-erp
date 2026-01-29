import React, { useState, useEffect } from 'react';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';
import { Modal } from './Modal'; // Assuming we have a Modal component

interface PatientFormProps {
  onSubmit: (data: any) => void;
  onClose: () => void;
  initialData?: any;
}

export const PatientForm: React.FC<PatientFormProps> = ({
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
      <form onSubmit={handleSubmit}>
        {/* Form fields go here */}
        
        <div className="flex justify-end space-x-4 mt-4">
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
            Guardar
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