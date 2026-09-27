import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Printer,
  RotateCcw,
  Save,
  Truck,
  User as UserIcon,
} from 'lucide-react';
import { InvoiceView } from '../../components/customer/InvoiceView';
import { OrderTimeline } from '../../components/customer/OrderTimeline';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/orderService';
import { dbStore } from '../../services/store';
import { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatDate, formatPrice } from '../../utils/formatters';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { settings } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Status & Courier controls
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [courier, setCourier] = useState<string>('TCS Express');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [timelineNote, setTimelineNote] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const fetchOrder = () => {
    if (!id || !user) return;
    orderService
      .getOrderById(id, user)
      .then((o) => {
        setOrder(o);
        setStatus(o.orderStatus);
        setCourier(o.courier || 'TCS Express');
        setTrackingNumber(o.trackingNumber || '');
        setPaymentStatus(o.paymentStatus);
        setAdminNotes(o.adminNotes || '');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
    const unsub = dbStore.subscribe(fetchOrder);
    return unsub;
  }, [id, user]);

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user) return;

    setUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(
        order.id,
        status,
        {
          courier: courier.trim(),
          trackingNumber: trackingNumber.trim(),
          paymentStatus,
          adminNotes: adminNotes.trim(),
          timelineNote: timelineNote.trim() || undefined,
        },
        user
      );

      setOrder(updated);
      setTimelineNote('');
      success(`Order #${order.id} status updated to ${status}.`);
    } catch (err: any) {
      error(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-stone-500 animate-pulse">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order #{id} Not Found</h2>
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders List</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-white">Order #{order.id}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                  order.orderStatus === 'Delivered'
                    ? 'bg-emerald-950 text-emerald-300'
                    : order.orderStatus === 'Shipped'
                    ? 'bg-sky-950 text-sky-300'
                    : order.orderStatus === 'Cancelled'
                    ? 'bg-rose-950 text-rose-300'
                    : 'bg-amber-950 text-amber-300'
                }`}
              >
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Items & Customer Profile */}
        <div className="lg:col-span-8 space-y-6">
          {/* Live Order Timeline */}
          <OrderTimeline order={order} />

          {/* Items Table Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
            <h2 className="font-heading font-bold text-base text-white pb-3 border-b border-stone-800">
              Purchased Products ({order.items.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-2">Item</th>
                    <th className="py-2.5 px-2">SKU</th>
                    <th className="py-2.5 px-2 text-right">Unit Price</th>
                    <th className="py-2.5 px-2 text-center">Qty</th>
                    <th className="py-2.5 px-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-lg bg-stone-800"
                          />
                          <div>
                            <div className="font-semibold text-white">{item.productName}</div>
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="text-[11px] text-stone-400">
                                {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-stone-400">{item.sku}</td>
                      <td className="py-3 px-2 text-right tabular-nums text-stone-300">
                        {formatPrice(item.unitPrice)}
                      </td>
                      <td className="py-3 px-2 text-center tabular-nums font-bold text-white">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-white tabular-nums">
                        {formatPrice(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-stone-800 flex justify-end">
              <div className="w-full max-w-xs space-y-2 text-xs">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white tabular-nums">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Discount ({order.couponCode || 'Coupon'}):</span>
                    <span className="tabular-nums">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-400">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold text-white tabular-nums">
                    {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-800 text-sm font-bold text-white">
                  <span>Grand Total:</span>
                  <span className="text-amber-400 text-base tabular-nums font-heading font-extrabold">
                    {formatPrice(order.grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-stone-400 pb-2 border-b border-stone-800">
                <UserIcon className="w-4 h-4 text-amber-500" />
                <span>Customer Information</span>
              </div>
              <div className="space-y-1.5">
                <div className="font-bold text-white text-sm">{order.customerName}</div>
                <div className="text-stone-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span>{order.customerEmail}</span>
                </div>
                <div className="text-stone-400 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <a href={`tel:${order.customerPhone}`} className="hover:text-white underline">
                    {order.customerPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-stone-400 pb-2 border-b border-stone-800">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Delivery Address ({order.deliveryAddress.label})</span>
              </div>
              <div className="space-y-1 text-stone-300">
                <div className="font-bold text-white">{order.deliveryAddress.recipientName}</div>
                <div className="leading-relaxed">
                  {order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}
                </div>
                <div>
                  {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
                </div>
                <div className="text-stone-400 pt-1">Phone: {order.deliveryAddress.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Fulfillment Updater */}
        <div className="lg:col-span-4 space-y-6">
          <form
            onSubmit={handleUpdateOrder}
            className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5"
          >
            <h2 className="font-heading font-bold text-base text-white pb-3 border-b border-stone-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              <span>Fulfillment & Dispatch</span>
            </h2>

            {/* Order Status Select */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="Pending">Pending Verification</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing / Packing</option>
                <option value="Shipped">Shipped with Courier</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Courier Selection */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Courier Partner
              </label>
              <select
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white"
              >
                <option value="TCS Express">TCS Express</option>
                <option value="Leopards Courier">Leopards Courier</option>
                <option value="Trax Logistics">Trax Logistics</option>
                <option value="Call Courier">Call Courier</option>
                <option value="Store Direct Rider">Store Direct Rider</option>
                <option value="Other">Other Service</option>
              </select>
            </div>

            {/* Tracking Number */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Tracking / Consignment #
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. TCS-99824102"
                className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white font-mono placeholder-stone-500"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid / Collected</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {/* Custom Timeline Note */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Activity Note for Customer (Optional)
              </label>
              <input
                type="text"
                value={timelineNote}
                onChange={(e) => setTimelineNote(e.target.value)}
                placeholder="e.g. Order verified via phone call"
                className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500"
              />
            </div>

            {/* Admin Private Notes */}
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Admin Private Notes
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal verification notes..."
                className="w-full px-3 py-2 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{updating ? 'Saving Changes...' : 'Save & Broadcast Status'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Invoice Modal Preview */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-3xl w-full my-8">
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 no-print"
              aria-label="Close invoice preview"
            >
              &times;
            </button>
            <InvoiceView order={order} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
};
