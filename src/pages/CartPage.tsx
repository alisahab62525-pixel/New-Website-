import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    deliveryFee,
    grandTotal,
    settings,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 3500;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    await applyCoupon(couponCode);
    setCouponLoading(false);
    setCouponCode('');
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // REQUIREMENT 11: Require login before checkout!
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-stone-900 dark:text-white">
          Your Shopping Cart is Empty
        </h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          You have not added any products to your cart yet. Discover hot deals and new arrivals in our store!
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Shopping Cart
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Review your selected items before proceeding to safe delivery checkout.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      {/* Free Delivery Goal Bar */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-stone-800 dark:text-stone-200">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            {remainingForFreeDelivery === 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                🎉 Congratulations! You have unlocked FREE Nationwide Delivery!
              </span>
            ) : (
              <span>
                Add{' '}
                <strong className="text-amber-700 dark:text-amber-400">
                  {formatPrice(remainingForFreeDelivery)}
                </strong>{' '}
                more for FREE Delivery!
              </span>
            )}
          </span>
          <span className="font-bold tabular-nums text-stone-600 dark:text-stone-400">
            {freeDeliveryPercent}%
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${freeDeliveryPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => {
            const price = item.product.discountPrice || item.product.price;
            const lineTotal = price * item.quantity;

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-stone-100 dark:bg-stone-800"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-400 line-clamp-1"
                    >
                      {item.product.name}
                    </Link>

                    <div className="text-[11px] text-stone-500 mt-0.5 space-x-2">
                      <span>Brand: {item.product.brand}</span>
                      {(item.selectedColor || item.selectedSize) && (
                        <span>
                          · {[item.selectedColor, item.selectedSize].filter(Boolean).join(' / ')}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                      {formatPrice(price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-center">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden text-xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 py-1 font-bold tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stockQuantity}
                      className="px-2.5 py-1 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-sm font-bold tabular-nums text-stone-900 dark:text-white min-w-[5rem] text-right">
                    {formatPrice(lineTotal)}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <Link
              to="/shop"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
            >
              <span>&larr; Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* Right Summary Box */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Entry */}
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Promo Code / Coupon</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    {appliedCoupon.code}
                  </span>
                  <div className="text-[11px] text-emerald-600">
                    Applied discount: -{formatPrice(discountAmount)}
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 text-emerald-700 hover:text-emerald-900"
                  aria-label="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl uppercase font-mono tracking-wider text-stone-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-bold rounded-xl transition-all disabled:opacity-40"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}

            <div className="text-[11px] text-stone-400">
              Try <span className="font-mono text-stone-600 dark:text-stone-300">WELCOME10</span> or <span className="font-mono text-stone-600 dark:text-stone-300">FLAT500</span>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 space-y-4">
            <h2 className="font-heading text-base font-bold text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
              Order Summary
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Items Subtotal:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount:</span>
                  <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Estimated Delivery Fee:</span>
                <span className="font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    formatPrice(deliveryFee)
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-between items-baseline text-sm font-bold text-stone-950 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-xl tabular-nums font-heading font-extrabold text-amber-600 dark:text-amber-400">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>

            {/* Guest Login Warning Note */}
            {!isAuthenticated && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Please sign in or create an account to proceed to checkout and secure your order.
                </span>
              </div>
            )}

            {/* Checkout Action Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all hover:scale-[1.01]"
            >
              <span>{isAuthenticated ? 'Proceed to Delivery & Checkout' : 'Sign In & Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-stone-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Safe Cash on Delivery Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
