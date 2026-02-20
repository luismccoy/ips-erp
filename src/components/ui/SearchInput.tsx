import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

interface SearchInputProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    debounceMs?: number;
    className?: string;
    defaultValue?: string;
}

export function SearchInput({
    placeholder = 'Buscar...',
    onSearch,
    debounceMs = 300,
    className = '',
    defaultValue = '',
}: SearchInputProps) {
    const [value, setValue] = useState(defaultValue);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    const debouncedSearch = useCallback(
        (query: string) => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => onSearch(query), debounceMs);
        },
        [onSearch, debounceMs]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        debouncedSearch(v);
    };

    const handleClear = () => {
        setValue('');
        onSearch('');
    };

    return (
        <div className={`relative ${className}`}>
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all duration-200"
            />
            {value && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                    aria-label="Limpiar búsqueda"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
