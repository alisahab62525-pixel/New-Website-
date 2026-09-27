import { Product, ProductFilterParams } from '../types';
import { slugify } from '../utils/formatters';
import { dbStore } from './store';

export const productService = {
  async getProducts(params?: ProductFilterParams): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 100));
    let products = [...dbStore.getState().products];

    // Only active products for customers unless specified
    products = products.filter((p) => p.isActive);

    if (params) {
      if (params.categorySlug) {
        const cat = dbStore.getState().categories.find((c) => c.slug === params.categorySlug);
        if (cat) {
          products = products.filter((p) => p.categoryId === cat.id);
        }
      }

      if (params.brand) {
        products = products.filter((p) => p.brand.toLowerCase() === params.brand?.toLowerCase());
      }

      if (params.minPrice !== undefined) {
        products = products.filter((p) => {
          const effectivePrice = p.discountPrice || p.price;
          return effectivePrice >= (params.minPrice || 0);
        });
      }

      if (params.maxPrice !== undefined) {
        products = products.filter((p) => {
          const effectivePrice = p.discountPrice || p.price;
          return effectivePrice <= (params.maxPrice || Infinity);
        });
      }

      if (params.stockStatus) {
        products = products.filter((p) => p.stockStatus === params.stockStatus);
      }

      if (params.rating) {
        products = products.filter((p) => p.rating >= (params.rating || 0));
      }

      if (params.hasDiscount) {
        products = products.filter((p) => !!p.discountPrice && p.discountPrice < p.price);
      }

      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)) ||
            p.shortDescription.toLowerCase().includes(q)
        );
      }

      if (params.sortBy) {
        switch (params.sortBy) {
          case 'newest':
            products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
          case 'price_asc':
            products.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
            break;
          case 'price_desc':
            products.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
            break;
          case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
          case 'popular':
            products.sort((a, b) => b.reviewsCount - a.reviewsCount);
            break;
          case 'featured':
          default:
            products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
            break;
        }
      }
    }

    return products;
  },

  async getAllAdminProducts(): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 100));
    return [...dbStore.getState().products];
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    await new Promise((r) => setTimeout(r, 100));
    const p = dbStore.getState().products.find((item) => item.slug === slug);
    return p || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const p = dbStore.getState().products.find((item) => item.id === id);
    return p || null;
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const products = dbStore.getState().products.filter((p) => p.isActive && p.isFeatured);
    return products.slice(0, limit);
  },

  async getBestSellers(limit = 8): Promise<Product[]> {
    const products = dbStore.getState().products.filter((p) => p.isActive && p.isBestSeller);
    return products.slice(0, limit);
  },

  async getNewArrivals(limit = 8): Promise<Product[]> {
    const products = dbStore.getState().products.filter((p) => p.isActive && p.isNewArrival);
    return products.slice(0, limit);
  },

  async getDeals(limit = 8): Promise<Product[]> {
    const products = dbStore.getState().products.filter(
      (p) => p.isActive && p.discountPrice && p.discountPrice < p.price
    );
    return products.slice(0, limit);
  },

  async getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    const products = dbStore
      .getState()
      .products.filter((p) => p.isActive && p.categoryId === categoryId && p.id !== productId);
    return products.slice(0, limit);
  },

  async searchProducts(query: string): Promise<Product[]> {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return dbStore
      .getState()
      .products.filter(
        (p) =>
          p.isActive &&
          (p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)))
      );
  },

  async createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'>
  ): Promise<Product> {
    await new Promise((r) => setTimeout(r, 200));

    const id = `prod-${Date.now()}`;
    const baseSlug = slugify(productData.name);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const stockStatus =
      productData.stockQuantity <= 0
        ? 'out_of_stock'
        : productData.stockQuantity <= (productData.lowStockThreshold || 5)
        ? 'low_stock'
        : 'in_stock';

    const discountPercentage =
      productData.discountPrice && productData.discountPrice < productData.price
        ? Math.round(((productData.price - productData.discountPrice) / productData.price) * 100)
        : undefined;

    const newProduct: Product = {
      ...productData,
      id,
      slug,
      stockStatus,
      discountPercentage,
      rating: productData.rating || 5,
      reviewsCount: productData.reviewsCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbStore.setProducts((prev) => [newProduct, ...prev]);

    // Update category product count
    dbStore.setCategories((prev) =>
      prev.map((c) => (c.id === newProduct.categoryId ? { ...c, productCount: c.productCount + 1 } : c))
    );

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await new Promise((r) => setTimeout(r, 200));

    let updatedProd: Product | null = null;

    dbStore.setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = updates.stockQuantity !== undefined ? updates.stockQuantity : p.stockQuantity;
          const threshold = updates.lowStockThreshold !== undefined ? updates.lowStockThreshold : p.lowStockThreshold;

          const stockStatus =
            newQty <= 0 ? 'out_of_stock' : newQty <= threshold ? 'low_stock' : 'in_stock';

          const price = updates.price !== undefined ? updates.price : p.price;
          const discountPrice =
            updates.discountPrice !== undefined ? updates.discountPrice : p.discountPrice;

          const discountPercentage =
            discountPrice && discountPrice < price
              ? Math.round(((price - discountPrice) / price) * 100)
              : undefined;

          updatedProd = {
            ...p,
            ...updates,
            stockQuantity: newQty,
            stockStatus,
            discountPercentage,
            updatedAt: new Date().toISOString(),
          };
          return updatedProd;
        }
        return p;
      })
    );

    if (!updatedProd) throw new Error('Product not found.');
    return updatedProd;
  },

  async deleteProduct(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
    const prod = dbStore.getState().products.find((p) => p.id === id);
    if (!prod) return;

    dbStore.setProducts((prev) => prev.filter((p) => p.id !== id));

    dbStore.setCategories((prev) =>
      prev.map((c) => (c.id === prod.categoryId ? { ...c, productCount: Math.max(0, c.productCount - 1) } : c))
    );
  },

  async duplicateProduct(id: string): Promise<Product> {
    const existing = dbStore.getState().products.find((p) => p.id === id);
    if (!existing) throw new Error('Product not found to duplicate');

    const newProd = await this.createProduct({
      ...existing,
      name: `${existing.name} (Copy)`,
      sku: `${existing.sku}-CP`,
    });
    return newProd;
  },

  async clearAllProducts(): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    dbStore.clearAllProducts();
  },

  async restoreDemoProducts(): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    dbStore.restoreDemoProducts();
  },

  async bulkCreateProducts(
    items: Array<{
      name: string;
      price: number;
      categoryName: string;
      stockQuantity: number;
      image?: string;
      brand?: string;
      description?: string;
      discountPrice?: number;
    }>
  ): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 200));
    const categories = dbStore.getState().categories;
    const now = new Date().toISOString();

    const created: Product[] = items.map((item, idx) => {
      let cat = categories.find(
        (c) => c.name.toLowerCase() === item.categoryName.toLowerCase()
      );
      if (!cat) {
        cat = categories[0] || {
          id: 'cat-general',
          name: 'General',
          slug: 'general',
          productCount: 0,
          isActive: true,
        };
      }

      const id = `prod-my-${Date.now()}-${idx}`;
      const slug = `${slugify(item.name)}-${Date.now()}-${idx}`;
      const sku = `ALI-${item.name.substring(0, 3).toUpperCase()}-${String(100 + idx)}`;
      const discountPercentage =
        item.discountPrice && item.discountPrice < item.price
          ? Math.round(((item.price - item.discountPrice) / item.price) * 100)
          : undefined;

      const p: Product = {
        id,
        sku,
        name: item.name,
        slug,
        description: item.description || `${item.name}. Premium quality item available at Ali Online Store.`,
        shortDescription: item.description?.substring(0, 80) || `${item.name} - authentic quality guaranteed.`,
        price: item.price,
        discountPrice: item.discountPrice,
        discountPercentage,
        images: [
          item.image?.trim() ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
        ],
        categoryId: cat.id,
        categoryName: cat.name,
        brand: item.brand || 'Ali Store',
        stockQuantity: item.stockQuantity || 10,
        stockStatus: item.stockQuantity <= 0 ? 'out_of_stock' : item.stockQuantity <= 5 ? 'low_stock' : 'in_stock',
        lowStockThreshold: 5,
        specifications: [{ key: 'Brand', value: item.brand || 'Ali Store' }, { key: 'Quality', value: '100% Genuine' }],
        tags: [item.name.toLowerCase(), 'ali-store', cat.name.toLowerCase()],
        rating: 5.0,
        reviewsCount: 1,
        isFeatured: true,
        isBestSeller: idx < 3,
        isNewArrival: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      return p;
    });

    dbStore.bulkAddProducts(created);
    return created;
  },
};
