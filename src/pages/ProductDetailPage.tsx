import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  MessageCircle,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { StarRating } from '../components/common/StarRating';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { ProductCard } from '../components/customer/ProductCard';
import { useAuth } from '../../src/context/AuthContext';
import { useCart } from '../../src/context/CartContext';
import { useToast } from '../../src/context/ToastContext';
import { useWishlist } from '../../src/context/WishlistContext';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { Product, Review } from '../types';
import { formatDateShort, formatPrice } from '../utils/formatters';
import { storage } from '../utils/storage';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, settings } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Review submission form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    productService.getProductBySlug(slug).then((p) => {
      setProduct(p);
      if (p) {
        setSelectedImage(p.images[0] || '');
        if (p.colors && p.colors.length > 0) setSelectedColor(p.colors[0]);
        if (p.sizes && p.sizes.length > 0) setSelectedSize(p.sizes[0]);
        setQuantity(1);

        // Record in recently viewed
        storage.addRecentlyViewed(p.id);

        // Fetch related products & reviews
        productService.getRelatedProducts(p.id, p.categoryId, 4).then(setRelatedProducts);
        reviewService.getReviewsByProduct(p.id).then(setReviews);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-stone-500 animate-pulse">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-xs text-stone-500">The requested product could not be located in our catalog.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-stone-950 rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product.id);
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;
  const effectivePrice = product.discountPrice || product.price;
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedSize, selectedColor);

    // CRITICAL REQUIREMENT 11:
    // If guest clicks "Buy Now" -> redirect to /login?redirect=/checkout
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
    } else {
      navigate('/checkout');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!newComment.trim()) {
      error('Please write a comment for your review.');
      return;
    }

    setSubmittingReview(true);
    try {
      const added = await reviewService.addReview(
        {
          productId: product.id,
          rating: newRating,
          comment: newComment.trim(),
        },
        user
      );
      setReviews((prev) => [added, ...prev]);
      setNewComment('');
      success('Thank you! Your verified review has been submitted.');
    } catch (err: any) {
      error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-900 dark:hover:text-white">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-stone-900 dark:hover:text-white">
          Shop
        </Link>
        <span>/</span>
        <Link
          to={`/category/${product.categoryId}`}
          className="hover:text-stone-900 dark:hover:text-white"
        >
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-stone-900 dark:text-stone-200 font-semibold truncate max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 relative group">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm">
                -{product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img
                      ? 'border-amber-500 ring-2 ring-amber-500/20'
                      : 'border-stone-200 dark:border-stone-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
              <span className="font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {product.brand}
              </span>
              <span className="font-mono text-[11px]">SKU: {product.sku}</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews Overview */}
            <div className="flex items-center gap-4 mt-3">
              <StarRating rating={product.rating} reviewsCount={product.reviewsCount} size="md" />
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span className="text-xs text-stone-500">{reviews.length} Customer Reviews</span>
            </div>
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-stone-950 dark:text-white tabular-nums font-heading">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-stone-400 line-through tabular-nums">
                {formatPrice(product.price)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Save {formatPrice(product.price - (product.discountPrice || 0))}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                Select Color: <span className="font-normal text-stone-500">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedColor === c
                        ? 'bg-amber-500 text-stone-950 border-amber-500 font-bold shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                Select Size: <span className="font-normal text-stone-500">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                      selectedSize === s
                        ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-xs'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status Notification */}
          <div className="flex items-center gap-2 text-xs">
            {isOutOfStock ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                Currently Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Hurry! Only {product.stockQuantity} units left in stock.
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                In Stock & Ready for Dispatch ({product.stockQuantity} available)
              </span>
            )}
          </div>

          {/* Quantity and Action Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4">
              {/* Quantity Counter */}
              <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-bold tabular-nums min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity || isOutOfStock}
                  className="px-3.5 py-2.5 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Add to Wishlist */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-all ${
                  isSaved
                    ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:text-rose-600'
                }`}
                aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* Direct WhatsApp Product Question Button */}
              <WhatsAppButton
                settings={settings}
                productTitle={product.name}
                variant="inline"
                label="Ask on WhatsApp"
              />
            </div>

            {/* Main Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-xs font-bold border transition-all ${
                  isOutOfStock
                    ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                    : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white shadow-sm'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className={`flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-xs font-bold transition-all ${
                  isOutOfStock
                    ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 gap-4 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-amber-500" />
              <span>Cash on Delivery across Pakistan</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Authentic Brand Guarantee</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span>7 Days Return / Exchange Policy</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-amber-500" />
              <span>Safe & Secure Packaging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Technical Specifications */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 space-y-6">
        <h2 className="font-heading text-xl font-bold text-stone-900 dark:text-white">
          Product Description & Specifications
        </h2>

        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>

        {product.specifications && product.specifications.length > 0 && (
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {product.specifications.map((spec, i) => (
                <div
                  key={i}
                  className="flex justify-between p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60"
                >
                  <span className="text-stone-500 dark:text-stone-400">{spec.key}</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verified Customer Reviews */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="font-heading text-xl font-bold text-stone-900 dark:text-white">
              Customer Reviews ({reviews.length})
            </h2>
            <div className="flex items-center gap-3 mt-1.5">
              <StarRating rating={product.rating} size="md" />
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                {product.rating} out of 5.0
              </span>
            </div>
          </div>
        </div>

        {/* Add Review Box */}
        <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
            Write a Review
          </h3>

          {!isAuthenticated ? (
            <div className="text-xs text-stone-500">
              Please{' '}
              <Link
                to={`/login?redirect=${encodeURIComponent(window.location.pathname)}`}
                className="text-amber-600 dark:text-amber-400 font-semibold underline"
              >
                sign in to your customer account
              </Link>{' '}
              to share your verified feedback on this item.
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-stone-300 hover:text-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          newRating >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300 dark:text-stone-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Your Review Comments
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details regarding build quality, sound, delivery experience..."
                  className="w-full p-3 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl transition-all"
              >
                {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
              </button>
            </form>
          )}
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-4">
              No reviews yet. Be the first customer to review this product!
            </p>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-stone-100 dark:border-stone-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">{rev.customerName}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400">{formatDateShort(rev.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        rev.rating >= s
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300 dark:text-stone-700'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-heading text-xl font-bold text-stone-900 dark:text-white">
            Similar Products You Might Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
