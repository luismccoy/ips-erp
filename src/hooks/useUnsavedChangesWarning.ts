import { useEffect, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface UseUnsavedChangesWarningProps {
  isDirty: boolean;
  onDiscard?: () => void;
  warningTitle?: string;
  warningMessage?: string;
  continueEditingText?: string;
  discardText?: string;
}

export const useUnsavedChangesWarning = ({
  isDirty,
  onDiscard,
  warningTitle = "¿Descartar cambios?",
  warningMessage = "Tienes cambios sin guardar. Si cierras ahora, se perderán.",
  continueEditingText = "Seguir Editando",
  discardText = "Descartar"
}: UseUnsavedChangesWarningProps) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle browser navigation events
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = warningMessage;
        return warningMessage;
      }
    };

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, warningMessage]);

  // Handle in-app navigation
  useEffect(() => {
    if (pendingNavigation && !showWarningModal) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, showWarningModal, navigate]);

  const handleNavigation = useCallback((nextLocation: string) => {
    if (isDirty) {
      setShowWarningModal(true);
      setPendingNavigation(nextLocation);
      return false;
    }
    return true;
  }, [isDirty]);

  const handleDiscard = useCallback(() => {
    setShowWarningModal(false);
    onDiscard?.();
  }, [onDiscard]);

  const handleContinueEditing = useCallback(() => {
    setShowWarningModal(false);
    setPendingNavigation(null);
  }, []);

  const warningMessages = {
    title: warningTitle,
    message: warningMessage,
    continueEditing: continueEditingText,
    discard: discardText,
  };

  return {
    showWarningModal,
    handleDiscard,
    handleContinueEditing,
    warningMessages,
    handleNavigation,
  };
};

export default useUnsavedChangesWarning;