import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <Layers className="w-4 h-4" />
          <span>Department Directory</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
          Explore All Categories
        </h1>
        <p className="text-xs text-stone-500 mt-1 max-w-xl">
          Browse our extensive departments from mobile gadgets and premium audio to luxury fragrances and executive apparel.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-16/9 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-16/10 w-full overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-90"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent flex flex-col justify-end p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {cat.productCount} Products
                </span>
                <h2 className="font-heading text-xl font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h2>
                <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-white">
                  <span>Browse Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
