import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Eye,
  Filter,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { dbStore } from '../../services/store';
import { Order, OrderStatus } from '../../types';
import { formatDate, formatPrice } from '../../utils/formatters';

export const AdminOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    if (!user) return;
    orderService.getAllAdminOrders(user).then((all) => {
      setOrders(all);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
    const unsub = dbStore.subscribe(fetchOrders);
    return unsub;
  }, [user]);

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (selectedStatus !== 'All') {
      result = result.filter((o) => o.orderStatus === selectedStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      );
    }

    return result;
  }, [orders, selectedStatus, searchQuery]);

  const statuses = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Order Management</h1>
          <p className="text-xs text-stone-400 mt-1">
            Review, verify, and fulfill orders across all customer accounts.
          </p>
        </div>

        <div className="text-xs text-stone-400">
          Total orders: <span className="font-bold text-white tabular-nums">{orders.length}</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => {
                setSelectedStatus(st);
                setSearchParams(st === 'All' ? {} : { status: st });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {st}
              {st === 'All'
                ? ` (${orders.length})`
                : ` (${orders.filter((o) => o.orderStatus === st).length})`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search by ID, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 animate-pulse">
            Loading orders catalog...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 space-y-2">
            <ShoppingCart className="w-8 h-8 mx-auto text-stone-600" />
            <div className="font-bold text-stone-300">No orders match current criteria</div>
            <div>Try adjusting search or status filters.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider bg-stone-950/40">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Order Date</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      #{ord.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-[11px] text-stone-500 truncate max-w-[150px]">
                        {ord.customerEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-300 font-mono text-[11px]">
                      {ord.customerPhone}
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">
                      {ord.deliveryAddress.city}
                    </td>
                    <td className="py-3.5 px-4 text-stone-300">
                      <div>{ord.paymentMethod}</div>
                      <span className="text-[10px] text-stone-500">
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                            : ord.orderStatus === 'Shipped'
                            ? 'bg-sky-950 text-sky-300 border border-sky-800/50'
                            : ord.orderStatus === 'Processing'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                            : ord.orderStatus === 'Confirmed'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                            : ord.orderStatus === 'Cancelled'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {formatDate(ord.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white tabular-nums">
                      {formatPrice(ord.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        to={`/admin/orders/${ord.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 font-semibold rounded-xl text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
