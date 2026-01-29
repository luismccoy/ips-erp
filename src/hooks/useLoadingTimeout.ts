import { useState, useEffect, useCallback } from 'react';

interface UseLoadingTimeoutOptions {
  timeoutMs?: number;
  maxRetries?: number;
  onTimeout?: () => void;
}

export const useLoadingTimeout = (
  isLoading: boolean,
  {
    timeoutMs = 30000,
    maxRetries = 1,
    onTimeout,
  }: UseLoadingTimeoutOptions = {}
) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [currentRetryCount, setCurrentRetryCount] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const clearTimeoutTimer = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId]);

  const startTimeoutTimer = useCallback(() => {
    clearTimeoutTimer();
    const id = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeoutMs);
    setTimeoutId(id);
  }, [timeoutMs, clearTimeoutTimer, onTimeout]);

  useEffect(() => {
    if (isLoading) {
      startTimeoutTimer();
    } else {
      clearTimeoutTimer();
      setHasTimedOut(false);
    }

    return () => {
      clearTimeoutTimer();
    };
  }, [isLoading, startTimeoutTimer, clearTimeoutTimer]);

  const retry = useCallback(() => {
    if (currentRetryCount < maxRetries) {
      setHasTimedOut(false);
      setCurrentRetryCount(prev => prev + 1);
      startTimeoutTimer();
      return true;
    }
    return false;
  }, [currentRetryCount, maxRetries, startTimeoutTimer]);

  const reset = useCallback(() => {
    setHasTimedOut(false);
    setCurrentRetryCount(0);
    clearTimeoutTimer();
  }, [clearTimeoutTimer]);

  return {
    hasTimedOut,
    currentRetryCount,
    canRetry: currentRetryCount < maxRetries,
    retry,
    reset,
  };
};

export default useLoadingTimeout;