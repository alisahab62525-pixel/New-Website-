import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Printer,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { InvoiceView } from '../components/customer/InvoiceView';
import { OrderTimeline } from '../components/customer/OrderTimeline';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { formatPrice } from '../utils/formatters';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { settings } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    orderService
      .getOrderById(id, user)
      .then((o) => {
        setOrder(o);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching order', err);
        setLoading(false);
      });
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-stone-500 animate-pulse">
        Loading order confirmation...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-xs text-stone-500">We could not retrieve order #{id}.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold"
        >
          <span>Return to Store Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Hero Header */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200/80 dark:border-stone-800 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Order Successfully Placed!
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
            Thank You, {order.customerName}!
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
            Your order has been recorded in our system. A confirmation notification has been sent to our fulfillment dispatch team.
          </p>
        </div>

        {/* Order Identifier Banner */}
        <div className="inline-flex items-center gap-3 p-3.5 bg-stone-100 dark:bg-stone-800 rounded-2xl">
          <span className="text-xs text-stone-500">Your Order Number:</span>
          <span className="font-mono text-base font-bold text-stone-950 dark:text-white">
            #{order.id}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Tax Invoice</span>
          </button>

          <Link
            to="/account/orders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Track in My Orders</span>
          </Link>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Live Order Timeline */}
      <OrderTimeline order={order} />

      {/* Order Details & Summary Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 space-y-6">
        <h2 className="font-heading text-lg font-bold text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
          Order Summary & Delivery Destination
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="font-bold uppercase tracking-wider text-stone-400 mb-1">
              Delivery Address
            </div>
            <div className="font-bold text-stone-900 dark:text-white text-sm">
              {order.deliveryAddress.recipientName}
            </div>
            <div className="text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
              {order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}
              <br />
              {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
            </div>
            <div className="text-stone-600 dark:text-stone-400 mt-1">
              Phone: {order.deliveryAddress.phone}
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <div className="font-bold uppercase tracking-wider text-stone-400 mb-1">
                Payment Method
              </div>
              <div className="font-bold text-stone-900 dark:text-white">
                {order.paymentMethod}
              </div>
              <div className="text-stone-500 text-[11px]">Payment Status: {order.paymentStatus}</div>
            </div>

            {order.customerNotes && (
              <div>
                <div className="font-bold uppercase tracking-wider text-stone-400 mb-1">
                  Customer Notes
                </div>
                <div className="text-stone-600 dark:text-stone-400 italic">
                  "{order.customerNotes}"
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items List */}
        <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
          <div className="font-bold uppercase tracking-wider text-stone-400 text-xs">
            Purchased Items ({order.items.length})
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-xl bg-stone-100 dark:bg-stone-800 shrink-0"
                  />
                  <div>
                    <div className="font-bold text-stone-900 dark:text-white">{item.productName}</div>
                    <div className="text-[11px] text-stone-500">
                      Qty: {item.quantity} · SKU: {item.sku}
                    </div>
                  </div>
                </div>

                <div className="font-bold tabular-nums text-stone-900 dark:text-white">
                  {formatPrice(item.subtotal)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Subtotal:</span>
                <span className="font-semibold tabular-nums">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount:</span>
                  <span className="tabular-nums">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Delivery:</span>
                <span className="font-semibold tabular-nums">
                  {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 dark:border-stone-800 text-sm font-bold text-stone-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="tabular-nums font-heading text-base text-amber-600 dark:text-amber-400">
                  {formatPrice(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>
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
