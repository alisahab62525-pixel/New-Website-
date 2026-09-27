import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: 'Do you offer Cash on Delivery (COD) across Pakistan?',
      a: 'Yes! We deliver to over 250 cities and towns across Pakistan via Cash on Delivery. You only pay when the rider hands over your package.',
    },
    {
      q: 'How long will it take to receive my order?',
      a: 'Orders in Lahore are typically delivered within 24 to 48 hours. Orders for Karachi, Islamabad, Rawalpindi, and other major cities arrive within 2 to 3 business days.',
    },
    {
      q: 'Can I inspect the parcel before paying the courier rider?',
      a: 'Yes. We support open parcel checking where available through our partner couriers. You can verify the product condition before finalizing payment.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We offer a 7-day hassle-free return and replacement policy if an item arrives damaged, defective, or different from described.',
    },
    {
      q: 'How do I track my order status?',
      a: 'Once logged in to your customer account, click "My Orders" to view live timeline tracking and courier tracking numbers.',
    },
    {
      q: 'How do I use a coupon code?',
      a: 'Enter your coupon code in the Promo Code field on either the Cart page or during checkout and click "Apply". Valid discounts are instantly subtracted from your total.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
          <HelpCircle className="w-6 h-6" />
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-stone-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-stone-500">
          Everything you need to know about placing orders, shipping, and returns.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-stone-900 dark:text-stone-100 transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/40"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-stone-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
