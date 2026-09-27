import React, { createContext, useContext, useEffect, useState } from 'react';
import { couponService } from '../services/couponService';
import { settingsService } from '../services/settingsService';
import { CartItem, Coupon, Product, StoreSettings } from '../types';
import { storage } from '../utils/storage';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string) => boolean;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  grandTotal: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  settings: StoreSettings | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => storage.getCart<CartItem[]>([]));
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const { success, warning, error, info } = useToast();

  useEffect(() => {
    storage.setCart(items);
  }, [items]);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.price;
    return acc + price * item.quantity;
  }, 0);

  // Recalculate coupon discount if subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      if (subtotal < appliedCoupon.minOrderAmount) {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        warning(`Coupon removed: minimum order amount is Rs. ${appliedCoupon.minOrderAmount.toLocaleString('en-PK')}`);
      } else {
        if (appliedCoupon.discountType === 'percentage') {
          let disc = Math.round((subtotal * appliedCoupon.discountValue) / 100);
          if (appliedCoupon.maxDiscountAmount && disc > appliedCoupon.maxDiscountAmount) {
            disc = appliedCoupon.maxDiscountAmount;
          }
          setCouponDiscount(disc);
        } else {
          setCouponDiscount(Math.min(subtotal, appliedCoupon.discountValue));
        }
      }
    }
  }, [subtotal, appliedCoupon, warning]);

  const deliveryFee =
    settings && subtotal >= settings.freeDeliveryThreshold ? 0 : settings ? settings.deliveryFee : 250;

  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const addToCart = (
    product: Product,
    quantity = 1,
    selectedSize?: string,
    selectedColor?: string
  ): boolean => {
    if (product.stockQuantity <= 0) {
      error(`"${product.name}" is currently out of stock.`);
      return false;
    }

    const itemId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`;

    let isAdded = false;
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === itemId);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = currentQty + quantity;
        if (newQty > product.stockQuantity) {
          warning(`Cannot add more. Maximum available stock is ${product.stockQuantity}.`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: newQty };
        isAdded = true;
        return updated;
      } else {
        if (quantity > product.stockQuantity) {
          warning(`Cannot add requested quantity. Maximum stock is ${product.stockQuantity}.`);
          return prev;
        }
        const unitPrice = product.discountPrice || product.price;
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          product,
          quantity,
          selectedSize,
          selectedColor,
          unitPrice,
        };
        isAdded = true;
        return [...prev, newItem];
      }
    });

    if (isAdded) {
      success(`Added "${product.name}" to cart.`);
    }
    return isAdded;
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          if (newQuantity > item.product.stockQuantity) {
            warning(`Only ${item.product.stockQuantity} units available.`);
            return { ...item, quantity: item.product.stockQuantity };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    try {
      const result = await couponService.validateCoupon(code, subtotal);
      if (result.isValid && result.coupon) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discountAmount);
        success(result.message);
        return { success: true, message: result.message };
      } else {
        error(result.message);
        return { success: false, message: result.message };
      }
    } catch {
      const msg = 'Error validating coupon.';
      error(msg);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    info('Coupon removed.');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        subtotal,
        discountAmount: couponDiscount,
        deliveryFee,
        grandTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        settings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
