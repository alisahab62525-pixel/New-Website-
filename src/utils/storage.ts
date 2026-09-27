const CART_KEY = 'ali_store_cart';
const WISHLIST_KEY = 'ali_store_wishlist';
const RECENTLY_VIEWED_KEY = 'ali_store_recently_viewed';
const THEME_KEY = 'ali_store_theme';
const AUTH_SESSION_KEY = 'ali_store_session';

export const storage = {
  getCart: <T>(fallback: T): T => {
    try {
      const item = localStorage.getItem(CART_KEY);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  setCart: <T>(data: T): void => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving cart to localStorage', e);
    }
  },
  getWishlist: (fallback: string[] = []): string[] => {
    try {
      const item = localStorage.getItem(WISHLIST_KEY);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  setWishlist: (productIds: string[]): void => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(productIds));
    } catch (e) {
      console.error('Error saving wishlist to localStorage', e);
    }
  },
  getRecentlyViewed: (fallback: string[] = []): string[] => {
    try {
      const item = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  addRecentlyViewed: (productId: string): void => {
    try {
      const existing = storage.getRecentlyViewed([]);
      const filtered = existing.filter((id) => id !== productId);
      const updated = [productId, ...filtered].slice(0, 10);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving recently viewed', e);
    }
  },
  getTheme: (): 'light' | 'dark' | 'system' => {
    try {
      return (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system') || 'system';
    } catch {
      return 'system';
    }
  },
  setTheme: (theme: 'light' | 'dark' | 'system'): void => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.error('Error saving theme', e);
    }
  },
  getSession: (): { userId: string; role: 'customer' | 'admin' } | null => {
    try {
      const item = localStorage.getItem(AUTH_SESSION_KEY);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  setSession: (session: { userId: string; role: 'customer' | 'admin' } | null): void => {
    try {
      if (session) {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    } catch (e) {
      console.error('Error saving session', e);
    }
  },
};
