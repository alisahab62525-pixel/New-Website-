import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Flame,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Truck,
  Zap,
} from 'lucide-react';
import { ProductCard } from '../components/customer/ProductCard';
import { useCart } from '../context/CartContext';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { Category, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { storage } from '../utils/storage';

export const HomePage: React.FC = () => {
  const { settings } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      categoryService.getCategories(),
      productService.getFeaturedProducts(8),
      productService.getBestSellers(8),
      productService.getNewArrivals(8),
      productService.getDeals(4),
    ]).then(([cats, feats, best, arrivals, dealList]) => {
      setCategories(cats);
      setFeaturedProducts(feats);
      setBestSellers(best);
      setNewArrivals(arrivals);
      setDeals(dealList);
      setLoading(false);
    });

    // Load recently viewed products
    const recentIds = storage.getRecentlyViewed([]);
    if (recentIds.length > 0) {
      Promise.all(recentIds.slice(0, 4).map((id) => productService.getProductById(id))).then(
        (prods) => {
          setRecentlyViewed(prods.filter((p): p is Product => p !== null && p.isActive));
        }
      );
    }
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-stone-900 text-white">
        <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Premier Online Shopping Destination in Pakistan</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Authentic Gadgets, Apparel & Lifestyle.
              </h1>

              <p className="text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Discover verified electronics, noise-cancelling audio, tailored menswear, and long-lasting luxury fragrances with instant Cash on Delivery nationwide.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                  <ShoppingBag className="w-4 h-4 fill-stone-950" />
                  <span>Shop Catalog Now</span>
                </Link>

                <Link
                  to="/shop?deals=true"
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-sm font-semibold rounded-xl border border-stone-700 transition-colors"
                >
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Explore Hot Deals</span>
                </Link>
              </div>

              {/* Highlights Metric */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-stone-800 text-xs">
                <div>
                  <div className="font-heading text-lg font-bold text-white tabular-nums">100%</div>
                  <div className="text-stone-400">Authentic Gear</div>
                </div>
                <div>
                  <div className="font-heading text-lg font-bold text-white tabular-nums">2-4 Days</div>
                  <div className="text-stone-400">Fast Nationwide Delivery</div>
                </div>
                <div>
                  <div className="font-heading text-lg font-bold text-white tabular-nums">Rs. 0</div>
                  <div className="text-stone-400">COD Free Over Rs. {settings?.freeDeliveryThreshold.toLocaleString('en-PK') || '3,500'}</div>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-800/80 aspect-4/3 group">
                <img
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80"
                  alt="AcousticPro Earbuds"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-xs uppercase font-bold tracking-wider text-amber-400">
                    Deal of the Week
                  </div>
                  <div className="text-lg font-bold text-white mt-1">
                    AcousticPro Hybrid 45dB ANC Earbuds
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-700/60">
                    <span className="text-amber-400 font-bold tabular-nums">
                      Rs. 4,999 <span className="text-xs text-stone-400 line-through">Rs. 6,499</span>
                    </span>
                    <Link
                      to="/product/acousticpro-anc-wireless-earbuds"
                      className="text-xs font-semibold text-white hover:text-amber-400 flex items-center gap-1"
                    >
                      <span>View Product</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Curated Collections
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 overflow-hidden hover:shadow-md transition-all text-center p-3"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-1">
                {cat.name}
              </h3>
              <span className="text-[11px] text-stone-400 mt-0.5">
                {cat.productCount} Items
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Handpicked Quality
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              Featured Products
            </h2>
          </div>
          <Link
            to="/shop?sort=featured"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse All Featured</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-3/4 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Discount Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-amber-500 text-stone-950 p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl space-y-4">
            <span className="inline-block px-3 py-1 bg-stone-950 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
              Limited Time Coupon
            </span>
            <h3 className="font-heading text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Use Coupon <span className="underline decoration-stone-950">WELCOME10</span> for 10% Off
            </h3>
            <p className="text-stone-900 text-xs sm:text-sm font-medium">
              Enjoy flat 10% off your entire cart on orders of Rs. 2,000 or more. Applies automatically at checkout!
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-5 py-3 bg-stone-950 hover:bg-stone-900 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                <span>Shop With Code</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop?sort=popular"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Best Sellers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Fresh Inventory
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              New Arrivals
            </h2>
          </div>
          <Link
            to="/shop?sort=newest"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore Newest</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold text-stone-900 dark:text-white">
              Recently Viewed by You
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {recentlyViewed.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Cash on Delivery Nationwide Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <Truck className="w-4 h-4" />
                <span>Nationwide Express Logistics</span>
              </div>
              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                Cash on Delivery in 250+ Cities Across Pakistan
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                Whether you are in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, or Quetta — inspect your package at your door and pay with confidence.
              </p>
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Open Parcel Allowed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-500" />
                  <span>Insured Transit</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-stone-950 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-4">
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">Estimated Delivery Time</h4>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Lahore & Vicinity:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">Same / Next Day</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-600 dark:text-stone-400">Karachi, Islamabad, Rawalpindi:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">2 - 3 Working Days</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-stone-600 dark:text-stone-400">Rest of Pakistan:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100">3 - 4 Working Days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
