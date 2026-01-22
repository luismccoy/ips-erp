import { useState, useCallback } from 'react';
import { client } from '../amplify-utils';

interface UseApiCallReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    execute: (promise: Promise<T>) => Promise<T>;
    reset: () => void;
}

/**
 * Generic hook for making API calls with loading/error state management.
 * Works with both GraphQL queries/mutations and custom Lambda functions.
 * 
 * Usage examples:
 * 
 * // GraphQL Query
 * const { data, loading, error, execute } = useApiCall();
 * await execute(client.models.Patient.list());
 * 
 * // GraphQL Mutation
 * await execute(client.models.Patient.create({ name: 'John', tenantId: 'tenant-1' }));
 * 
 * // Custom Lambda Query
 * await execute(client.queries.generateRoster({ nurses: [...], unassignedShifts: [...] }));
 */
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

// Export client for direct use in components
export { client };
