import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';
import { StarRating } from '../common/StarRating';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, 1);

    if (!isAuthenticated) {
      // Require login before checkout!
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    } else {
      navigate('/checkout');
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative flex flex-col bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Product Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-stone-100 dark:bg-stone-800"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-rose-600 text-white text-[11px] font-bold rounded-md shadow-sm">
            -{product.discountPercentage || Math.round(((product.price - product.discountPrice!) / product.price) * 100)}% OFF
          </span>
        )}

        {/* Stock Status Pill if Low or Out */}
        {isOutOfStock ? (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-stone-900/80 backdrop-blur-sm text-stone-200 text-[10px] font-semibold rounded-md">
            Sold Out
          </span>
        ) : isLowStock ? (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-amber-500/90 text-stone-950 text-[10px] font-bold rounded-md">
            Only {product.stockQuantity} left
          </span>
        ) : null}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-sm transition-all duration-200 ${
            isSaved
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
              : 'bg-white/80 dark:bg-stone-900/80 text-stone-500 hover:text-rose-600 dark:text-stone-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </Link>

      {/* Details Container */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* Metadata Row: Category & Brand */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mb-1">
            <span className="truncate max-w-[120px]">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.categoryName}</span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mt-1.5">
            <StarRating rating={product.rating} reviewsCount={product.reviewsCount} size="sm" />
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base font-bold text-stone-950 dark:text-white tabular-nums">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isOutOfStock
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 border-transparent cursor-not-allowed'
                  : 'bg-stone-50 hover:bg-stone-100 dark:bg-stone-800/80 dark:hover:bg-stone-700/80 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold transition-all ${
                isOutOfStock
                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
