import React, { createContext, useContext, useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { Product } from '../types';
import { storage } from '../utils/storage';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCart: (product: Product) => void;
  clearWishlist: () => void;
  totalCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => storage.getWishlist([]));
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { success, info } = useToast();

  useEffect(() => {
    storage.setWishlist(wishlistIds);
  }, [wishlistIds]);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setWishlistProducts([]);
      return;
    }
    // Fetch products for wishlist
    Promise.all(wishlistIds.map((id) => productService.getProductById(id))).then((results) => {
      const valid = results.filter((p): p is Product => p !== null && p.isActive);
      setWishlistProducts(valid);
    });
  }, [wishlistIds]);

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  const toggleWishlist = (product: Product) => {
    if (isInWishlist(product.id)) {
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      info(`Removed "${product.name}" from wishlist.`);
    } else {
      setWishlistIds((prev) => [...prev, product.id]);
      success(`Saved "${product.name}" to wishlist.`);
    }
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
  };

  const moveToCart = (product: Product) => {
    const added = addToCart(product, 1);
    if (added) {
      removeFromWishlist(product.id);
    }
  };

  const clearWishlist = () => {
    setWishlistIds([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        moveToCart,
        clearWishlist,
        totalCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
