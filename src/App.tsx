import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/admin/AdminLayout';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';

// Customer Pages
import { AboutPage } from './pages/AboutPage';
import { AccountPage } from './pages/AccountPage';
import { CartPage } from './pages/CartPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchPage } from './pages/SearchPage';
import { ShopPage } from './pages/ShopPage';
import { TermsPage } from './pages/TermsPage';
import { WishlistPage } from './pages/WishlistPage';

// Admin Pages
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminProductFormPage } from './pages/admin/AdminProductFormPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <Routes>
                  {/* Dedicated Secure Admin Login (Outside Customer and Admin shells) */}
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Private Protected Admin Dashboard Area */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="products/new" element={<AdminProductFormPage />} />
                    <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="notifications" element={<AdminNotificationsPage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                  </Route>

                  {/* Public Customer Facing Website Area */}
                  <Route path="/" element={<CustomerLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="category/:slug" element={<CategoryDetailPage />} />
                    <Route path="product/:slug" element={<ProductDetailPage />} />
                    <Route path="search" element={<SearchPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="order-success/:id" element={<OrderSuccessPage />} />
                    <Route path="account" element={<AccountPage />} />
                    <Route path="account/orders" element={<AccountPage />} />
                    <Route path="account/orders/:id" element={<AccountPage />} />
                    <Route path="account/profile" element={<AccountPage />} />
                    <Route path="account/addresses" element={<AccountPage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="faq" element={<FAQPage />} />
                    <Route path="privacy" element={<PrivacyPolicyPage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
