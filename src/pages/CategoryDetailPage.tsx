import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Layers } from 'lucide-react';
import { ProductCard } from '../components/customer/ProductCard';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { Category, Product } from '../types';

export const CategoryDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    categoryService.getCategoryBySlug(slug).then((cat) => {
      setCategory(cat);
      if (cat) {
        productService.getProducts({ categorySlug: cat.slug }).then((prods) => {
          setProducts(prods);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-stone-500">
        Loading category products...
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Category not found</h2>
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all categories</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Category Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-800">
        <div className="absolute inset-0 aspect-16/5">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="relative z-10 p-8 sm:p-12 max-w-2xl space-y-3">
          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </Link>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            {category.name}
          </h1>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {category.description}
          </p>

          <div className="pt-2 text-xs font-semibold text-amber-400">
            {products.length} Products available in this department
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <Layers className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-bold text-sm">No products in this category yet</h3>
          <p className="text-xs text-stone-500">Check back soon as we restock fresh inventory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
