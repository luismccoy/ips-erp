import { useEffect, useState } from 'react';
import { Package, Plus, X, AlertTriangle, Check, RefreshCw } from 'lucide-react';
// import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils'; // client temporarily disabled for mutations until permissions fixed
import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';
import { ErrorState } from './ui/ErrorState';
import type { InventoryItem } from '../types';
import { graphqlToFrontendSafe, frontendToGraphQLSafe } from '../utils/inventory-transforms';

export function InventoryDashboard() {
    const { items: inventory, setItems, loadMore, hasMore, isLoading: isPaginationLoading } = usePagination<InventoryItem>();
    const { isLoading, hasTimedOut, startLoading, stopLoading, reset: resetLoading } = useLoadingTimeout();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(0);
    const [newItemUnit, setNewItemUnit] = useState('Units');
    const [newItemReorder, setNewItemReorder] = useState(10);
    const [newItemSku, setNewItemSku] = useState('');

    const fetchInventory = async () => {
        startLoading();
        
        // Always use the client - it returns mock data in demo mode
        await loadMore(async (token) => {
            try {
                const response = await (client.models.InventoryItem as any).list({
                    limit: 50,
                    nextToken: token
                });

                // Transform status from GraphQL format (IN_STOCK) to frontend format (in-stock) if needed
                const transformedData = (response.data || []).map((item: any) => ({
                    ...item,
                    status: item.status ? graphqlToFrontendSafe(item.status) || 'in-stock' : 'in-stock'
                }));

                stopLoading();
                return { data: transformedData, nextToken: response.nextToken };
            } catch (error) {
                console.error('Failed to fetch inventory:', error);
                stopLoading();
                return { data: [], nextToken: null };
            }
        }, true);
    };

    useEffect(() => {
        fetchInventory();
    }, [loadMore]);

    const handleLoadMore = () => {
        if (!isUsingRealBackend()) {
            // Mock backend doesn't support pagination
            return;
        }

        loadMore(async (token) => {
            try {
                const response = await (client.models.InventoryItem as any).list({
                    limit: 50,
                    nextToken: token
                });

                // Transform status from GraphQL format (IN_STOCK) to frontend format (in-stock)
                const transformedData = (response.data || []).map((item: any) => ({
                    ...item,
                    status: graphqlToFrontendSafe(item.status) || 'in-stock' // Fallback to safe default
                }));

                return { data: transformedData, nextToken: response.nextToken };
            } catch (error) {
                console.error('Failed to load more inventory:', error);
                return { data: [], nextToken: null };
            }
        });
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Calculate frontend status based on quantity
            const frontendStatus = newItemQuantity > 0 ? 'in-stock' : 'out-of-stock';

            if (isUsingRealBackend()) {
                // Transform status to GraphQL format before sending to backend
                const graphqlStatus = frontendToGraphQLSafe(frontendStatus);

                // P1 Fix: ADMIN group now has create/update/delete permissions in amplify/data/resource.ts
                await (client.models.InventoryItem as any).create({
                    name: newItemName,
                    quantity: newItemQuantity,
                    unit: newItemUnit,
                    reorderLevel: newItemReorder,
                    sku: newItemSku,
                    status: graphqlStatus,
                    tenantId: MOCK_USER.attributes['custom:tenantId']
                });
            }

            // Optimistic update for UI testing (uses frontend format)
            const tempItem: any = {
                id: `temp-${Date.now()}`,
                name: newItemName,
                quantity: newItemQuantity,
                unit: newItemUnit,
                reorderLevel: newItemReorder,
                sku: newItemSku,
                status: frontendStatus, // Frontend format for display
                tenantId: MOCK_USER.attributes['custom:tenantId']
            };

            setItems(prev => [tempItem, ...prev]);
            setIsAddModalOpen(false);
            resetForm();
            // In future: Show toast
        } catch (error) {
            console.error('Failed to add item:', error);
            alert('No se pudo agregar el artículo');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setIsSubmitting(true);
        try {
            // Calculate frontend status based on quantity and reorder level
            const frontendStatus = newItemQuantity <= 0
                ? 'out-of-stock'
                : newItemQuantity <= editingItem.reorderLevel
                    ? 'low-stock'
                    : 'in-stock';

            if (isUsingRealBackend()) {
                // Transform status to GraphQL format before sending to backend
                const graphqlStatus = frontendToGraphQLSafe(frontendStatus);

                // P1 Fix: ADMIN group now has create/update/delete permissions in amplify/data/resource.ts
                await (client.models.InventoryItem as any).update({
                    id: editingItem.id,
                    quantity: newItemQuantity,
                    status: graphqlStatus
                });
            }

            // Optimistic update (uses frontend format)
            setItems(prev => prev.map(item =>
                item.id === editingItem.id
                    ? { ...item, quantity: newItemQuantity, status: frontendStatus }
                    : item
            ));
            setEditingItem(null);
        } catch (error) {
            console.error('Failed to update stock:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setNewItemQuantity(item.quantity);
    };

    const resetForm = () => {
        setNewItemName('');
        setNewItemQuantity(0);
        setNewItemUnit('Units');
        setNewItemReorder(10);
        setNewItemSku('');
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 relative">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                    <Package size={18} className="text-slate-400" />
                    Inventario (Farmacia)
                </h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
                >
                    <Plus size={16} /> Agregar Ítem
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading && inventory.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed animate-pulse">
                        <div className="flex flex-col items-center gap-2">
                            <RefreshCw className="text-blue-500 animate-spin" size={24} />
                            <p className="text-sm font-bold text-slate-400 font-mono uppercase tracking-widest">Cargando inventario...</p>
                        </div>
                    </div>
                )}

                {hasTimedOut && inventory.length === 0 && (
                    <ErrorState
                        title="Tiempo de espera agotado"
                        message="El sistema de inventario está tardando más de lo usual. Puede ser por problemas de conexión o permisos faltantes."
                        onRetry={fetchInventory}
                    />
                )}

                {!isLoading && !hasTimedOut && inventory.length === 0 && (
                    <div className="text-center py-8 text-slate-400">No se encontraron ítems. Agregue el primero arriba.</div>
                )}

                {inventory.map(item => (
                    <div
                        key={item.id}
                        onClick={() => openEditModal(item)}
                        className="p-4 border border-slate-50 rounded-xl flex justify-between items-center hover:bg-slate-50 hover:border-slate-200 cursor-pointer transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${item.quantity < item.reorderLevel ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                                <Package size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-[#2563eb] transition-colors">{item.name}</h4>
                                <p className="text-xs text-slate-500 flex gap-2">
                                    <span>{item.unit || 'Unit'}</span>
                                    {item.sku && <span className="text-slate-300">• SKU: {item.sku}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-black ${item.quantity < item.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
                                {item.quantity}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                                Mínimo: {item.reorderLevel}
                            </div>
                        </div>
                    </div>
                ))}
                {hasMore && (
                    <button
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="w-full py-2 mt-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Cargando más...' : 'Ver más ítems'}
                    </button>
                )}
            </div>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900">Agregar Ítem al Inventario</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Ítem</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                    placeholder="ej. Acetaminofén 500mg"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Cantidad Inicial</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                        value={newItemQuantity}
                                        onChange={e => setNewItemQuantity(Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alerta Stock Bajo</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                        value={newItemReorder}
                                        onChange={e => setNewItemReorder(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Unit</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                        placeholder="Caja, Tableta, Ampolla"
                                        value={newItemUnit}
                                        onChange={e => setNewItemUnit(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU (Opcional)</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                        placeholder="MED-001"
                                        value={newItemSku}
                                        onChange={e => setNewItemSku(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : 'Crear Ítem'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Stock Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Actualizar Stock</h3>
                                <p className="text-xs text-slate-400">{editingItem.name}</p>
                            </div>
                            <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateStock} className="space-y-6">
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setNewItemQuantity(Math.max(0, newItemQuantity - 1))}
                                    className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-black text-xl hover:bg-slate-200 transition-colors"
                                >
                                    -
                                </button>
                                <div className="text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-24 text-center text-4xl font-black text-slate-900 border-none focus:ring-0 p-0"
                                        value={newItemQuantity}
                                        onChange={e => setNewItemQuantity(Math.max(0, Number(e.target.value)))}
                                    />
                                    <div className="text-xs text-slate-400 font-bold uppercase">{editingItem.unit}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setNewItemQuantity(newItemQuantity + 1)}
                                    className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-black text-xl hover:bg-slate-200 transition-colors"
                                >
                                    +
                                </button>
                            </div>

                            {newItemQuantity <= editingItem.reorderLevel && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                                    <AlertTriangle size={16} />
                                    Advertencia: Nivel por debajo del mínimo ({editingItem.reorderLevel})
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <><Check size={18} /> Actualizar Stock</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
