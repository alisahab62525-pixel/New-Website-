import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
      <h1 className="font-heading text-3xl font-extrabold text-stone-900 dark:text-white">
        Terms & Conditions
      </h1>
      <p className="text-stone-500">Effective Date: September 2026</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-stone-900 dark:text-white">1. Order Placement & Acceptance</h2>
        <p>
          By placing an order on Ali Online Store, you acknowledge and agree that your order constitutes an offer to purchase products at the stated price. Our administrators reserve the right to verify contact information via phone call or SMS prior to order dispatch.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-stone-900 dark:text-white">2. Pricing & Currency</h2>
        <p>
          All product prices are quoted in Pakistani Rupees (PKR / Rs.) inclusive of applicable local charges unless explicitly indicated. Shipping charges are calculated transparently during the checkout phase.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-stone-900 dark:text-white">3. Returns & Replacements</h2>
        <p>
          Customers may request a replacement within 7 calendar days of delivery in case of factory defects, transit damage, or incorrect dispatch, provided original packaging is preserved.
        </p>
      </section>
    </div>
  );
};
