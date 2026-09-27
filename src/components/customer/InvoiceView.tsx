import React from 'react';
import { Printer, ShoppingBag } from 'lucide-react';
import { Order, StoreSettings } from '../../types';
import { formatDate, formatPrice } from '../../utils/formatters';

interface InvoiceViewProps {
  order: Order;
  settings: StoreSettings | null;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({ order, settings }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-stone-900 rounded-2xl p-6 sm:p-10 shadow-sm border border-stone-200">
      {/* Print Trigger Button */}
      <div className="flex justify-end mb-6 no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-stone-950">
              {settings?.storeName || 'Ali Online Store'}
            </h1>
          </div>
          <div className="text-xs text-stone-500 space-y-0.5 max-w-xs">
            <div>{settings?.address || 'Shop 14-B, Commercial Plaza, Lahore'}</div>
            <div>Phone: {settings?.phone || '+92 300 7654321'}</div>
            <div>Email: {settings?.email || 'support@alionlinestore.pk'}</div>
          </div>
        </div>

        <div className="text-left sm:text-right space-y-1">
          <div className="text-xl font-black uppercase tracking-wider text-stone-900 font-heading">
            TAX INVOICE
          </div>
          <div className="text-xs font-semibold text-stone-600">
            Invoice #: <span className="font-mono font-bold text-stone-900">{order.id}</span>
          </div>
          <div className="text-xs text-stone-500">Date: {formatDate(order.createdAt)}</div>
          <div className="text-xs font-semibold text-stone-700">
            Status:{' '}
            <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-900">
              {order.orderStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-stone-200 text-xs">
        <div>
          <div className="font-bold uppercase tracking-wider text-stone-400 mb-2">Billed & Shipped To</div>
          <div className="font-bold text-stone-900 text-sm">{order.deliveryAddress.recipientName}</div>
          <div className="text-stone-600 mt-1 leading-relaxed">
            {order.deliveryAddress.streetAddress}, {order.deliveryAddress.area}
            <br />
            {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
          </div>
          <div className="text-stone-600 mt-1">Phone: {order.deliveryAddress.phone}</div>
          <div className="text-stone-600">Email: {order.customerEmail}</div>
        </div>

        <div className="sm:text-right space-y-2">
          <div>
            <div className="font-bold uppercase tracking-wider text-stone-400">Payment Method</div>
            <div className="font-semibold text-stone-900 mt-0.5">{order.paymentMethod}</div>
            <div className="text-[11px] text-stone-500">Payment Status: {order.paymentStatus}</div>
          </div>

          {order.trackingNumber && (
            <div className="pt-2">
              <div className="font-bold uppercase tracking-wider text-stone-400">Courier / Tracking</div>
              <div className="text-stone-900 font-mono font-semibold">
                {order.courier || 'TCS'} - {order.trackingNumber}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="py-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-stone-200 text-stone-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-2">Item Description</th>
              <th className="py-3 px-2">SKU</th>
              <th className="py-3 px-2 text-right">Unit Price</th>
              <th className="py-3 px-2 text-center">Qty</th>
              <th className="py-3 px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="py-3 px-2">
                  <div className="font-semibold text-stone-900">{item.productName}</div>
                  {(item.selectedColor || item.selectedSize) && (
                    <div className="text-[11px] text-stone-500">
                      {[item.selectedColor, item.selectedSize].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </td>
                <td className="py-3 px-2 font-mono text-stone-500">{item.sku}</td>
                <td className="py-3 px-2 text-right tabular-nums">{formatPrice(item.unitPrice)}</td>
                <td className="py-3 px-2 text-center tabular-nums">{item.quantity}</td>
                <td className="py-3 px-2 text-right font-semibold tabular-nums">
                  {formatPrice(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="pt-4 border-t border-stone-200 flex justify-end">
        <div className="w-full max-w-xs space-y-2 text-xs">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal:</span>
            <span className="font-semibold tabular-nums">{formatPrice(order.subtotal)}</span>
          </div>

          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount ({order.couponCode || 'Coupon'}):</span>
              <span className="font-semibold tabular-nums">-{formatPrice(order.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-stone-600">
            <span>Delivery Charges:</span>
            <span className="font-semibold tabular-nums">
              {order.deliveryFee === 0 ? 'FREE' : formatPrice(order.deliveryFee)}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-stone-300 text-sm font-bold text-stone-950">
            <span>Grand Total:</span>
            <span className="tabular-nums text-base">{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-10 pt-6 border-t border-stone-200 text-center text-[11px] text-stone-400">
        <div>Thank you for shopping with Ali Online Store!</div>
        <div>For inquiries regarding this order, WhatsApp {settings?.whatsapp || '+92 300 7654321'} or email {settings?.email}.</div>
      </div>
    </div>
  );
};
