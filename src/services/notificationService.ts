import { AdminNotification, User } from '../types';
import { dbStore } from './store';

export const notificationService = {
  async getAdminNotifications(requestingUser: User): Promise<AdminNotification[]> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }
    return [...dbStore.getState().notifications];
  },

  async markAsRead(id: string, requestingUser: User): Promise<void> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied.');
    }
    dbStore.setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  },

  async markAllAsRead(requestingUser: User): Promise<void> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied.');
    }
    dbStore.setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  },

  async clearAll(requestingUser: User): Promise<void> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied.');
    }
    dbStore.setNotifications(() => []);
  },
};
