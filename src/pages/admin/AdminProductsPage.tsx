import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  Copy,
  Edit2,
  Filter,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { productService } from '../../services/productService';
import { dbStore } from '../../services/store';
import { Product } from '../../types';
import { formatPrice } from '../../utils/formatters';

interface QuickProductInput {
  name: string;
  price: string;
  discountPrice: string;
  categoryName: string;
  stockQuantity: string;
  image: string;
  brand: string;
}

const DEFAULT_CATEGORIES = [
  'Smartphones & Accessories',
  'Audio & Wearables',
  "Men's Apparel & Fashion",
  'Home & Kitchen Essentials',
  'Luxury Fragrances',
  'Laptops & Computing',
  'Fashion & Lifestyle',
];

const PRESET_IMAGES = [
  { label: 'Smart Watch', url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80' },
  { label: 'Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80' },
  { label: 'Luxury Perfume', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Men Apparel', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
  { label: 'Leather Wallet/Bag', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80' },
  { label: 'Kitchen / Home', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80' },
];

export const AdminProductsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Quick Add / Bulk Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickRows, setQuickRows] = useState<QuickProductInput[]>([
    {
      name: '',
      price: '',
      discountPrice: '',
      categoryName: 'Smartphones & Accessories',
      stockQuantity: '15',
      image: PRESET_IMAGES[0].url,
      brand: 'Ali Store',
    },
  ]);
  const [savingBulk, setSavingBulk] = useState(false);

  const fetchProducts = () => {
    productService.getAllAdminProducts().then((all) => {
      setProducts(all);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProducts();
    const unsub = dbStore.subscribe(fetchProducts);
    return unsub;
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      try {
        await productService.deleteProduct(id);
        success(`Product "${name}" deleted.`);
      } catch (err: any) {
        error(err.message || 'Failed to delete product');
      }
    }
  };

  const handleClearAll = async () => {
    if (
      window.confirm(
        '⚠️ Are you sure you want to clear ALL temporary/demo products?\n\nThis will remove sample items and leave your store ready for your real inventory.'
      )
    ) {
      try {
        await productService.clearAllProducts();
        success('All demo products cleared! Catalog is now ready for your items.');
      } catch (err: any) {
        error(err.message || 'Failed to clear products');
      }
    }
  };

  const handleRestoreDemo = async () => {
    if (window.confirm('Restore initial sample products catalog?')) {
      try {
        await productService.restoreDemoProducts();
        success('Sample products catalog restored.');
      } catch (err: any) {
        error(err.message || 'Failed to restore products');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const dup = await productService.duplicateProduct(id);
      success(`Duplicated "${dup.name}".`);
    } catch (err: any) {
      error(err.message || 'Failed to duplicate product');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await productService.updateProduct(product.id, { isActive: !product.isActive });
      success(`Product "${product.name}" ${!product.isActive ? 'activated' : 'deactivated'}.`);
    } catch (err: any) {
      error(err.message || 'Failed to update status');
    }
  };

  // Quick Add Row management
  const addQuickRow = () => {
    setQuickRows([
      ...quickRows,
      {
        name: '',
        price: '',
        discountPrice: '',
        categoryName: 'Smartphones & Accessories',
        stockQuantity: '15',
        image: PRESET_IMAGES[quickRows.length % PRESET_IMAGES.length].url,
        brand: 'Ali Store',
      },
    ]);
  };

  const updateQuickRow = (index: number, field: keyof QuickProductInput, value: string) => {
    const updated = [...quickRows];
    updated[index][field] = value;
    setQuickRows(updated);
  };

  const removeQuickRow = (index: number) => {
    if (quickRows.length <= 1) return;
    setQuickRows(quickRows.filter((_, i) => i !== index));
  };

  const handleSaveBulk = async () => {
    const validRows = quickRows.filter((r) => r.name.trim() && Number(r.price) > 0);
    if (validRows.length === 0) {
      error('Please enter at least one product with name and valid price.');
      return;
    }

    setSavingBulk(true);
    try {
      const itemsToCreate = validRows.map((r) => ({
        name: r.name.trim(),
        price: Number(r.price),
        discountPrice: r.discountPrice ? Number(r.discountPrice) : undefined,
        categoryName: r.categoryName || 'General',
        stockQuantity: Number(r.stockQuantity) || 10,
        image: r.image.trim() || undefined,
        brand: r.brand.trim() || 'Ali Store',
      }));

      await productService.bulkCreateProducts(itemsToCreate);
      success(`Successfully added ${itemsToCreate.length} products to your store!`);
      setIsModalOpen(false);
      setQuickRows([
        {
          name: '',
          price: '',
          discountPrice: '',
          categoryName: 'Smartphones & Accessories',
          stockQuantity: '15',
          image: PRESET_IMAGES[0].url,
          brand: 'Ali Store',
        },
      ]);
    } catch (err: any) {
      error(err.message || 'Failed to save products');
    } finally {
      setSavingBulk(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.categoryName === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    return result;
  }, [products, selectedCategory, searchQuery]);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.categoryName)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2.5">
            <span>Product Catalog</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
              {products.length} Products
            </span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Manage your store's inventory, prices, images, and product descriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Mera Data / Quick Add</span>
          </button>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Product</span>
          </Link>
        </div>
      </div>

      {/* Catalog Manager Action Banner */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="font-semibold text-stone-200 flex items-center gap-2">
            <span>Store Inventory Controller</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400">
              Ali Sahab Store
            </span>
          </div>
          <p className="text-stone-400 text-[11px]">
            Temporary demo data hatana chahein to aik click se clear karein aur apne products add karein.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold cursor-pointer transition-colors flex items-center gap-1.5 text-[11px]"
            title="Remove all temporary products"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Temporary Demo Items</span>
          </button>

          <button
            onClick={handleRestoreDemo}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 font-medium cursor-pointer transition-colors flex items-center gap-1.5 text-[11px]"
            title="Restore sample product seeds"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-400" />
            <span>Restore Demo</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search by title, SKU, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Products Table or Clean State */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 animate-pulse">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center">
              <Package className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">No Products Found</h3>
              <p className="text-xs text-stone-400 max-w-sm mx-auto mt-1">
                {products.length === 0
                  ? 'Temporary demo items have been cleared. Store is ready for your products! Click below to add your items.'
                  : 'No products match your search or category filter.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                + Add My Products Now
              </button>
              {products.length === 0 && (
                <button
                  onClick={handleRestoreDemo}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl border border-stone-700 cursor-pointer"
                >
                  Restore Demo Items
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-stone-950/70 border-b border-stone-800 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price (PKR)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 text-center">Badges</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                          alt={p.name}
                          className="w-11 h-11 rounded-xl object-cover bg-stone-800 shrink-0 border border-stone-700"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="font-bold text-white hover:text-amber-400 transition-colors line-clamp-1 block text-xs"
                          >
                            {p.name}
                          </Link>
                          <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                            SKU: {p.sku} · {p.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">{p.categoryName}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {p.discountPrice ? (
                        <div>
                          <span className="text-amber-400 font-bold">{formatPrice(p.discountPrice)}</span>
                          <span className="text-[10px] text-stone-500 line-through ml-1.5">
                            {formatPrice(p.price)}
                          </span>
                        </div>
                      ) : (
                        <span>{formatPrice(p.price)}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            p.stockStatus === 'in_stock'
                              ? 'bg-emerald-500'
                              : p.stockStatus === 'low_stock'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span className="font-semibold">{p.stockQuantity}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px]">
                        {p.isFeatured && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">
                            Star
                          </span>
                        )}
                        {p.isBestSeller && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-semibold">
                            Top
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                          p.isActive
                            ? 'bg-emerald-950 text-emerald-400 hover:bg-emerald-900'
                            : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="p-1.5 text-stone-400 hover:text-amber-400 rounded-lg hover:bg-stone-800"
                          title="Duplicate Product"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg hover:bg-stone-800"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Add / Mera Data Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-800 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Mera Data / Quick Bulk Product Creator</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Enter your product names, prices in PKR, and images to add them instantly to your store.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="text-xs text-stone-400 flex items-center justify-between">
                <span>Add one or more products below:</span>
                <button
                  type="button"
                  onClick={addQuickRow}
                  className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-semibold rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Another Row</span>
                </button>
              </div>

              <div className="space-y-3">
                {quickRows.map((row, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        Product #{idx + 1}
                      </span>
                      {quickRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuickRow(idx)}
                          className="text-stone-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          title="Remove Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                      {/* Name */}
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={row.name}
                          onChange={(e) => updateQuickRow(idx, 'name', e.target.value)}
                          placeholder="e.g. Pure Cotton Kurta / Wireless Speaker"
                          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Price */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                          Price (PKR) *
                        </label>
                        <input
                          type="number"
                          required
                          value={row.price}
                          onChange={(e) => updateQuickRow(idx, 'price', e.target.value)}
                          placeholder="e.g. 3500"
                          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Discount Price */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                          Sale Price (Optional)
                        </label>
                        <input
                          type="number"
                          value={row.discountPrice}
                          onChange={(e) => updateQuickRow(idx, 'discountPrice', e.target.value)}
                          placeholder="e.g. 2999"
                          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Stock */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                          Stock Qty
                        </label>
                        <input
                          type="number"
                          value={row.stockQuantity}
                          onChange={(e) => updateQuickRow(idx, 'stockQuantity', e.target.value)}
                          placeholder="10"
                          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Category */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                          Category
                        </label>
                        <select
                          value={row.categoryName}
                          onChange={(e) => updateQuickRow(idx, 'categoryName', e.target.value)}
                          className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                        >
                          {DEFAULT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Image URL */}
                      <div className="sm:col-span-8">
                        <label className="block text-[11px] text-stone-400 mb-1 font-medium">
                          Image URL (or pick sample photo)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={row.image}
                            onChange={(e) => updateQuickRow(idx, 'image', e.target.value)}
                            placeholder="https://images.unsplash.com/..."
                            className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
                          />
                          <div className="flex gap-1">
                            {PRESET_IMAGES.slice(0, 3).map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => updateQuickRow(idx, 'image', preset.url)}
                                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-400 text-[10px] rounded-lg border border-stone-700 cursor-pointer"
                                title={preset.label}
                              >
                                {preset.label.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-stone-800 flex items-center justify-between">
              <button
                type="button"
                onClick={addQuickRow}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors cursor-pointer"
              >
                + Add Another Product
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingBulk}
                  onClick={handleSaveBulk}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{savingBulk ? 'Saving Products...' : 'Save All Products To Store'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
