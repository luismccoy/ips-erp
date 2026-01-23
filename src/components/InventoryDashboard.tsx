import { useEffect, useState } from 'react';
import { Package, Plus, X, AlertTriangle, Check, RefreshCw } from 'lucide-react';
// import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils'; // client temporarily disabled for mutations until permissions fixed
import { client, isUsingRealBackend, MOCK_USER } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import type { InventoryItem } from '../types';

export function InventoryDashboard() {
    const { items: inventory, setItems, loadMore, hasMore, isLoading } = usePagination<InventoryItem>();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [newItemName, setNewItemName] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(0);
    const [newItemUnit, setNewItemUnit] = useState('Units');
    const [newItemReorder, setNewItemReorder] = useState(10);
    const [newItemSku, setNewItemSku] = useState('');

    useEffect(() => {
        const fetchInventory = async () => {
            if (!isUsingRealBackend()) {
                const { INVENTORY } = await import('../data/mock-data');
                loadMore(async () => ({ data: INVENTORY as any, nextToken: null }), true);
                return;
            }

            loadMore(async (token) => {
                const response = await (client.models.InventoryItem as any).list({
                    limit: 50,
                    nextToken: token
                });
                return { data: response.data || [], nextToken: response.nextToken };
            }, true);
        };

        fetchInventory();
    }, [loadMore]);

    const handleLoadMore = () => {
        loadMore(async (token) => {
            const response = await (client.models.InventoryItem as any).list({
                limit: 50,
                nextToken: token
            });
            return { data: response.data || [], nextToken: response.nextToken };
        });
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Placeholder for real mutation:
            // await client.models.InventoryItem.create({ ... });

            // Optimistic update for UI testing
            const tempItem: any = {
                id: `temp-${Date.now()}`,
                name: newItemName,
                quantity: newItemQuantity,
                unit: newItemUnit,
                reorderLevel: newItemReorder,
                sku: newItemSku,
                status: newItemQuantity > 0 ? 'in-stock' : 'out-of-stock',
                tenantId: MOCK_USER.attributes['custom:tenantId']
            };

            setItems(prev => [tempItem, ...prev]);
            setIsAddModalOpen(false);
            resetForm();
            // In future: Show toast
        } catch (error) {
            console.error('Failed to add item:', error);
            alert('Could not add item (Backend permission pending)');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setIsSubmitting(true);
        try {
            // Placeholder for real mutation:
            // await client.models.InventoryItem.update({ id: editingItem.id, quantity: newItemQuantity });

            // Optimistic update
            setItems(prev => prev.map(item =>
                item.id === editingItem.id
                    ? { ...item, quantity: newItemQuantity, status: newItemQuantity <= 0 ? 'out-of-stock' : 'in-stock' }
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
                    Inventory (Farmacia)
                </h3>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-[#2563eb] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
                >
                    <Plus size={16} /> Add Item
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading && inventory.length === 0 && (
                    <div className="text-center py-8 text-slate-400">Loading inventory...</div>
                )}

                {!isLoading && inventory.length === 0 && (
                    <div className="text-center py-8 text-slate-400">No items found. Add your first item above.</div>
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
                                Threshold: {item.reorderLevel}
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
                            <h3 className="font-bold text-lg text-slate-900">Add Inventory Item</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563eb] font-bold text-slate-900"
                                    placeholder="e.g. Acetaminophen 500mg"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Qty</label>
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
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Low Stock Alert</label>
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
                                        placeholder="Box, Pill, Ampoule"
                                        value={newItemUnit}
                                        onChange={e => setNewItemUnit(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU (Optional)</label>
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
                                    {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : 'Create Item'}
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
                                <h3 className="font-bold text-lg text-slate-900">Update Stock</h3>
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
                                        className="w-24 text-center text-4xl font-black text-slate-900 border-none focus:ring-0 p-0"
                                        value={newItemQuantity}
                                        onChange={e => setNewItemQuantity(Number(e.target.value))}
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
                                    Warning: Level is below threshold ({editingItem.reorderLevel})
                                </div>
                            )}

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-3 bg-[#2563eb] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <><Check size={18} /> Update Stock</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
