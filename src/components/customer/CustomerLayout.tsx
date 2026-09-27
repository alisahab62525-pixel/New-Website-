import React from 'react';
import { Outlet } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Footer } from '../common/Footer';
import { Navbar } from '../common/Navbar';
import { WhatsAppButton } from '../common/WhatsAppButton';

export const CustomerLayout: React.FC = () => {
  const { settings } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton settings={settings} />
    </div>
  );
};
