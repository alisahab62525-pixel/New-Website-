import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/formatters';

export const WishlistPage: React.FC = () => {
  const { wishlistProducts, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlistProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-stone-900 dark:text-white">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Save your favorite gadgets, apparel, and fragrances here so you can purchase them anytime.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <span>Discover Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            Saved Wishlist ({wishlistProducts.length})
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Items you have saved for later purchase or consideration.
          </p>
        </div>

        <button
          onClick={clearWishlist}
          className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Wishlist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistProducts.map((p) => {
          const currentPrice = p.discountPrice || p.price;
          const isOutOfStock = p.stockQuantity <= 0;

          return (
            <div
              key={p.id}
              className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full bg-stone-100 dark:bg-stone-800">
                <Link to={`/product/${p.slug}`}>
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </Link>
                <button
                  onClick={() => removeFromWishlist(p.id)}
                  className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-stone-900/80 text-rose-500 hover:bg-white shadow-sm"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-stone-400">{p.brand}</div>
                  <Link
                    to={`/product/${p.slug}`}
                    className="text-xs font-bold text-stone-900 dark:text-stone-100 hover:text-amber-600 line-clamp-2 mt-0.5"
                  >
                    {p.name}
                  </Link>
                  <div className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-2 tabular-nums">
                    {formatPrice(currentPrice)}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => moveToCart(p)}
                    disabled={isOutOfStock}
                    className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      isOutOfStock
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                        : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'Out of Stock' : 'Move to Cart'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
