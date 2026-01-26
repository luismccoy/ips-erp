import { useState, useEffect, useCallback } from 'react';

interface UseLoadingTimeoutOptions {
    /** Timeout in milliseconds before showing error state (default: 15000) */
    timeoutMs?: number;
    /** Callback when timeout is reached */
    onTimeout?: () => void;
}

interface UseLoadingTimeoutReturn {
    /** Whether we're in loading state */
    isLoading: boolean;
    /** Whether timeout was reached */
    hasTimedOut: boolean;
    /** Error message if timed out */
    timeoutError: string | null;
    /** Start loading (resets timeout) */
    startLoading: () => void;
    /** Stop loading (success) */
    stopLoading: () => void;
    /** Reset to initial state */
    reset: () => void;
    /** Retry function - resets and starts loading again */
    retry: () => void;
}

/**
 * Hook to manage loading states with automatic timeout.
 * Prevents infinite loading spinners by showing error state after timeout.
 * 
 * @example
 * const { isLoading, hasTimedOut, startLoading, stopLoading, retry } = useLoadingTimeout({
 *   timeoutMs: 10000,
 *   onTimeout: () => console.log('Loading timed out!')
 * });
 */
export function useLoadingTimeout(options: UseLoadingTimeoutOptions = {}): UseLoadingTimeoutReturn {
    const { timeoutMs = 15000, onTimeout } = options;
    
    const [isLoading, setIsLoading] = useState(false);
    const [hasTimedOut, setHasTimedOut] = useState(false);
    const [timeoutError, setTimeoutError] = useState<string | null>(null);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        if (isLoading && !hasTimedOut) {
            timer = setTimeout(() => {
                setHasTimedOut(true);
                setIsLoading(false);
                setTimeoutError(`La solicitud tardó demasiado (>${timeoutMs / 1000}s). Por favor, intente de nuevo.`);
                onTimeout?.();
            }, timeoutMs);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isLoading, hasTimedOut, timeoutMs, onTimeout]);

    const startLoading = useCallback(() => {
        setIsLoading(true);
        setHasTimedOut(false);
        setTimeoutError(null);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setHasTimedOut(false);
        setTimeoutError(null);
    }, []);

    const retry = useCallback(() => {
        reset();
        // Small delay before starting again to ensure state is reset
        setTimeout(() => {
            startLoading();
        }, 100);
    }, [reset, startLoading]);

    return {
        isLoading,
        hasTimedOut,
        timeoutError,
        startLoading,
        stopLoading,
        reset,
        retry,
    };
}

export default useLoadingTimeout;
