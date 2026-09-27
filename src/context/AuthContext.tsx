import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { Customer, User } from '../types';

interface AuthContextType {
  user: User | null;
  role: 'customer' | 'admin' | 'guest';
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomer: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<Customer>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const current = await authService.getCurrentUser();
      setUser(current);
    } catch (e) {
      console.error('Failed to load current user', e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.login(email, pass);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<Customer> => {
    setIsLoading(true);
    try {
      const newCust = await authService.register(data);
      setUser(newCust);
      return newCust;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const role = user ? user.role : 'guest';
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isCustomer,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
