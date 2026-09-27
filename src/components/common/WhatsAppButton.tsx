import React from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreSettings } from '../../types';

interface WhatsAppButtonProps {
  settings: StoreSettings | null;
  productTitle?: string;
  orderId?: string;
  variant?: 'floating' | 'inline';
  label?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  settings,
  productTitle,
  orderId,
  variant = 'floating',
  label = 'Chat on WhatsApp',
}) => {
  const rawNumber = settings?.whatsapp || '+923007654321';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

  let defaultText = 'Hello Ali Online Store! I have a question about your products.';
  if (productTitle) {
    defaultText = `Hello! I would like to inquire about "${productTitle}". Is it in stock?`;
  } else if (orderId) {
    defaultText = `Hello, I need assistance with my Order #${orderId}.`;
  }

  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultText)}`;

  if (variant === 'inline') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
      >
        <MessageCircle className="w-4 h-4 fill-white" />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <aside aria-label="Quick contact" className="fixed bottom-6 left-6 z-40">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Direct WhatsApp customer support"
        className="flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
      >
        <MessageCircle className="w-5 h-5 fill-white shrink-0 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline-block text-xs font-semibold tracking-wide">
          WhatsApp Support
        </span>
      </a>
    </aside>
  );
};
