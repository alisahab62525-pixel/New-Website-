import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
      <h1 className="font-heading text-3xl font-extrabold text-stone-900 dark:text-white">
        Privacy & Data Protection Policy
      </h1>
      <p className="text-stone-500">Effective Date: September 2026</p>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-stone-900 dark:text-white">1. Customer Privacy Commitment</h2>
        <p>
          At Ali Online Store, protecting your private data and order integrity is our top priority. We implement role-based access control, ensuring no customer can ever access another customer's orders, addresses, or profile records.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-stone-900 dark:text-white">2. Information We Collect</h2>
        <p>
          When you register or place an order, we collect delivery credentials including your name, shipping address, mobile phone number, and email. This information is utilized strictly for order verification, dispatch, and courier delivery updates.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-stone-900 dark:text-white">3. Payment Information</h2>
        <p>
          We do not store sensitive payment card details or private bank passwords on our servers. For Cash on Delivery, payment is handled upon physical delivery. For manual bank or mobile wallet transfers, verification is carried out via reference IDs.
        </p>
      </section>
    </div>
  );
};
