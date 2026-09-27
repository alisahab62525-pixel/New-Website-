export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  avatar?: string;
}

export interface Address {
  id: string;
  customerId: string;
  label: 'Home' | 'Work' | 'Other';
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  area: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Customer extends User {
  defaultAddressId?: string;
  addresses: Address[];
  orderCount: number;
  totalSpent: number;
}

export interface ProductSpecification {
  key: string;
  value: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  images: string[];
  categoryId: string;
  categoryName: string;
  brand: string;
  stockQuantity: number;
  stockStatus: StockStatus;
  lowStockThreshold: number;
  sizes?: string[];
  colors?: string[];
  specifications: ProductSpecification[];
  tags: string[];
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  isActive: boolean;
}

export interface CartItem {
  id: string; // composed: productId-size-color
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  unitPrice: number;
}

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  subtotal: number;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export type PaymentMethod = 'Cash on Delivery' | 'Bank Transfer' | 'Easypaisa' | 'JazzCash';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string; // ALI-10025
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    recipientName: string;
    phone: string;
    streetAddress: string;
    city: string;
    area: string;
    postalCode: string;
    label: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  deliveryFee: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  courier?: string;
  customerNotes?: string;
  adminNotes?: string;
  timeline: OrderTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  status: 'approved' | 'hidden';
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'low_stock' | 'new_customer' | 'review' | 'system';
  title: string;
  message: string;
  orderId?: string;
  productId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  logoText: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  businessHours: string;
  currency: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  paymentInstructions: {
    cod: string;
    bankTransfer: string;
    jazzCash: string;
    easypaisa: string;
  };
}

export interface ProductFilterParams {
  categorySlug?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  stockStatus?: string;
  rating?: number;
  hasDiscount?: boolean;
  search?: string;
  sortBy?: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}
