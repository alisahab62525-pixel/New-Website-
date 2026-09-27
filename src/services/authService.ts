import { Address, Customer, User } from '../types';
import { storage } from '../utils/storage';
import { dbStore } from './store';

export const authService = {
  async login(email: string, password: string): Promise<User> {
    // Artificial latency for realism
    await new Promise((r) => setTimeout(r, 200));

    const state = dbStore.getState();
    const cleanEmail = email.trim().toLowerCase();

    // Check admin
    if (
      cleanEmail === state.adminUser.email.toLowerCase() ||
      cleanEmail === 'alisahab62525@gmail.com'
    ) {
      const currentAdminPassword = dbStore.getAdminPassword();
      if (password === currentAdminPassword) {
        const user = {
          ...state.adminUser,
          name: state.adminUser.name || 'Ali Sahab',
          email: cleanEmail,
        };
        storage.setSession({ userId: user.id, role: 'admin' });
        return user;
      }
      throw new Error('Invalid email or password.');
    }

    // Check customer
    const customer = state.customers.find(
      (c) => c.email.toLowerCase() === cleanEmail
    );
    if (!customer) {
      throw new Error('No account found with this email address.');
    }

    // Demo password check
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    storage.setSession({ userId: customer.id, role: 'customer' });
    return customer;
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<Customer> {
    await new Promise((r) => setTimeout(r, 250));

    const state = dbStore.getState();
    const cleanEmail = data.email.trim().toLowerCase();

    // Validate email uniqueness
    if (
      cleanEmail === state.adminUser.email.toLowerCase() ||
      state.customers.some((c) => c.email.toLowerCase() === cleanEmail)
    ) {
      throw new Error('An account with this email address already exists.');
    }

    if (!data.name.trim()) throw new Error('Full name is required.');
    if (!data.phone.trim()) throw new Error('Phone number is required.');
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const newCustomerId = `usr-cust-${Date.now()}`;
    const newCustomer: Customer = {
      id: newCustomerId,
      name: data.name.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
      addresses: [],
      orderCount: 0,
      totalSpent: 0,
    };

    dbStore.setCustomers((prev) => [newCustomer, ...prev]);

    // Send admin notification about new customer
    dbStore.setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'new_customer',
        title: 'New Customer Registered',
        message: `${newCustomer.name} (${newCustomer.email}) created an account.`,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    storage.setSession({ userId: newCustomer.id, role: 'customer' });
    return newCustomer;
  },

  async getCurrentUser(): Promise<User | null> {
    const session = storage.getSession();
    if (!session) return null;

    const state = dbStore.getState();
    if (session.role === 'admin') {
      return state.adminUser.id === session.userId ? state.adminUser : null;
    }

    const customer = state.customers.find((c) => c.id === session.userId);
    return customer || null;
  },

  async logout(): Promise<void> {
    storage.setSession(null);
  },

  async updateProfile(userId: string, data: { name: string; phone: string }): Promise<User> {
    await new Promise((r) => setTimeout(r, 150));
    const state = dbStore.getState();

    if (state.adminUser.id === userId) {
      const updated = { ...state.adminUser, ...data };
      return updated;
    }

    let updatedCust: Customer | null = null;
    dbStore.setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === userId) {
          updatedCust = { ...c, ...data };
          return updatedCust;
        }
        return c;
      })
    );

    if (!updatedCust) throw new Error('Customer not found.');
    return updatedCust;
  },

  async getAddresses(customerId: string): Promise<Address[]> {
    const state = dbStore.getState();
    const customer = state.customers.find((c) => c.id === customerId);
    return customer?.addresses || [];
  },

  async addAddress(customerId: string, addressData: Omit<Address, 'id' | 'customerId'>): Promise<Address> {
    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
      customerId,
    };

    dbStore.setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const isFirst = c.addresses.length === 0;
          const addresses = newAddress.isDefault || isFirst
            ? c.addresses.map((a) => ({ ...a, isDefault: false }))
            : c.addresses;
          return {
            ...c,
            addresses: [...addresses, { ...newAddress, isDefault: newAddress.isDefault || isFirst }],
            defaultAddressId: newAddress.isDefault || isFirst ? newAddress.id : c.defaultAddressId,
          };
        }
        return c;
      })
    );

    return newAddress;
  },

  async updateAddress(customerId: string, address: Address): Promise<Address> {
    dbStore.setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          let updatedAddresses = c.addresses.map((a) => (a.id === address.id ? address : a));
          if (address.isDefault) {
            updatedAddresses = updatedAddresses.map((a) => ({
              ...a,
              isDefault: a.id === address.id,
            }));
          }
          return {
            ...c,
            addresses: updatedAddresses,
            defaultAddressId: address.isDefault ? address.id : c.defaultAddressId,
          };
        }
        return c;
      })
    );
    return address;
  },

  async deleteAddress(customerId: string, addressId: string): Promise<void> {
    dbStore.setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const remaining = c.addresses.filter((a) => a.id !== addressId);
          return {
            ...c,
            addresses: remaining,
            defaultAddressId: c.defaultAddressId === addressId ? remaining[0]?.id : c.defaultAddressId,
          };
        }
        return c;
      })
    );
  },

  async requestAdminPasswordReset(email: string): Promise<{ success: boolean; code?: string; message: string }> {
    await new Promise((r) => setTimeout(r, 300));
    return dbStore.createAdminPasswordResetCode(email);
  },

  async resetAdminPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 300));
    return dbStore.verifyAndResetAdminPassword(email, code, newPassword);
  },
};
