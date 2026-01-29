import { useState, useEffect, useCallback } from 'react';

interface LoadingTimeoutOptions {
  timeoutMs?: number;
  onTimeout?: () => void;
  retryCount?: number;
}

export function useLoadingTimeout(
  isLoading: boolean,
  options: LoadingTimeoutOptions = {}
) {
  const { 
    timeoutMs = 30000,  // Default 30 seconds as specified
    onTimeout,
    retryCount = 1 
  } = options;

  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [currentRetryCount, setCurrentRetryCount] = useState(0);

  useEffect(() => {
    // Reset timeout when loading starts
    if (isLoading) {
      setHasTimedOut(false);
    }

    // If not loading, don't set up timeout
    if (!isLoading) {
      return;
    }

    const timer = setTimeout(() => {
      // Check if we have retries left
      if (currentRetryCount < retryCount) {
        setCurrentRetryCount(prev => prev + 1);
        onTimeout?.(); // Call optional timeout handler
      } else {
        // No more retries, set timed out
        setHasTimedOut(true);
      }
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isLoading, timeoutMs, retryCount, currentRetryCount, onTimeout]);

  const retry = useCallback(() => {
    // Reset timeout and retry count
    setHasTimedOut(false);
    setCurrentRetryCount(0);
  }, []);

  return { 
    hasTimedOut, 
    retry,
    currentRetryCount,
    maxRetryCount: retryCount 
  };
}