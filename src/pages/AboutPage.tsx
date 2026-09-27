import React from 'react';
import { Award, CheckCircle2, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          About Ali Online Store
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
          Delivering Premium Quality to Every Doorstep
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Founded with a clear mission: bringing verified authentic electronics, ergonomic tech, luxury perfumes, and crafted menswear directly to consumers across Pakistan with transparent Cash on Delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-heading font-bold text-base">Authenticity Guaranteed</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            We partner exclusively with certified distributors. Every gadget and scent is 100% genuine with verifiable serial and batch numbers.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
          <h2 className="font-heading font-bold text-base">Safe Nationwide Delivery</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Partnered with premier couriers (TCS, Leopards, Call Courier) ensuring swift 2–4 business days delivery to over 250 cities.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="font-heading font-bold text-base">Customer First Focus</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            From easy 7-day returns to responsive WhatsApp support, we treat every customer order with paramount precision and care.
          </p>
        </div>
      </div>
    </div>
  );
};
