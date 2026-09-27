import { Coupon, User } from '../types';
import { dbStore } from './store';

export interface CouponValidationResult {
  isValid: boolean;
  message: string;
  discountAmount: number;
  coupon?: Coupon;
}

export const couponService = {
  async validateCoupon(code: string, orderSubtotal: number): Promise<CouponValidationResult> {
    const cleanCode = code.trim().toUpperCase();
    const coupon = dbStore.getState().coupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { isValid: false, message: 'Invalid coupon code.', discountAmount: 0 };
    }

    if (!coupon.isActive) {
      return { isValid: false, message: 'This coupon is no longer active.', discountAmount: 0 };
    }

    if (new Date(coupon.expiryDate).getTime() < Date.now()) {
      return { isValid: false, message: 'This coupon has expired.', discountAmount: 0 };
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return { isValid: false, message: 'This coupon usage limit has been reached.', discountAmount: 0 };
    }

    if (orderSubtotal < coupon.minOrderAmount) {
      return {
        isValid: false,
        message: `Minimum order amount for this coupon is Rs. ${coupon.minOrderAmount.toLocaleString('en-PK')}.`,
        discountAmount: 0,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((orderSubtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(orderSubtotal, coupon.discountValue);
    }

    return {
      isValid: true,
      message: `Coupon applied: Rs. ${discountAmount.toLocaleString('en-PK')} off!`,
      discountAmount,
      coupon,
    };
  },

  recordUsage(code: string): void {
    const cleanCode = code.trim().toUpperCase();
    dbStore.setCoupons((prev) =>
      prev.map((c) =>
        c.code.toUpperCase() === cleanCode ? { ...c, usageCount: c.usageCount + 1 } : c
      )
    );
  },

  async getAllCoupons(requestingUser: User): Promise<Coupon[]> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }
    return [...dbStore.getState().coupons];
  },

  async createCoupon(data: Omit<Coupon, 'id' | 'usageCount'>, requestingUser: User): Promise<Coupon> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }

    const id = `coup-${Date.now()}`;
    const newCoupon: Coupon = {
      ...data,
      id,
      code: data.code.trim().toUpperCase(),
      usageCount: 0,
    };

    dbStore.setCoupons((prev) => [newCoupon, ...prev]);
    return newCoupon;
  },

  async updateCoupon(id: string, updates: Partial<Coupon>, requestingUser: User): Promise<Coupon> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }

    let updated: Coupon | null = null;
    dbStore.setCoupons((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updated = {
            ...c,
            ...updates,
            code: updates.code ? updates.code.trim().toUpperCase() : c.code,
          };
          return updated;
        }
        return c;
      })
    );

    if (!updated) throw new Error('Coupon not found.');
    return updated;
  },

  async deleteCoupon(id: string, requestingUser: User): Promise<void> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }
    dbStore.setCoupons((prev) => prev.filter((c) => c.id !== id));
  },
};
