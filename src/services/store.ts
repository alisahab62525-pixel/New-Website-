import {
  AdminNotification,
  Category,
  Coupon,
  Customer,
  Order,
  Product,
  Review,
  StoreSettings,
  User,
} from '../types';
import {
  INITIAL_ADMIN,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_CUSTOMERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
} from './mockDatabase';

interface StoreState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  customers: Customer[];
  adminUser: User;
  adminPassword: string;
  adminResetCode?: { code: string; expiresAt: number; email: string };
  coupons: Coupon[];
  reviews: Review[];
  notifications: AdminNotification[];
  settings: StoreSettings;
}

const STORAGE_KEY = 'ali_store_backend_db_v3';

function loadPersistedState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // ensure admin email & password default if missing
      if (!parsed.adminPassword) {
        parsed.adminPassword = 'Rana0008.';
      }
      if (!parsed.adminUser) {
        parsed.adminUser = INITIAL_ADMIN;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load store', e);
  }
  return {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    orders: INITIAL_ORDERS,
    customers: INITIAL_CUSTOMERS,
    adminUser: INITIAL_ADMIN,
    adminPassword: 'Rana0008.',
    coupons: INITIAL_COUPONS,
    reviews: INITIAL_REVIEWS,
    notifications: INITIAL_NOTIFICATIONS,
    settings: INITIAL_SETTINGS,
  };
}

class Store {
  private state: StoreState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = loadPersistedState();
  }

  private save(): void {
    try {
      const data = JSON.stringify(this.state);
      localStorage.setItem(STORAGE_KEY, data);
      sessionStorage.setItem(STORAGE_KEY, data);
    } catch (e) {
      console.error('Failed to save store', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener notification error', e);
      }
    });
  }

  public getState(): Readonly<StoreState> {
    return this.state;
  }

  public setProducts(fn: (prev: Product[]) => Product[]): void {
    this.state.products = fn(this.state.products);
    this.save();
  }

  public setCategories(fn: (prev: Category[]) => Category[]): void {
    this.state.categories = fn(this.state.categories);
    this.save();
  }

  public setOrders(fn: (prev: Order[]) => Order[]): void {
    this.state.orders = fn(this.state.orders);
    this.save();
  }

  public setCustomers(fn: (prev: Customer[]) => Customer[]): void {
    this.state.customers = fn(this.state.customers);
    this.save();
  }

  public setCoupons(fn: (prev: Coupon[]) => Coupon[]): void {
    this.state.coupons = fn(this.state.coupons);
    this.save();
  }

  public setReviews(fn: (prev: Review[]) => Review[]): void {
    this.state.reviews = fn(this.state.reviews);
    this.save();
  }

  public setNotifications(fn: (prev: AdminNotification[]) => AdminNotification[]): void {
    this.state.notifications = fn(this.state.notifications);
    this.save();
  }

  public setSettings(newSettings: StoreSettings): void {
    this.state.settings = newSettings;
    this.save();
  }

  public clearAllProducts(): void {
    this.state.products = [];
    this.state.categories = this.state.categories.map((c) => ({ ...c, productCount: 0 }));
    this.save();
  }

  public restoreDemoProducts(): void {
    this.state.products = [...INITIAL_PRODUCTS];
    this.state.categories = [...INITIAL_CATEGORIES];
    this.save();
  }

  public bulkAddProducts(newProducts: Product[]): void {
    this.state.products = [...newProducts, ...this.state.products];
    // update category counts
    this.state.categories = this.state.categories.map((c) => {
      const count = this.state.products.filter((p) => p.categoryId === c.id).length;
      return { ...c, productCount: count };
    });
    this.save();
  }

  public getAdminPassword(): string {
    return this.state.adminPassword || 'Rana0008.';
  }

  public setAdminPassword(password: string): void {
    this.state.adminPassword = password;
    this.save();
  }

  public createAdminPasswordResetCode(email: string): { success: boolean; code?: string; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const adminEmail = (this.state.adminUser?.email || 'alisahab62525@gmail.com').toLowerCase();

    if (cleanEmail !== adminEmail && cleanEmail !== 'alisahab62525@gmail.com') {
      return {
        success: false,
        message: 'This email is not registered as the store administrator.',
      };
    }

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

    this.state.adminResetCode = {
      code,
      email: cleanEmail,
      expiresAt,
    };

    // Register an internal notification as well
    const notif: AdminNotification = {
      id: `notif-pwd-reset-${Date.now()}`,
      type: 'system',
      title: 'Security Alert: Password Reset Requested',
      message: `Password reset verification code dispatched to ${cleanEmail}. Verification Code: ${code} (Expires in 15 minutes).`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.state.notifications = [notif, ...this.state.notifications];

    this.save();
    return {
      success: true,
      code,
      message: `Password reset verification code has been dispatched to ${cleanEmail}.`,
    };
  }

  public verifyAndResetAdminPassword(
    email: string,
    code: string,
    newPassword: string
  ): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!this.state.adminResetCode) {
      return {
        success: false,
        message: 'No active password reset request found. Please request a new code.',
      };
    }

    if (this.state.adminResetCode.email !== cleanEmail) {
      return {
        success: false,
        message: 'Email address does not match the active password reset request.',
      };
    }

    if (Date.now() > this.state.adminResetCode.expiresAt) {
      this.state.adminResetCode = undefined;
      this.save();
      return {
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      };
    }

    if (this.state.adminResetCode.code !== cleanCode) {
      return {
        success: false,
        message: 'Invalid verification code. Please check your email and try again.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters long.',
      };
    }

    this.state.adminPassword = newPassword;
    this.state.adminResetCode = undefined;

    // Add security notification
    this.state.notifications = [
      {
        id: `notif-pwd-success-${Date.now()}`,
        type: 'system',
        title: 'Admin Password Changed',
        message: `Admin account password was successfully updated via password reset at ${new Date().toLocaleTimeString()}.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...this.state.notifications,
    ];

    this.save();
    return {
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    };
  }

  public resetToDefault(): void {
    this.state = {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      customers: INITIAL_CUSTOMERS,
      adminUser: INITIAL_ADMIN,
      adminPassword: 'Rana0008.',
      coupons: INITIAL_COUPONS,
      reviews: INITIAL_REVIEWS,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS,
    };
    this.save();
  }
}

export const dbStore = new Store();
