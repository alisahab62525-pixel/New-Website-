import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart,
  HelpCircle,
  LogOut,
  Menu,
  Moon,
  Package,
  Phone,
  Search,
  ShoppingBag,
  Sun,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category, Product } from '../../types';
import { formatPrice } from '../../utils/formatters';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isCustomer, isAdmin, logout } = useAuth();
  const { totalCount: cartCount, subtotal, settings } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const { effectiveTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryService.getCategories().then(setCategories);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Handle outside clicks for search suggestions & user dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search suggestions
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      productService.searchProducts(searchQuery).then((results) => {
        setSearchSuggestions(results.slice(0, 5));
        setShowSuggestions(true);
      });
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      {/* Top Banner Bar */}
      <div className="bg-stone-950 text-stone-200 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs text-stone-300">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Free delivery nationwide on orders above Rs. {settings?.freeDeliveryThreshold.toLocaleString('en-PK') || '3,500'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <a
              href={`tel:${settings?.phone || '+923007654321'}`}
              className="hidden md:flex items-center gap-1 text-stone-400 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-stone-400" />
              <span>{settings?.phone || '+92 300 7654321'}</span>
            </a>
            <span className="hidden md:inline text-stone-700">|</span>
            <Link to="/faq" className="text-stone-400 hover:text-white transition-colors flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>Help & FAQ</span>
            </Link>
            {isAdmin && (
              <>
                <span className="text-stone-700">|</span>
                <Link
                  to="/admin"
                  className="font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>Admin Console</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-white leading-tight">
                Ali Online Store
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-amber-600 dark:text-amber-400">
                Premium Shopping
              </span>
            </div>
          </Link>

          {/* Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg relative mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search products, brands, models, or SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchSuggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Instant Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden z-50 divide-y divide-stone-100 dark:divide-stone-800">
                <div className="px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-50 dark:bg-stone-800/40">
                  Products ({searchSuggestions.length})
                </div>
                {searchSuggestions.map((item) => (
                  <Link
                    key={item.id}
                    to={`/product/${item.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-2.5 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400">
                        {item.categoryName} · {item.brand}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      {formatPrice(item.discountPrice || item.price)}
                    </div>
                  </Link>
                ))}
                <div className="p-2 bg-stone-50 dark:bg-stone-800/40 text-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    View all matching results &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Dark/Light mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle color theme"
            >
              {effectiveTheme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="View Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon & Subtotal */}
            <Link
              to="/cart"
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 text-stone-800 dark:text-stone-100 bg-stone-100 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700/80 rounded-xl transition-colors group"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-stone-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[10px] text-stone-500 dark:text-stone-400 leading-none">Cart</span>
                <span className="text-xs font-bold leading-tight tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
            </Link>

            {/* Customer Account Button */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-stone-900 dark:text-white"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block max-w-[100px] truncate">{user?.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-stone-900 rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 py-1 z-50 divide-y divide-stone-100 dark:divide-stone-800">
                      <div className="px-4 py-2.5">
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                          {user?.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">{user?.email}</div>
                      </div>

                      <div className="py-1">
                        {isCustomer && (
                          <>
                            <Link
                              to="/account"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                            >
                              <UserIcon className="w-4 h-4 text-stone-400" />
                              <span>My Profile</span>
                            </Link>
                            <Link
                              to="/account/orders"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                            >
                              <Package className="w-4 h-4 text-stone-400" />
                              <span>My Orders</span>
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-stone-50 dark:hover:bg-stone-800"
                          >
                            <Package className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden mt-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Categories Desktop Bar */}
      <nav className="hidden md:block bg-stone-50/80 dark:bg-stone-900/60 border-t border-stone-100 dark:border-stone-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-x-auto py-2 text-xs font-medium scrollbar-none">
          <Link
            to="/shop"
            className="text-stone-900 dark:text-white font-semibold hover:text-amber-600 transition-colors whitespace-nowrap"
          >
            All Products
          </Link>
          <Link
            to="/categories"
            className="text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Browse Categories
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/shop?deals=true"
            className="text-rose-600 dark:text-rose-400 font-semibold hover:underline transition-colors whitespace-nowrap ml-auto"
          >
            Hot Deals & Offers 🔥
          </Link>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-4 space-y-3">
          <div className="space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-sm font-medium text-stone-900 dark:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="block px-3 py-2 text-sm font-medium text-stone-900 dark:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Shop All
            </Link>
            <Link
              to="/categories"
              className="block px-3 py-2 text-sm font-medium text-stone-900 dark:text-white rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Categories
            </Link>
            <Link
              to="/shop?deals=true"
              className="block px-3 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Deals & Discounts 🔥
            </Link>
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <div className="text-xs font-semibold text-stone-400 px-3 py-1">CATEGORIES</div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="block px-3 py-2 text-xs text-stone-700 dark:text-stone-300 hover:text-amber-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  className="block px-3 py-2 text-sm text-stone-800 dark:text-stone-200"
                >
                  My Account ({user?.name})
                </Link>
                <Link
                  to="/account/orders"
                  className="block px-3 py-2 text-sm text-stone-800 dark:text-stone-200"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block w-full text-center py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
