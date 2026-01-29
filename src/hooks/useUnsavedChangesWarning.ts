import { useEffect, useCallback, useState } from 'react';

interface UseUnsavedChangesWarningProps {
  isDirty: boolean;
  onDiscard?: () => void;
  warningTitle?: string;
  warningMessage?: string;
  continueEditingText?: string;
  discardText?: string;
}

/**
 * Hook to warn users about unsaved changes.
 * 
 * NOTE: This app does NOT use React Router, so we only handle:
 * - Browser beforeunload events (refresh, close tab)
 * - Manual callback-based navigation (via onDiscard prop)
 * 
 * For apps using React Router, you would also block navigation
 * with useBlocker() or similar.
 */
export const useUnsavedChangesWarning = ({
  isDirty,
  onDiscard,
  warningTitle = "¿Descartar cambios?",
  warningMessage = "Tienes cambios sin guardar. Si cierras ahora, se perderán.",
  continueEditingText = "Seguir Editando",
  discardText = "Descartar"
}: UseUnsavedChangesWarningProps) => {
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Handle browser navigation events (refresh, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const handleDiscard = useCallback(() => {
    setShowWarningModal(false);
    onDiscard?.();
  }, [onDiscard]);

  const handleContinueEditing = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  const warningMessages = {
    title: warningTitle,
    message: warningMessage,
    continueEditingText,
    discardText
  };

  return {
    showWarningModal,
    handleDiscard,
    handleContinueEditing,
    warningMessages,
  };
};
