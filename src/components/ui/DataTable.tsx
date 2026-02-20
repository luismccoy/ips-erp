import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CaretUp, CaretDown, CaretUpDown, CaretLeft, CaretRight, Tray } from '@phosphor-icons/react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    width?: string;
    render?: (row: T, index: number) => React.ReactNode;
    /** If set, renders Avatar + text. Value should be the key for the name field. */
    avatar?: { nameKey: string; imageKey?: string };
    /** If set, renders a Badge. Map row value to Badge variant. */
    badge?: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral' }>;
}

interface PaginationConfig {
    pageSize: number;
    showPageNumbers?: boolean;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T, index: number) => void;
    pagination?: PaginationConfig;
    emptyMessage?: string;
    emptyIcon?: React.ReactNode;
    className?: string;
    stickyHeader?: boolean;
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    onRowClick,
    pagination,
    emptyMessage = 'No hay datos disponibles',
    emptyIcon,
    className = '',
    stickyHeader = false,
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
            else setSortDir('asc');
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
        setCurrentPage(1);
    };

    const sortedData = useMemo(() => {
        if (!sortKey || !sortDir) return data;
        return [...data].sort((a, b) => {
            const aVal = a[sortKey];
            const bVal = b[sortKey];
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;
            const cmp = typeof aVal === 'string'
                ? aVal.localeCompare(bVal as string)
                : (aVal as number) - (bVal as number);
            return sortDir === 'asc' ? cmp : -cmp;
        });
    }, [data, sortKey, sortDir]);

    const pageSize = pagination?.pageSize ?? sortedData.length;
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const paginatedData = pagination
        ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : sortedData;

    const SortIcon = ({ columnKey }: { columnKey: string }) => {
        if (sortKey !== columnKey) return <CaretUpDown size={14} className="text-slate-300" />;
        if (sortDir === 'asc') return <CaretUp size={14} className="text-blue-600" />;
        return <CaretDown size={14} className="text-blue-600" />;
    };

    const renderCell = (col: Column<T>, row: T, rowIndex: number) => {
        if (col.render) return col.render(row, rowIndex);

        if (col.avatar) {
            const name = row[col.avatar.nameKey] ?? '';
            const image = col.avatar.imageKey ? row[col.avatar.imageKey] : undefined;
            return (
                <div className="flex items-center gap-3">
                    <Avatar name={name} src={image} size="sm" />
                    <span className="font-medium text-slate-900">{name}</span>
                </div>
            );
        }

        if (col.badge) {
            const value = String(row[col.key] ?? '');
            const badgeConfig = col.badge[value];
            if (badgeConfig) {
                return <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>;
            }
            return <span className="text-slate-500">{value}</span>;
        }

        const value = row[col.key];
        return <span className="text-slate-700">{value != null ? String(value) : '—'}</span>;
    };

    if (data.length === 0) {
        return (
            <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
                <div className="flex flex-col items-center justify-center py-16 px-6">
                    {emptyIcon || <Tray size={48} className="text-slate-300 mb-3" />}
                    <p className="text-sm text-slate-400 font-medium">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={`bg-slate-50 border-b border-slate-200 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-100 transition-colors' : ''}`}
                                    style={col.width ? { width: col.width } : undefined}
                                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.header}
                                        {col.sortable && <SortIcon columnKey={col.key} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, i) => (
                            <motion.tr
                                key={(row as any).id ?? i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.3) }}
                                onClick={onRowClick ? () => onRowClick(row, (currentPage - 1) * pageSize + i) : undefined}
                                className={`
                                    border-b border-slate-100 last:border-b-0
                                    transition-colors duration-150
                                    ${onRowClick ? 'cursor-pointer hover:bg-blue-50/50' : 'hover:bg-slate-50/50'}
                                `}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 text-sm">
                                        {renderCell(col, row, (currentPage - 1) * pageSize + i)}
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50">
                    <p className="text-xs text-slate-500">
                        {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <CaretLeft size={16} />
                        </button>
                        {pagination.showPageNumbers !== false && Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let page: number;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                                        page === currentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <CaretRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
