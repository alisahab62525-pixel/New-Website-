import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Building,
  Check,
  CreditCard,
  Lock,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Truck,
  User as UserIcon,
  Wallet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { Address, Customer, PaymentMethod } from '../types';
import { formatPrice } from '../utils/formatters';

export const CheckoutPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { items, subtotal, appliedCoupon, discountAmount, deliveryFee, grandTotal, clearCart, settings } =
    useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Redirect if not authenticated (Requirement 11 & 16)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Customer addresses
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');

  // Address Form State
  const [recipientName, setRecipientName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [area, setArea] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [saveThisAddress, setSaveThisAddress] = useState(true);

  // Order Details
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash on Delivery');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role === 'customer') {
      authService.getAddresses(user.id).then((addresses) => {
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const def = addresses.find((a) => a.isDefault) || addresses[0];
          setSelectedAddressId(def.id);
          setRecipientName(def.recipientName);
          setPhone(def.phone);
          setStreetAddress(def.streetAddress);
          setCity(def.city);
          setArea(def.area);
          setPostalCode(def.postalCode);
          setAddressLabel(def.label);
        } else {
          setRecipientName(user.name);
          setPhone(user.phone);
        }
      });
    }
  }, [user]);

  const handleSelectSavedAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setRecipientName(addr.recipientName);
    setPhone(addr.phone);
    setStreetAddress(addr.streetAddress);
    setCity(addr.city);
    setArea(addr.area);
    setPostalCode(addr.postalCode);
    setAddressLabel(addr.label);
  };

  const handleSelectNewAddress = () => {
    setSelectedAddressId('new');
    setRecipientName(user?.name || '');
    setPhone(user?.phone || '');
    setStreetAddress('');
    setArea('');
    setPostalCode('');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      error('Your cart is empty.');
      navigate('/shop');
      return;
    }

    if (!recipientName.trim() || !phone.trim() || !streetAddress.trim() || !city.trim()) {
      setErrorMessage('Please provide complete recipient and street address details.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      // If new address selected and checked to save
      if (selectedAddressId === 'new' && saveThisAddress && user.role === 'customer') {
        try {
          await authService.addAddress(user.id, {
            recipientName: recipientName.trim(),
            phone: phone.trim(),
            streetAddress: streetAddress.trim(),
            city: city.trim(),
            area: area.trim() || city.trim(),
            postalCode: postalCode.trim() || '54000',
            label: addressLabel,
            isDefault: savedAddresses.length === 0,
          });
        } catch (addrErr) {
          console.warn('Could not save address to profile:', addrErr);
        }
      }

      // Create Order via OrderService
      const order = await orderService.createOrder(
        {
          customerId: user.id,
          deliveryAddress: {
            recipientName: recipientName.trim(),
            phone: phone.trim(),
            streetAddress: streetAddress.trim(),
            city: city.trim(),
            area: area.trim() || city.trim(),
            postalCode: postalCode.trim() || '54000',
            label: addressLabel,
          },
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            selectedSize: i.selectedSize,
            selectedColor: i.selectedColor,
          })),
          paymentMethod,
          couponCode: appliedCoupon?.code,
          customerNotes: customerNotes.trim(),
        },
        user
      );

      // Clear cart
      clearCart();

      success(`Order placed successfully! Order #${order.id}`);
      navigate(`/order-success/${order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please review your details.');
      error(err.message || 'Order failed');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-stone-500">
        Verifying customer authentication...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
          Secure Checkout
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Complete delivery details and select your preferred payment method.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Error placing order:</div>
            <div>{errorMessage}</div>
          </div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Profile Box */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400">
              <UserIcon className="w-4 h-4 text-amber-500" />
              <span>Customer Account</span>
            </div>
            <div className="text-sm font-bold text-stone-900 dark:text-white">{user.name}</div>
            <div className="text-xs text-stone-500 flex flex-wrap gap-4">
              <span>Email: {user.email}</span>
              <span>Phone: {user.phone}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Delivery Address</span>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectNewAddress}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Use New Address</span>
                </button>
              )}
            </div>

            {/* Saved Address Cards */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-stone-500 block">
                  Select from Saved Addresses:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-stone-900 dark:text-white">
                          {addr.recipientName} ({addr.label})
                        </span>
                        {selectedAddressId === addr.id && (
                          <Check className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="text-stone-600 dark:text-stone-400 line-clamp-2">
                        {addr.streetAddress}, {addr.area}, {addr.city}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-1">{addr.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Address Fields */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient's name"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Delivery Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Complete Street Address (House / Flat / Street / Block) *
                </label>
                <textarea
                  rows={2}
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. House #24, Street 9, Sector C, Bahria Town"
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  >
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                    <option value="Sialkot">Sialkot</option>
                    <option value="Gujranwala">Gujranwala</option>
                    <option value="Other City">Other City (Pakistan)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Area / Town
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Gulberg III / Clifton"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 54000"
                    className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {selectedAddressId === 'new' && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="saveAddr"
                    checked={saveThisAddress}
                    onChange={(e) => setSaveThisAddress(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="saveAddr" className="text-xs text-stone-600 dark:text-stone-400 cursor-pointer">
                    Save this address to my profile for future orders
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200 pb-3 border-b border-stone-100 dark:border-stone-800">
              <CreditCard className="w-4 h-4 text-amber-500" />
              <span>Payment Method</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { method: 'Cash on Delivery', desc: 'Pay cash upon delivery at your doorstep' },
                { method: 'Bank Transfer', desc: 'Meezan Bank Ltd account transfer' },
                { method: 'JazzCash', desc: 'JazzCash mobile account / wallet' },
                { method: 'Easypaisa', desc: 'Easypaisa mobile account / wallet' },
              ].map((pm) => (
                <div
                  key={pm.method}
                  onClick={() => setPaymentMethod(pm.method as PaymentMethod)}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all ${
                    paymentMethod === pm.method
                      ? 'border-amber-500 bg-amber-500/5 ring-1 ring-amber-500/30'
                      : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 dark:text-white">{pm.method}</span>
                    {paymentMethod === pm.method && <Check className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="text-[11px] text-stone-500 leading-normal">{pm.desc}</div>
                </div>
              ))}
            </div>

            {/* Configurable Payment Instructions Display */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 text-xs space-y-1.5">
              <div className="font-bold text-stone-900 dark:text-white">
                Payment Instructions: {paymentMethod}
              </div>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-[11px]">
                {paymentMethod === 'Cash on Delivery'
                  ? settings?.paymentInstructions.cod ||
                    'Please have the exact amount ready in cash when the delivery courier arrives.'
                  : paymentMethod === 'Bank Transfer'
                  ? settings?.paymentInstructions.bankTransfer ||
                    'Meezan Bank | Account: 0291-0103982901 | Title: Ali Online Store. Share receipt on WhatsApp.'
                  : paymentMethod === 'JazzCash'
                  ? settings?.paymentInstructions.jazzCash ||
                    'JazzCash Account: 0300-7654321 (Title: Ali Store). Send transaction ID in order notes.'
                  : settings?.paymentInstructions.easypaisa ||
                    'Easypaisa Account: 0312-9876543 (Title: Ali Store). Share screenshot via WhatsApp.'}
              </p>
            </div>

            {/* Order Notes */}
            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Special Delivery Notes (Optional)
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Ring doorbell twice, deliver between 3-5 PM..."
                className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Place Order Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200/80 dark:border-stone-800 space-y-5 sticky top-24">
            <h2 className="font-heading text-base font-bold text-stone-900 dark:text-white pb-3 border-b border-stone-100 dark:border-stone-800">
              Review Your Items ({items.length})
            </h2>

            {/* Item list */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-stone-100 dark:bg-stone-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-stone-900 dark:text-white truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Qty: {item.quantity} · {formatPrice(item.unitPrice)} each
                    </div>
                  </div>
                  <div className="font-bold tabular-nums text-stone-900 dark:text-white shrink-0">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code}):</span>
                  <span className="tabular-nums">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Nationwide Delivery:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
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

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isPlacingOrder}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isPlacingOrder ? 'Processing Order...' : 'Confirm & Place Order'}</span>
            </button>

            <div className="text-center text-[11px] text-stone-400">
              By clicking "Confirm & Place Order", you agree to our Terms & Return Policies.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
