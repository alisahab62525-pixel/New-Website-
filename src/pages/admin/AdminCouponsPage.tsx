import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Tag, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { couponService } from '../../services/couponService';
import { dbStore } from '../../services/store';
import { Coupon } from '../../types';
import { formatDate, formatPrice } from '../../utils/formatters';

export const AdminCouponsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('10');
  const [minOrderAmount, setMinOrderAmount] = useState<string>('2000');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>('1000');
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<string>('500');
  const [isActive, setIsActive] = useState(true);

  const fetchCoupons = () => {
    if (!user) return;
    couponService.getAllCoupons(user).then(setCoupons);
  };

  useEffect(() => {
    fetchCoupons();
    const unsub = dbStore.subscribe(fetchCoupons);
    return unsub;
  }, [user]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('10');
    setMinOrderAmount('2000');
    setMaxDiscountAmount('1000');
    setExpiryDate('2026-12-31');
    setUsageLimit('500');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingId(c.id);
    setCode(c.code);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue.toString());
    setMinOrderAmount(c.minOrderAmount.toString());
    setMaxDiscountAmount(c.maxDiscountAmount ? c.maxDiscountAmount.toString() : '');
    setExpiryDate(c.expiryDate.split('T')[0]);
    setUsageLimit(c.usageLimit.toString());
    setIsActive(c.isActive);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, cCode: string) => {
    if (!user) return;
    if (window.confirm(`Delete coupon "${cCode}"?`)) {
      try {
        await couponService.deleteCoupon(id, user);
        success(`Coupon "${cCode}" deleted.`);
      } catch (err: any) {
        error(err.message || 'Failed to delete coupon');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim()) return;

    const val = parseFloat(discountValue) || 0;
    const minOrd = parseFloat(minOrderAmount) || 0;
    const maxDisc = maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined;
    const limit = parseInt(usageLimit, 10) || 100;
    const expiryIso = new Date(`${expiryDate}T23:59:59Z`).toISOString();

    try {
      if (editingId) {
        await couponService.updateCoupon(
          editingId,
          {
            code: code.trim(),
            discountType,
            discountValue: val,
            minOrderAmount: minOrd,
            maxDiscountAmount: maxDisc,
            expiryDate: expiryIso,
            usageLimit: limit,
            isActive,
          },
          user
        );
        success(`Coupon "${code}" updated.`);
      } else {
        await couponService.createCoupon(
          {
            code: code.trim(),
            discountType,
            discountValue: val,
            minOrderAmount: minOrd,
            maxDiscountAmount: maxDisc,
            expiryDate: expiryIso,
            usageLimit: limit,
            isActive,
          },
          user
        );
        success(`Coupon "${code}" created.`);
      }
      setModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Promo Codes & Coupons</h1>
          <p className="text-xs text-stone-400 mt-1">
            Configure percentage or flat discounts, usage caps, and minimum order rules.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider bg-stone-950/40">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Min. Order</th>
                <th className="py-3 px-4">Max. Discount</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% OFF`
                      : formatPrice(c.discountValue) + ' FLAT'}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums text-stone-300">
                    {formatPrice(c.minOrderAmount)}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums text-stone-300">
                    {c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'No Cap'}
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">
                    <span className="font-bold text-white tabular-nums">{c.usageCount}</span> /{' '}
                    {c.usageLimit}
                  </td>
                  <td className="py-3.5 px-4 text-stone-400">{formatDate(c.expiryDate)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.isActive ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="font-heading font-bold text-base text-white pb-2 border-b border-stone-800">
              {editingId ? 'Edit Promo Coupon' : 'Create New Promo Coupon'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="font-semibold block text-stone-300 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FLASH20"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-stone-300 mb-1">Type</label>
                  <select
                    value={discountType}
                    onChange={(e: any) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (PKR)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block text-stone-300 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-stone-300 mb-1">Min. Order (PKR)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-stone-300 mb-1">Max. Discount Cap</label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="Optional (e.g. 2000)"
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block text-stone-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold block text-stone-300 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <label htmlFor="couponActive" className="text-stone-300 cursor-pointer">
                  Coupon is Active
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 rounded-xl text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
