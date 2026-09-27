import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { categoryService } from '../../services/categoryService';
import { productService } from '../../services/productService';
import { Category, ProductSpecification } from '../../types';

export const AdminProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<string>('');
  const [discountPrice, setDiscountPrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('20');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('5');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [imagesText, setImagesText] = useState('');
  const [colorsText, setColorsText] = useState('');
  const [sizesText, setSizesText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Specifications state
  const [specs, setSpecs] = useState<ProductSpecification[]>([
    { key: 'Warranty', value: '1 Year Brand Warranty' },
  ]);

  useEffect(() => {
    categoryService.getCategories().then((cats) => {
      setCategories(cats);
      if (!isEditing && cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    });

    if (isEditing && id) {
      productService.getProductById(id).then((p) => {
        if (p) {
          setName(p.name);
          setSku(p.sku);
          setBrand(p.brand);
          setCategoryId(p.categoryId);
          setPrice(p.price.toString());
          setDiscountPrice(p.discountPrice ? p.discountPrice.toString() : '');
          setStockQuantity(p.stockQuantity.toString());
          setLowStockThreshold(p.lowStockThreshold.toString());
          setShortDescription(p.shortDescription);
          setDescription(p.description);
          setImagesText(p.images.join('\n'));
          setColorsText(p.colors ? p.colors.join(', ') : '');
          setSizesText(p.sizes ? p.sizes.join(', ') : '');
          setTagsText(p.tags ? p.tags.join(', ') : '');
          setIsFeatured(p.isFeatured);
          setIsBestSeller(p.isBestSeller);
          setIsNewArrival(p.isNewArrival);
          setIsActive(p.isActive);
          setSpecs(p.specifications && p.specifications.length > 0 ? p.specifications : []);
        }
        setLoading(false);
      });
    }
  }, [id, isEditing]);

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = [...specs];
    updated[idx][field] = val;
    setSpecs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim() || !price || !categoryId) {
      error('Please fill in required fields (Name, SKU, Price, Category).');
      return;
    }

    const catObj = categories.find((c) => c.id === categoryId);
    const parsedPrice = parseFloat(price);
    const parsedDiscount = discountPrice ? parseFloat(discountPrice) : undefined;
    const parsedStock = parseInt(stockQuantity, 10) || 0;
    const parsedThreshold = parseInt(lowStockThreshold, 10) || 5;

    const images = imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80');
    }

    const colors = colorsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const sizes = sizesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const tags = tagsText
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const cleanSpecs = specs.filter((s) => s.key.trim() && s.value.trim());

    setSaving(true);
    try {
      if (isEditing && id) {
        await productService.updateProduct(id, {
          name: name.trim(),
          sku: sku.trim(),
          brand: brand.trim() || 'Ali Store Collection',
          categoryId,
          categoryName: catObj?.name || 'General',
          price: parsedPrice,
          discountPrice: parsedDiscount,
          stockQuantity: parsedStock,
          lowStockThreshold: parsedThreshold,
          shortDescription: shortDescription.trim(),
          description: description.trim(),
          images,
          colors: colors.length > 0 ? colors : undefined,
          sizes: sizes.length > 0 ? sizes : undefined,
          specifications: cleanSpecs,
          tags,
          isFeatured,
          isBestSeller,
          isNewArrival,
          isActive,
        });
        success(`Product "${name}" updated successfully.`);
      } else {
        await productService.createProduct({
          name: name.trim(),
          sku: sku.trim(),
          brand: brand.trim() || 'Ali Store Collection',
          categoryId,
          categoryName: catObj?.name || 'General',
          price: parsedPrice,
          discountPrice: parsedDiscount,
          stockQuantity: parsedStock,
          lowStockThreshold: parsedThreshold,
          shortDescription: shortDescription.trim(),
          description: description.trim(),
          images,
          colors: colors.length > 0 ? colors : undefined,
          sizes: sizes.length > 0 ? sizes : undefined,
          specifications: cleanSpecs,
          tags,
          rating: 5,
          reviewsCount: 0,
          isFeatured,
          isBestSeller,
          isNewArrival,
          isActive,
          stockStatus: parsedStock <= 0 ? 'out_of_stock' : parsedStock <= parsedThreshold ? 'low_stock' : 'in_stock',
        });
        success(`Product "${name}" added to catalog.`);
      }

      navigate('/admin/products');
    } catch (err: any) {
      error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-stone-500 animate-pulse">
        Loading product editor...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-white">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Basic Information */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-white pb-2 border-b border-stone-800">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AcousticPro ANC Wireless Earbuds"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">SKU (Inventory ID) *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. ALI-AUD-001"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">Brand Name *</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. AcousticSound"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">Department Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold block text-stone-300 mb-1">Short Summary (1-2 sentences)</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. 45dB Hybrid ANC, 38h battery life & IPX5 sweat resistance."
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="font-semibold block text-stone-300 mb-1">Full Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Comprehensive product details, build materials, features, and in-box items..."
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-white pb-2 border-b border-stone-800">
            Pricing & Inventory Controls
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">Regular Price (PKR) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="6499"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">Sale / Discount Price (PKR)</label>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                placeholder="4999 (Optional)"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">Low Stock Alert Threshold</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Images & Variants */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-white pb-2 border-b border-stone-800">
            Media & Variations
          </h2>

          <div>
            <label className="font-semibold block text-stone-300 mb-1">
              Image URLs (One URL per line)
            </label>
            <textarea
              rows={3}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="https://images.unsplash.com/photo-...\nhttps://..."
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono text-[11px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">
                Color Variants (comma-separated)
              </label>
              <input
                type="text"
                value={colorsText}
                onChange={(e) => setColorsText(e.target.value)}
                placeholder="Midnight Black, Pearl White, Nordic Blue"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">
                Size Variants (comma-separated)
              </label>
              <input
                type="text"
                value={sizesText}
                onChange={(e) => setSizesText(e.target.value)}
                placeholder="S, M, L, XL"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block text-stone-300 mb-1">
              Search Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="anc, earbuds, bluetooth, audio"
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
            />
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-800">
            <h2 className="font-heading font-bold text-base text-white">
              Specifications Table
            </h2>
            <button
              type="button"
              onClick={handleAddSpec}
              className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Specification</span>
            </button>
          </div>

          <div className="space-y-2">
            {specs.map((spec, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Key (e.g. Battery Life)"
                  value={spec.key}
                  onChange={(e) => handleSpecChange(i, 'key', e.target.value)}
                  className="w-1/3 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-white"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. 38 Hours)"
                  value={spec.value}
                  onChange={(e) => handleSpecChange(i, 'value', e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-xl text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(i)}
                  className="p-1.5 text-stone-500 hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Badges & Active Status */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3">
          <h2 className="font-heading font-bold text-base text-white pb-2 border-b border-stone-800">
            Visibility & Badges
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span>Featured on Home</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span>Best Seller</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span>New Arrival</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-stone-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-amber-500"
              />
              <span className="font-bold text-emerald-400">Active in Store</span>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold rounded-xl"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Product...' : isEditing ? 'Update Product' : 'Publish Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
