import { OrderStatus, User } from '../types';
import { dbStore } from './store';

export interface DashboardStats {
  totalOrders: number;
  ordersByStatus: Record<OrderStatus, number>;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: OrderStatus;
    date: string;
    itemsCount: number;
  }>;
}

export const adminService = {
  async getDashboardStats(requestingUser: User): Promise<DashboardStats> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }

    const state = dbStore.getState();

    const ordersByStatus: Record<OrderStatus, number> = {
      Pending: 0,
      Confirmed: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    let totalRevenue = 0;

    state.orders.forEach((o) => {
      if (ordersByStatus[o.orderStatus] !== undefined) {
        ordersByStatus[o.orderStatus]++;
      }
      if (o.orderStatus !== 'Cancelled') {
        totalRevenue += o.grandTotal;
      }
    });

    const lowStockCount = state.products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
    ).length;

    const outOfStockCount = state.products.filter((p) => p.stockQuantity <= 0).length;

    const recentOrders = state.orders.slice(0, 6).map((o) => ({
      id: o.id,
      customerName: o.customerName,
      total: o.grandTotal,
      status: o.orderStatus,
      date: o.createdAt,
      itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
    }));

    return {
      totalOrders: state.orders.length,
      ordersByStatus,
      totalCustomers: state.customers.length,
      totalProducts: state.products.length,
      lowStockCount,
      outOfStockCount,
      totalRevenue,
      recentOrders,
    };
  },
};
