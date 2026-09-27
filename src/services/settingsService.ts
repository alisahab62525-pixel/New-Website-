import { StoreSettings, User } from '../types';
import { dbStore } from './store';

export const settingsService = {
  async getSettings(): Promise<StoreSettings> {
    return { ...dbStore.getState().settings };
  },

  async updateSettings(newSettings: StoreSettings, requestingUser: User): Promise<StoreSettings> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }
    dbStore.setSettings(newSettings);
    return { ...newSettings };
  },
};
