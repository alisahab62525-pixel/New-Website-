import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Headphones,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { StoreSettings } from '../../types';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800 transition-colors">
      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 sm:p-8 rounded-2xl bg-stone-950/60 border border-stone-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Cash on Delivery</div>
              <div className="text-xs text-stone-400 mt-0.5">Pay safely at your doorstep across Pakistan</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">100% Genuine Quality</div>
              <div className="text-xs text-stone-400 mt-0.5">Curated authentic brands with warranty</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">7 Days Easy Return</div>
              <div className="text-xs text-stone-400 mt-0.5">Hassle-free replacement guarantee</div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Dedicated Support</div>
              <div className="text-xs text-stone-400 mt-0.5">Prompt WhatsApp & phone assistance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-white">
                Ali Online Store
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-stone-400 max-w-sm">
              {settings?.description ||
                "Pakistan's premier destination for tech gadgets, lifestyle accessories, men's apparel and authentic fragrances."}
            </p>

            <div className="space-y-2 pt-2 text-xs text-stone-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{settings?.address || 'Gulberg III, Lahore, Pakistan'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${settings?.phone}`} className="hover:text-white transition-colors">
                  {settings?.phone || '+92 300 7654321'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${settings?.email}`} className="hover:text-white transition-colors">
                  {settings?.email || 'support@alionlinestore.pk'}
                </a>
              </div>
            </div>
          </div>

          {/* Quick Shop */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">Shop Online</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  All Categories
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=newest" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=popular" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link to="/shop?deals=true" className="hover:text-rose-400 transition-colors">
                  Special Offers 🔥
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">Customer Care</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/account/orders" className="hover:text-white transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Delivery & FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">Company</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Customer Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Payments & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <span>&copy; {new Date().getFullYear()} Ali Online Store. All rights reserved.</span>
            {/* Discreet secret gateway for Store Owner Ali Sahab */}
            <Link
              to="/admin/login"
              title="Ali Online Store"
              className="text-stone-700/40 hover:text-stone-500 transition-colors select-none text-[10px]"
            >
              •
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400">Accepted Payments:</span>
            <span className="px-2 py-0.5 bg-stone-800 rounded text-[11px] text-stone-300 font-medium">
              Cash on Delivery (COD)
            </span>
            <span className="px-2 py-0.5 bg-stone-800 rounded text-[11px] text-stone-300 font-medium">
              Bank Transfer
            </span>
            <span className="px-2 py-0.5 bg-stone-800 rounded text-[11px] text-stone-300 font-medium">
              JazzCash
            </span>
            <span className="px-2 py-0.5 bg-stone-800 rounded text-[11px] text-stone-300 font-medium">
              Easypaisa
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
