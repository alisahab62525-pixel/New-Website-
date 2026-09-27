import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Mail, MapPin, Package, Phone, Search, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customerService';
import { orderService } from '../../services/orderService';
import { dbStore } from '../../services/store';
import { Customer, Order } from '../../types';
import { formatDate, formatPrice } from '../../utils/formatters';

export const AdminCustomersPage: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    if (!user) return;
    customerService.getAllCustomers(user).then((list) => {
      setCustomers(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCustomers();
    const unsub = dbStore.subscribe(fetchCustomers);
    return unsub;
  }, [user]);

  const handleOpenCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    if (!user) return;
    try {
      const orders = await orderService.getOrdersByCustomer(cust.id, user);
      setCustomerOrders(orders);
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Registered Customers</h1>
          <p className="text-xs text-stone-400 mt-1">
            Browse buyer directories, order history, and lifetime spending.
          </p>
        </div>

        <div className="text-xs text-stone-400">
          Total customers: <span className="font-bold text-white">{customers.length}</span>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-stone-800">
          <div className="relative max-w-sm">
            <input
              type="text"
              placeholder="Search customer name, email, phone..."
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
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">{c.email}</td>
                  <td className="py-3.5 px-4 text-stone-300 font-mono text-[11px]">{c.phone}</td>
                  <td className="py-3.5 px-4 text-stone-400">{formatDate(c.createdAt)}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-white tabular-nums">
                    {c.orderCount}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-400 tabular-nums">
                    {formatPrice(c.totalSpent)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleOpenCustomer(c)}
                      className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Inspection Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 text-xs text-stone-300 relative my-8">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Overview */}
            <div className="flex items-center gap-4 pb-4 border-b border-stone-800">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xl">
                {selectedCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-white">
                  {selectedCustomer.name}
                </h3>
                <div className="text-stone-400 mt-0.5">
                  {selectedCustomer.email} · {selectedCustomer.phone}
                </div>
                <div className="text-[11px] text-amber-400 font-semibold mt-1">
                  Customer ID: {selectedCustomer.id} · Registered {formatDate(selectedCustomer.createdAt)}
                </div>
              </div>
            </div>

            {/* Delivery Addresses */}
            <div className="space-y-2">
              <div className="font-bold uppercase tracking-wider text-stone-400">
                Saved Delivery Addresses ({selectedCustomer.addresses.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedCustomer.addresses.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-stone-800/60 border border-stone-700/60 space-y-1">
                    <span className="font-bold text-white">
                      {a.label} · {a.recipientName}
                    </span>
                    <div className="text-stone-400 text-[11px]">
                      {a.streetAddress}, {a.area}, {a.city} {a.postalCode}
                    </div>
                    <div className="text-stone-500 text-[10px]">Phone: {a.phone}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Orders */}
            <div className="space-y-3 pt-2">
              <div className="font-bold uppercase tracking-wider text-stone-400">
                Order History ({customerOrders.length})
              </div>
              {customerOrders.length === 0 ? (
                <div className="p-4 text-center text-stone-500 bg-stone-950/40 rounded-xl">
                  No orders placed by this customer yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {customerOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-stone-800/40 border border-stone-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-amber-400">#{ord.id}</span>
                        <span className="text-stone-400 ml-2">
                          {formatDate(ord.createdAt)} · {ord.paymentMethod}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white tabular-nums">
                          {formatPrice(ord.grandTotal)}
                        </span>
                        <Link
                          to={`/admin/orders/${ord.id}`}
                          onClick={() => setSelectedCustomer(null)}
                          className="text-amber-400 hover:underline font-semibold"
                        >
                          Open &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
