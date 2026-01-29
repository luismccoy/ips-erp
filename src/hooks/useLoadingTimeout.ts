import { useState, useEffect, useCallback, useRef } from 'react';

interface UseLoadingTimeoutOptions {
  timeoutMs?: number;
  maxRetries?: number;
  retryCount?: number;
  onTimeout?: () => void;
  timeoutMessage?: string;
}

type UseLoadingTimeoutReturn = {
  isLoading: boolean;
  hasTimedOut: boolean;
  timeoutError: string;
  currentRetryCount: number;
  canRetry: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  retry: () => boolean;
  reset: () => void;
};

const DEFAULT_TIMEOUT_MESSAGE = 'La operación tardó demasiado. Por favor, intente nuevamente.';

export const useLoadingTimeout = (
  isLoadingOrOptions?: boolean | UseLoadingTimeoutOptions,
  options?: UseLoadingTimeoutOptions
): UseLoadingTimeoutReturn => {
  const hasExternalLoading = typeof isLoadingOrOptions === 'boolean';
  const resolvedOptions = (hasExternalLoading ? options : isLoadingOrOptions) ?? {};
  const {
    timeoutMs = 30000,
    maxRetries,
    retryCount,
    onTimeout,
    timeoutMessage,
  } = resolvedOptions;

  const effectiveMaxRetries =
    typeof maxRetries === 'number' ? maxRetries : (typeof retryCount === 'number' ? retryCount : 1);

  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = hasExternalLoading ? (isLoadingOrOptions as boolean) : internalLoading;
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [currentRetryCount, setCurrentRetryCount] = useState(0);
  const [timeoutError, setTimeoutError] = useState('');

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimeoutTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const startTimeoutTimer = useCallback(() => {
    clearTimeoutTimer();
    if (!timeoutMs || timeoutMs <= 0) return;
    timeoutIdRef.current = setTimeout(() => {
      setHasTimedOut(true);
      setTimeoutError(timeoutMessage || DEFAULT_TIMEOUT_MESSAGE);
      onTimeout?.();
    }, timeoutMs);
  }, [timeoutMs, clearTimeoutTimer, onTimeout, timeoutMessage]);

  useEffect(() => {
    if (isLoading) {
      startTimeoutTimer();
    } else {
      clearTimeoutTimer();
      setHasTimedOut(false);
      setTimeoutError('');
    }

    return () => {
      clearTimeoutTimer();
    };
  }, [isLoading, startTimeoutTimer, clearTimeoutTimer]);

  const startLoading = useCallback(() => {
    if (!hasExternalLoading) {
      setInternalLoading(true);
    }
    setHasTimedOut(false);
    setTimeoutError('');
  }, [hasExternalLoading]);

  const stopLoading = useCallback(() => {
    if (!hasExternalLoading) {
      setInternalLoading(false);
    }
    clearTimeoutTimer();
  }, [hasExternalLoading, clearTimeoutTimer]);

  const retry = useCallback(() => {
    if (currentRetryCount < effectiveMaxRetries) {
      setHasTimedOut(false);
      setTimeoutError('');
      setCurrentRetryCount(prev => prev + 1);
      if (isLoading) {
        startTimeoutTimer();
      }
      return true;
    }
    return false;
  }, [currentRetryCount, effectiveMaxRetries, isLoading, startTimeoutTimer]);

  const reset = useCallback(() => {
    setHasTimedOut(false);
    setTimeoutError('');
    setCurrentRetryCount(0);
    clearTimeoutTimer();
    if (!hasExternalLoading) {
      setInternalLoading(false);
    }
  }, [clearTimeoutTimer, hasExternalLoading]);

  return {
    isLoading,
    hasTimedOut,
    timeoutError,
    currentRetryCount,
    canRetry: currentRetryCount < effectiveMaxRetries,
    startLoading,
    stopLoading,
    retry,
    reset,
  };
};

export default useLoadingTimeout;
