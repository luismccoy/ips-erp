import { useEffect } from 'react';
import { Package } from 'lucide-react';
import { client, isUsingRealBackend } from '../amplify-utils';
import { usePagination } from '../hooks/usePagination';
import type { InventoryItem } from '../types';

export function InventoryDashboard() {
    const { items: inventory, loadMore, hasMore, isLoading } = usePagination<InventoryItem>();

    useEffect(() => {
        const fetchInventory = async () => {
            if (!isUsingRealBackend()) {
                const { INVENTORY } = await import('../data/mock-data');
                loadMore(async () => ({ data: INVENTORY as any, nextToken: null }), true);
                return;
            }

            loadMore(async (token) => {
                const response = await (client.models.Inventory as any).list({
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
            const response = await (client.models.Inventory as any).list({
                limit: 50,
                nextToken: token
            });
            return { data: response.data || [], nextToken: response.nextToken };
        });
    };


    if (isLoading && inventory.length === 0) {
        return <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center text-slate-400">Loading inventory...</div>;
    }

    if (inventory.length === 0) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-400 mb-4">No inventory items yet</p>
                <p className="text-xs text-slate-500">Add items to track pharmacy inventory</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                <Package size={18} className="text-slate-400" />
                Inventory (Farmacia)
            </h3>
            <div className="space-y-3">
                {inventory.map(item => (
                    <div key={item.id} className="p-4 border border-slate-50 rounded-xl flex justify-between items-center hover:bg-slate-50/50 transition-all">
                        <div>
                            <h4 className="font-bold text-slate-900">{item.name}</h4>
                            <p className="text-xs text-slate-500">{item.unit || 'Unit'}</p>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-black ${item.quantity < item.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
                                {item.quantity}
                            </div>
                            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Threshold: {item.reorderLevel}</div>
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
        </div>
    );
}
