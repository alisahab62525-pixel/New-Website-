import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/customer/ProductCard';
import { productService } from '../services/productService';
import { Product } from '../types';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    productService.searchProducts(query).then((prods) => {
      setResults(prods);
      setLoading(false);
    });
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="pb-4 border-b border-stone-200 dark:border-stone-800">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white flex items-center gap-2.5">
          <Search className="w-6 h-6 text-amber-500" />
          <span>Search Results for "{query}"</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Found {results.length} matching products in catalog
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-3/4 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <SlidersHorizontal className="w-10 h-10 text-stone-400 mx-auto" />
          <h2 className="font-bold text-base">No Matching Results</h2>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            We couldn't find any products matching "{query}". Try checking for spelling errors or searching general terms like "earbuds", "polo", "charger", or "oud".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
