import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Package,
  Plus,
  RotateCcw,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminService, DashboardStats } from '../../services/adminService';
import { dbStore } from '../../services/store';
import { formatDate, formatPrice } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    if (!user || user.role !== 'admin') return;
    adminService.getDashboardStats(user).then((res) => {
      setStats(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchStats();
    const unsub = dbStore.subscribe(fetchStats);
    return unsub;
  }, [user]);

  if (loading || !stats) {
    return (
      <div className="p-8 text-center text-xs text-stone-500 animate-pulse">
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Store Dashboard</h1>
          <p className="text-xs text-stone-400 mt-1">
            Real-time operations overview, order fulfillment, and catalog status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-all"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>Manage Products</span>
          </Link>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Store Owner Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/30 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold font-heading text-base shrink-0 shadow-md">
            AS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Ali Sahab</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Store Owner & Admin
              </span>
            </div>
            <div className="text-xs text-stone-400 mt-0.5">
              Account: <strong className="text-stone-300">alisahab62525@gmail.com</strong> · Ali Online Store
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Link
            to="/admin/products"
            className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-colors"
          >
            Add / Clear Products
          </Link>
          <Link
            to="/admin/settings"
            className="text-xs px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-medium transition-colors"
          >
            Store Settings
          </Link>
          <a
            href="/"
            className="text-xs px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-medium transition-colors"
          >
            Visit Website &rarr;
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Gross Sales</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-heading tabular-nums">
            {formatPrice(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-stone-500">From completed & active orders</div>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Total Orders</span>
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <ShoppingCart className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-heading tabular-nums">
            {stats.totalOrders}
          </div>
          <div className="text-[11px] text-stone-500">
            {stats.ordersByStatus.Pending} pending verification
          </div>
        </div>

        {/* Total Products */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Catalog Items</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-heading tabular-nums">
            {stats.totalProducts}
          </div>
          <div className="text-[11px] text-stone-500">
            {stats.lowStockCount > 0 ? (
              <span className="text-amber-400 font-semibold">
                {stats.lowStockCount} items low in stock
              </span>
            ) : (
              'All products well-stocked'
            )}
          </div>
        </div>

        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Registered Customers</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white font-heading tabular-nums">
            {stats.totalCustomers}
          </div>
          <div className="text-[11px] text-stone-500">Active shopping accounts</div>
        </div>
      </div>

      {/* Orders Status Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
          Order Pipeline Stages
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/admin/orders?status=Pending"
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pending</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              {stats.ordersByStatus.Pending}
            </div>
          </Link>

          <Link
            to="/admin/orders?status=Confirmed"
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Confirmed</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              {stats.ordersByStatus.Confirmed}
            </div>
          </Link>

          <Link
            to="/admin/orders?status=Processing"
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Package className="w-3.5 h-3.5 text-purple-400" />
              <span>Processing</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              {stats.ordersByStatus.Processing}
            </div>
          </Link>

          <Link
            to="/admin/orders?status=Shipped"
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Shipped</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              {stats.ordersByStatus.Shipped}
            </div>
          </Link>

          <Link
            to="/admin/orders?status=Delivered"
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Delivered</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              {stats.ordersByStatus.Delivered}
            </div>
          </Link>

          <Link
            to="/admin/orders?status=Cancelled"
            className="p-4 rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Cancelled</span>
            </div>
            <div className="text-xl font-bold text-white mt-1 tabular-nums">
              {stats.ordersByStatus.Cancelled}
            </div>
          </Link>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {stats.lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 text-amber-200 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold">Low Stock Warning: </span>
              <span>{stats.lowStockCount} products are nearing or below their minimum stock threshold.</span>
            </div>
          </div>

          <Link
            to="/admin/inventory"
            className="px-3 py-1.5 bg-amber-500 text-stone-950 rounded-xl font-bold shrink-0 hover:bg-amber-400"
          >
            Manage Inventory
          </Link>
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <h2 className="font-heading font-bold text-base text-white">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Total</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {stats.recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">#{ord.id}</td>
                  <td className="py-3 px-3 font-semibold text-white">{ord.customerName}</td>
                  <td className="py-3 px-3 text-stone-400">{formatDate(ord.date)}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.status === 'Delivered'
                          ? 'bg-emerald-950 text-emerald-300'
                          : ord.status === 'Shipped'
                          ? 'bg-sky-950 text-sky-300'
                          : ord.status === 'Cancelled'
                          ? 'bg-rose-950 text-rose-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold tabular-nums">
                    {formatPrice(ord.total)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Link
                      to={`/admin/orders/${ord.id}`}
                      className="text-xs font-semibold text-amber-400 hover:underline"
                    >
                      Manage &rarr;
                    </Link>
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
