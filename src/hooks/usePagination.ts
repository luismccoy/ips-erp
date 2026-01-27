import { useState, useCallback, useRef } from 'react';

interface PaginationResult<T> {
    data: T[];
    nextToken?: string | null;
}

interface PaginationOptions<T> {
    limit?: number;
    initialItems?: T[];
}

export function usePagination<T>(options: PaginationOptions<T> = {}) {
    const { initialItems = [] } = options;
    const [items, setItems] = useState<T[]>(initialItems);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    // Use refs to avoid dependency cycle that causes infinite re-renders
    const isLoadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const nextTokenRef = useRef<string | null>(null);

    const loadMore = useCallback(async (
        fetchFn: (token: string | null) => Promise<PaginationResult<T>>,
        isReset = false
    ) => {
        // Use refs for the check to avoid stale closures and dependency cycles
        if (isLoadingRef.current || (!hasMoreRef.current && !isReset)) return;

        isLoadingRef.current = true;
        setIsLoading(true);
        setError(null);
        try {
            const currentToken = isReset ? null : nextTokenRef.current;
            const result = await fetchFn(currentToken);

            setItems(prev => isReset ? result.data : [...prev, ...result.data]);
            nextTokenRef.current = result.nextToken || null;
            setNextToken(result.nextToken || null);
            hasMoreRef.current = !!result.nextToken;
            setHasMore(!!result.nextToken);
        } catch (err) {
            console.error('Pagination error:', err);
            setError(err instanceof Error ? err : new Error('Unknown pagination error'));
        } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
        }
    }, []); // Empty deps - refs are stable

    const reset = useCallback(() => {
        setItems([]);
        setNextToken(null);
        setHasMore(true);
        setError(null);
    }, []);

    return {
        items,
        nextToken,
        isLoading,
        hasMore,
        error,
        loadMore,
        reset,
        setItems
    };
}
