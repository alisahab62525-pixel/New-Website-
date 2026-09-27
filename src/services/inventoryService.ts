import { Product, StockStatus, User } from '../types';
import { dbStore } from './store';

export const inventoryService = {
  async getInventory(requestingUser: User): Promise<Product[]> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }
    return [...dbStore.getState().products];
  },

  async updateStock(
    productId: string,
    quantity: number,
    lowStockThreshold?: number,
    requestingUser?: User
  ): Promise<Product> {
    if (requestingUser && requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }

    let updatedProd: Product | null = null;
    const nowIso = new Date().toISOString();

    dbStore.setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const threshold = lowStockThreshold !== undefined ? lowStockThreshold : p.lowStockThreshold;
          let stockStatus: StockStatus = 'in_stock';
          if (quantity <= 0) stockStatus = 'out_of_stock';
          else if (quantity <= threshold) stockStatus = 'low_stock';

          updatedProd = {
            ...p,
            stockQuantity: quantity,
            lowStockThreshold: threshold,
            stockStatus,
            updatedAt: nowIso,
          };
          return updatedProd;
        }
        return p;
      })
    );

    if (!updatedProd) throw new Error('Product not found.');

    // If stock became low, trigger notification
    const p = updatedProd as Product;
    if (p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock') {
      dbStore.setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'low_stock',
          title: p.stockStatus === 'out_of_stock' ? 'Out of Stock Alert' : 'Low Stock Warning',
          message: `${p.name} has ${p.stockQuantity} units left in stock.`,
          productId: p.id,
          isRead: false,
          createdAt: nowIso,
        },
        ...prev,
      ]);
    }

    return updatedProd;
  },

  async adjustStock(
    productId: string,
    delta: number,
    requestingUser?: User
  ): Promise<Product> {
    const prod = dbStore.getState().products.find((p) => p.id === productId);
    if (!prod) throw new Error('Product not found.');
    const newQuantity = Math.max(0, prod.stockQuantity + delta);
    return this.updateStock(productId, newQuantity, prod.lowStockThreshold, requestingUser);
  },
};
