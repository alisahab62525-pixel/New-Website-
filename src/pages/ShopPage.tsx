import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ProductCard } from '../components/customer/ProductCard';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { dbStore } from '../services/store';
import { Category, Product } from '../types';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Active filters from query params or state
  const categorySlugParam = searchParams.get('category') || '';
  const queryParam = searchParams.get('q') || '';
  const dealsParam = searchParams.get('deals') === 'true';
  const sortParam = (searchParams.get('sort') as any) || 'featured';

  const [selectedCategory, setSelectedCategory] = useState<string>(categorySlugParam);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [hasDiscount, setHasDiscount] = useState<boolean>(dealsParam);
  const [sortBy, setSortBy] = useState<string>(sortParam);

  // Sync category param with state if url changes
  useEffect(() => {
    if (categorySlugParam) {
      setSelectedCategory(categorySlugParam);
    }
    if (dealsParam) {
      setHasDiscount(true);
    }
  }, [categorySlugParam, dealsParam]);

  useEffect(() => {
    categoryService.getCategories().then(setCategories);

    const loadProducts = () => {
      productService.getAllAdminProducts().then((all) => {
        setProducts(all.filter((p) => p.isActive));
        setLoading(false);
      });
    };

    loadProducts();
    const unsub = dbStore.subscribe(loadProducts);
    return unsub;
  }, []);

  // Compute available brands
  const brands = useMemo(() => {
    const list = products.map((p) => p.brand).filter(Boolean);
    return Array.from(new Set(list));
  }, [products]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    if (queryParam.trim()) {
      const q = queryParam.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) {
        result = result.filter((p) => p.categoryId === cat.id);
      }
    }

    // Brand
    if (selectedBrand) {
      result = result.filter((p) => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Price range
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      result = result.filter((p) => (p.discountPrice || p.price) >= min);
    }
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      result = result.filter((p) => (p.discountPrice || p.price) <= max);
    }

    // Stock availability
    if (onlyInStock) {
      result = result.filter((p) => p.stockQuantity > 0);
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((p) => p.rating >= minRating);
    }

    // Discount
    if (hasDiscount) {
      result = result.filter((p) => !!p.discountPrice && p.discountPrice < p.price);
    }

    // Sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price_asc':
        result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        result.sort((a, b) => b.reviewsCount - a.reviewsCount);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return result;
  }, [
    products,
    categories,
    queryParam,
    selectedCategory,
    selectedBrand,
    minPrice,
    maxPrice,
    onlyInStock,
    minRating,
    hasDiscount,
    sortBy,
  ]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setOnlyInStock(false);
    setMinRating(0);
    setHasDiscount(false);
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    Boolean(selectedBrand) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    onlyInStock ||
    minRating > 0 ||
    hasDiscount ||
    Boolean(queryParam);

  const filterSidebar = (
    <div className="space-y-6 text-xs">
      {/* Active Filters Clear */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
        <span className="font-bold uppercase tracking-wider text-stone-900 dark:text-white">
          Filter Catalog
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2.5">
        <span className="font-bold text-stone-900 dark:text-stone-100 block">Category</span>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors ${
              !selectedCategory
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
        <span className="font-bold text-stone-900 dark:text-stone-100 block">Price Range (PKR)</span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
          />
        </div>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
          <span className="font-bold text-stone-900 dark:text-stone-100 block">Brand</span>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedBrand('')}
              className={`w-full flex items-center justify-between py-1 px-2 rounded-lg text-left ${
                !selectedBrand
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span>All Brands</span>
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`w-full flex items-center justify-between py-1 px-2 rounded-lg text-left ${
                  selectedBrand === brand
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span className="truncate">{brand}</span>
                {selectedBrand === brand && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Availability & Offers */}
      <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
        <span className="font-bold text-stone-900 dark:text-stone-100 block">Availability & Deals</span>

        <label className="flex items-center gap-2 text-stone-700 dark:text-stone-300 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setOnlyInStock(e.target.checked)}
            className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
          />
          <span>In Stock Only</span>
        </label>

        <label className="flex items-center gap-2 text-stone-700 dark:text-stone-300 cursor-pointer">
          <input
            type="checkbox"
            checked={hasDiscount}
            onChange={(e) => setHasDiscount(e.target.checked)}
            className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
          />
          <span>Discounted Deals Only 🔥</span>
        </label>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2.5 pt-4 border-t border-stone-100 dark:border-stone-800">
        <span className="font-bold text-stone-900 dark:text-stone-100 block">Rating</span>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5].map((rating) => (
            <button
              key={rating}
              onClick={() => setMinRating(minRating === rating ? 0 : rating)}
              className={`w-full flex items-center justify-between py-1 px-2 rounded-lg text-left ${
                minRating === rating
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <span>{rating} Stars & above</span>
              {minRating === rating && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
            {queryParam
              ? `Search: "${queryParam}"`
              : selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Store Catalog'
              : hasDiscount
              ? 'Hot Deals & Discounts'
              : 'All Products'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-white text-xs font-semibold rounded-xl border border-stone-200 dark:border-stone-700"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 hidden sm:inline">Sort By:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid & Desktop Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-8">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800">
            {filterSidebar}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-3/4 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                No matching products found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We couldn't find any products matching your current filters or query. Try resetting filters to explore our full selection.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white dark:bg-stone-900 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
                <span className="font-heading font-bold text-base">Filters</span>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {filterSidebar}
            </div>

            <div className="pt-6 border-t border-stone-200 dark:border-stone-800 mt-6">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs"
              >
                View {filteredProducts.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
