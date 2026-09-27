import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Eye,
  LogOut,
  MapPin,
  Package,
  Plus,
  Printer,
  ShieldCheck,
  Trash2,
  Truck,
  User as UserIcon,
} from 'lucide-react';
import { InvoiceView } from '../components/customer/InvoiceView';
import { OrderTimeline } from '../components/customer/OrderTimeline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { Address, Order } from '../types';
import { formatDate, formatPrice } from '../utils/formatters';

export const AccountPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout, refreshUser } = useAuth();
  const { settings } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Address Modal / State
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('Lahore');
  const [newArea, setNewArea] = useState('');
  const [newPostal, setNewPostal] = useState('54000');
  const [newIsDefault, setNewIsDefault] = useState(false);

  // Require customer login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login?redirect=/account', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone);

      // Fetch customer's own orders (Strict privacy enforcement)
      orderService
        .getOrdersByCustomer(user.id, user)
        .then((customerOrders) => {
          setOrders(customerOrders);
          setLoadingOrders(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingOrders(false);
        });

      // Fetch customer's addresses
      authService.getAddresses(user.id).then(setAddresses);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await authService.updateProfile(user.id, {
        name: profileName.trim(),
        phone: profilePhone.trim(),
      });
      await refreshUser();
      success('Profile updated successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const added = await authService.addAddress(user.id, {
        label: newLabel,
        recipientName: newRecipient.trim(),
        phone: newPhone.trim(),
        streetAddress: newStreet.trim(),
        city: newCity.trim(),
        area: newArea.trim() || newCity.trim(),
        postalCode: newPostal.trim() || '54000',
        isDefault: newIsDefault,
      });

      const updated = await authService.getAddresses(user.id);
      setAddresses(updated);
      setShowAddAddressModal(false);
      success('Address added successfully.');
    } catch (err: any) {
      error(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    try {
      await authService.deleteAddress(user.id, addressId);
      const updated = await authService.getAddresses(user.id);
      setAddresses(updated);
      success('Address deleted.');
    } catch (err: any) {
      error(err.message || 'Failed to delete address');
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-stone-500">
        Loading customer account...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Account Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-stone-900 dark:text-white">
              {user.name}
            </h1>
            <p className="text-xs text-stone-500">{user.email} · Customer Account</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Tabs */}
        <aside className="md:col-span-3 space-y-1">
          <button
            onClick={() => {
              setSelectedOrder(null);
              setSearchParams({ tab: 'orders' });
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </div>
            <span className="font-bold tabular-nums text-[11px]">{orders.length}</span>
          </button>

          <button
            onClick={() => {
              setSelectedOrder(null);
              setSearchParams({ tab: 'profile' });
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserIcon className="w-4 h-4" />
              <span>Profile Settings</span>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedOrder(null);
              setSearchParams({ tab: 'addresses' });
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all ${
              activeTab === 'addresses'
                ? 'bg-amber-500 text-stone-950 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </div>
            <span className="font-bold tabular-nums text-[11px]">{addresses.length}</span>
          </button>
        </aside>

        {/* Tab Main Content */}
        <div className="md:col-span-9">
          {/* TAB 1: MY ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Order Detail View if an order is selected */}
              {selectedOrder ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>&larr; Back to all orders</span>
                    </button>

                    <button
                      onClick={() => setShowInvoiceModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold rounded-xl"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Invoice</span>
                    </button>
                  </div>

                  <OrderTimeline order={selectedOrder} />

                  {/* Summary of Items */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-400">
                      <span>Purchased Items ({selectedOrder.items.length})</span>
                      <span>Total: {formatPrice(selectedOrder.grandTotal)}</span>
                    </div>

                    <div className="divide-y divide-stone-100 dark:divide-stone-800">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded-xl bg-stone-100 dark:bg-stone-800"
                            />
                            <div>
                              <div className="font-bold text-stone-900 dark:text-white">
                                {item.productName}
                              </div>
                              <div className="text-[11px] text-stone-500">
                                Qty: {item.quantity} · Price: {formatPrice(item.unitPrice)}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold tabular-nums">
                            {formatPrice(item.subtotal)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Orders List */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-lg font-bold text-stone-900 dark:text-white">
                      Order History
                    </h2>
                    <span className="text-xs text-stone-500">{orders.length} orders found</span>
                  </div>

                  {loadingOrders ? (
                    <div className="p-8 text-center text-xs text-stone-500 animate-pulse">
                      Loading orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
                      <Package className="w-10 h-10 text-stone-400 mx-auto" />
                      <h3 className="font-bold text-sm">No Orders Yet</h3>
                      <p className="text-xs text-stone-500 max-w-xs mx-auto">
                        You have not placed any orders with us yet. Browse our store to discover great deals!
                      </p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs"
                      >
                        <span>Start Shopping</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs hover:border-stone-300 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-stone-900 dark:text-white text-sm">
                                #{o.id}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                  o.orderStatus === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : o.orderStatus === 'Shipped'
                                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                    : o.orderStatus === 'Cancelled'
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {o.orderStatus}
                              </span>
                            </div>

                            <div className="text-stone-500 text-[11px]">
                              Placed on {formatDate(o.createdAt)} · {o.items.length} Item(s)
                            </div>
                            <div className="text-stone-600 dark:text-stone-300">
                              Payment: <span className="font-semibold">{o.paymentMethod}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                            <div className="text-right">
                              <div className="text-stone-400 text-[11px]">Total</div>
                              <div className="font-bold text-base text-stone-950 dark:text-white tabular-nums font-heading">
                                {formatPrice(o.grandTotal)}
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedOrder(o)}
                              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-6">
              <div>
                <h2 className="font-heading text-lg font-bold text-stone-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Update your account contact details.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2 text-xs bg-stone-100 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Primary Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h2 className="font-heading text-lg font-bold text-stone-900 dark:text-white">
                    Delivery Addresses
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Save delivery locations for quick checkout.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-500">
                  No saved addresses. Click "Add New Address" above to save one.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-2 text-xs relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900 dark:text-white">
                          {addr.label} · {addr.recipientName}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold rounded-full">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                        {addr.streetAddress}, {addr.area}, {addr.city} {addr.postalCode}
                      </p>

                      <div className="text-[11px] text-stone-500">Phone: {addr.phone}</div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-stone-400 hover:text-rose-600 p-1"
                          aria-label="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal Preview */}
      {showInvoiceModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-3xl w-full my-8">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 no-print"
              aria-label="Close invoice preview"
            >
              &times;
            </button>
            <InvoiceView order={selectedOrder} settings={settings} />
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 max-w-md w-full border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
              <h3 className="font-heading font-bold text-base">Add New Delivery Address</h3>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="text-stone-400 hover:text-stone-900 dark:hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Label</label>
                  <select
                    value={newLabel}
                    onChange={(e: any) => setNewLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 border rounded-xl"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Street Address</label>
                <textarea
                  rows={2}
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Area</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={newPostal}
                    onChange={(e) => setNewPostal(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="defAddr"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                />
                <label htmlFor="defAddr" className="cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
