import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center font-heading font-black text-2xl">
        404
      </div>
      <h1 className="font-heading text-2xl font-bold text-stone-900 dark:text-white">
        Page Not Found
      </h1>
      <p className="text-xs text-stone-500 leading-relaxed">
        The page or product category you are looking for has been moved or does not exist.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs shadow-sm hover:bg-amber-400 transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
