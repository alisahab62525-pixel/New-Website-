import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Minus, Package, Plus, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { inventoryService } from '../../services/inventoryService';
import { dbStore } from '../../services/store';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';

export const AdminInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [loading, setLoading] = useState(true);

  const fetchInventory = () => {
    if (!user) return;
    inventoryService.getInventory(user).then((prods) => {
      setProducts(prods);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchInventory();
    const unsub = dbStore.subscribe(fetchInventory);
    return unsub;
  }, [user]);

  const handleAdjustStock = async (productId: string, delta: number) => {
    if (!user) return;
    try {
      await inventoryService.adjustStock(productId, delta, user);
      success('Stock adjusted.');
    } catch (err: any) {
      error(err.message || 'Failed to adjust stock');
    }
  };

  const handleSetStock = async (productId: string, qty: number, threshold?: number) => {
    if (!user) return;
    try {
      await inventoryService.updateStock(productId, Math.max(0, qty), threshold, user);
      success('Inventory level updated.');
    } catch (err: any) {
      error(err.message || 'Failed to update stock');
    }
  };

  const filtered = useMemo(() => {
    let result = [...products];

    if (stockFilter === 'low') {
      result = result.filter((p) => p.stockStatus === 'low_stock');
    } else if (stockFilter === 'out') {
      result = result.filter((p) => p.stockQuantity <= 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, stockFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Stock & Inventory Control</h1>
          <p className="text-xs text-stone-400 mt-1">
            Real-time quantity adjustments, threshold alerts, and warehouse levels.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              stockFilter === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white bg-stone-900 border border-stone-800'
            }`}
          >
            All Items ({products.length})
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              stockFilter === 'low'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white bg-stone-900 border border-stone-800'
            }`}
          >
            Low Stock ({products.filter((p) => p.stockStatus === 'low_stock').length})
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              stockFilter === 'out'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white bg-stone-900 border border-stone-800'
            }`}
          >
            Out of Stock ({products.filter((p) => p.stockQuantity <= 0).length})
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-800">
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-400 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider bg-stone-950/40">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4 text-center">Alert Threshold</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-9 h-9 object-cover rounded-lg bg-stone-800 shrink-0"
                      />
                      <span className="truncate max-w-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-stone-400">{p.sku}</td>
                  <td className="py-3 px-4 tabular-nums text-stone-300">
                    {formatPrice(p.discountPrice || p.price)}
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums text-stone-400">
                    {p.lowStockThreshold} units
                  </td>
                  <td className="py-3 px-4 text-center tabular-nums font-bold text-base text-white">
                    {p.stockQuantity}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stockStatus === 'out_of_stock'
                          ? 'bg-rose-950 text-rose-300'
                          : p.stockStatus === 'low_stock'
                          ? 'bg-amber-950 text-amber-300'
                          : 'bg-emerald-950 text-emerald-300'
                      }`}
                    >
                      {p.stockStatus === 'out_of_stock'
                        ? 'Out of Stock'
                        : p.stockStatus === 'low_stock'
                        ? 'Low Stock Alert'
                        : 'In Stock'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleAdjustStock(p.id, -1)}
                        disabled={p.stockQuantity <= 0}
                        className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30 cursor-pointer"
                        title="Reduce 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(p.id, 1)}
                        className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                        title="Add 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleAdjustStock(p.id, 10)}
                        className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-[11px] cursor-pointer"
                        title="Add 10"
                      >
                        +10
                      </button>
                      {p.stockQuantity > 0 && (
                        <button
                          onClick={() => handleSetStock(p.id, 0)}
                          className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-[10px] font-semibold cursor-pointer"
                        >
                          Mark Out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
