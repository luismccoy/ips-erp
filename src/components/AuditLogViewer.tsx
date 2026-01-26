import { useEffect } from 'react';
import { Shield, Clock, User, Activity } from 'lucide-react';
import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';
import { ErrorState } from './ui/ErrorState';
import type { AuditLog } from '../types';
import { LoadingSpinner } from './ui/LoadingSpinner';

export function AuditLogViewer() {
    const { items: logs, loadMore, hasMore, isLoading: isPaginationLoading } = usePagination<AuditLog>();
    const { isLoading, hasTimedOut, startLoading, stopLoading } = useLoadingTimeout();
    const tenantId = MOCK_USER.attributes['custom:tenantId'];

    const fetchLogs = async () => {
        startLoading();
        if (!isUsingRealBackend()) {
            // Mock logs
            const mockLogs: AuditLog[] = [
                {
                    id: 'log-1',
                    tenantId,
                    userId: 'admin-1',
                    action: 'APPROVE_VISIT',
                    entityType: 'VISIT',
                    entityId: 'visit-123',
                    details: JSON.stringify({ reason: 'Documentation complete' }),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: 'log-2',
                    tenantId,
                    userId: 'nurse-maria',
                    action: 'SUBMIT_VISIT',
                    entityType: 'VISIT',
                    entityId: 'visit-123',
                    details: JSON.stringify({ items: 5 }),
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    updatedAt: new Date(Date.now() - 3600000).toISOString()
                }
            ];
            await loadMore(async () => ({ data: mockLogs, nextToken: null }), true);
            stopLoading();
            return;
        }

        await loadMore(async (token) => {
            try {
                const response = await (client.models.AuditLog as any).list({
                    filter: { tenantId: { eq: tenantId } },
                    limit: 50,
                    nextToken: token
                });
                stopLoading();
                return { data: response.data || [], nextToken: response.nextToken };
            } catch (error) {
                console.error('AuditLog fetch failed:', error);
                stopLoading();
                return { data: [], nextToken: null };
            }
        }, true);
    };

    useEffect(() => {
        fetchLogs();
    }, [tenantId, loadMore]);

    const handleLoadMore = () => {
        loadMore(async (token) => {
            const response = await (client.models.AuditLog as any).list({
                filter: { tenantId: { eq: tenantId } },
                limit: 50,
                nextToken: token
            });
            return { data: response.data || [], nextToken: response.nextToken };
        });
    };

    if (isLoading && logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed animate-pulse">
                <LoadingSpinner size="lg" label="Cargando registros de auditoría..." />
            </div>
        );
    }

    if (hasTimedOut && logs.length === 0) {
        return (
            <ErrorState
                title="Consola de Auditoría Fuera de Línea"
                message="No se pudo sincronizar con el registro de auditoría. Verifique los permisos de administrador en AWS AppSync."
                onRetry={fetchLogs}
            />
        );
    }

    if (logs.length === 0) {
        return (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Shield size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Sin registros</h3>
                <p className="text-slate-500">No se han encontrado registros de auditoría para este periodo.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-black uppercase">
                        <tr>
                            <th className="px-6 py-4">Evento</th>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Entidad</th>
                            <th className="px-6 py-4">Fecha</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${log.action.includes('REJECT') ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                            <Activity size={16} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-slate-900">{log.action}</span>
                                            <p className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{log.details}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <User size={14} />
                                        <span>{log.userId}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                                        {log.entityType}: {log.entityId}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Clock size={12} />
                                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {hasMore && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-50">
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoading}
                            className="w-full py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Cargando más...' : 'Cargar Más Registros'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
