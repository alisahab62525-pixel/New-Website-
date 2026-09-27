import { Customer, User } from '../types';
import { dbStore } from './store';

export const customerService = {
  async getAllCustomers(requestingUser: User): Promise<Customer[]> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin authorization required.');
    }
    await new Promise((r) => setTimeout(r, 100));
    return [...dbStore.getState().customers];
  },

  async getCustomerById(customerId: string, requestingUser: User): Promise<Customer> {
    if (requestingUser.role !== 'admin' && requestingUser.id !== customerId) {
      throw new Error('Access denied: You do not have permission to access this customer record.');
    }
    await new Promise((r) => setTimeout(r, 80));
    const customer = dbStore.getState().customers.find((c) => c.id === customerId);
    if (!customer) {
      throw new Error('Customer not found.');
    }
    return customer;
  },
};
