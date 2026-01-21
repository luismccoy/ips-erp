import { useState, useCallback } from 'react';

interface UseApiCallReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (promise: Promise<T>) => Promise<T>;
    reset: () => void;
}

export function useApiCall<T>(): UseApiCallReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async (promise: Promise<T>) => {
        setLoading(true);
        setError(null);
        try {
            const result = await promise;
            setData(result);
            return result;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error(String(err));
            setError(errorObj);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { data, loading, error, execute, reset };
}
