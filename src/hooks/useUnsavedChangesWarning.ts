import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface UseUnsavedChangesWarningProps {
  isDirty: boolean;
  onDiscard?: () => void;
}

export const useUnsavedChangesWarning = ({
  isDirty,
  onDiscard,
}: UseUnsavedChangesWarningProps) => {
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle browser back/forward/refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        // Show browser's native warning
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Handle navigation within the app
  useEffect(() => {
    if (!isDirty) {
      setPendingPath(null);
      return;
    }

    // Set up navigation blocker
    const unblock = navigate((nextLocation) => {
      if (location.pathname === nextLocation.pathname) {
        return true;
      }
      
      setPendingPath(nextLocation.pathname);
      setShowWarningModal(true);
      return false;
    });

    return unblock;
  }, [isDirty, location, navigate]);

  const handleDiscard = useCallback(() => {
    setShowWarningModal(false);
    onDiscard?.();
    if (pendingPath) {
      navigate(pendingPath);
    }
    setPendingPath(null);
  }, [navigate, pendingPath, onDiscard]);

  const handleContinueEditing = useCallback(() => {
    setShowWarningModal(false);
    setPendingPath(null);
  }, []);

  const warningMessages = {
    title: '¿Descartar cambios?',
    message: 'Tienes cambios sin guardar. Si cierras ahora, se perderán.', // HIPAA-compliant warning in Spanish
    discardButton: 'Descartar',
    continueButton: 'Seguir Editando'
  };

  return {
    showWarningModal,
    handleDiscard,
    handleContinueEditing,
    warningMessages,
  };
};