import { useState, useCallback } from 'react';

interface PaginationResult<T> {
    data: T[];
    nextToken?: string | null;
}

interface PaginationOptions<T> {
    limit?: number;
    initialItems?: T[];
}

export function usePagination<T>(options: PaginationOptions<T> = {}) {
    const { limit = 50, initialItems = [] } = options;
    const [items, setItems] = useState<T[]>(initialItems);
    const [nextToken, setNextToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const loadMore = useCallback(async (
        fetchFn: (token: string | null) => Promise<PaginationResult<T>>,
        isReset = false
    ) => {
        if (isLoading || (!hasMore && !isReset)) return;

        setIsLoading(true);
        setError(null);
        try {
            const currentToken = isReset ? null : nextToken;
            const result = await fetchFn(currentToken);

            setItems(prev => isReset ? result.data : [...prev, ...result.data]);
            setNextToken(result.nextToken || null);
            setHasMore(!!result.nextToken);
        } catch (err) {
            console.error('Pagination error:', err);
            setError(err instanceof Error ? err : new Error('Unknown pagination error'));
        } finally {
            setIsLoading(false);
        }
    }, [nextToken, isLoading, hasMore]);

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
