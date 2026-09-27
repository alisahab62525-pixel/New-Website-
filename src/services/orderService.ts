import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, User } from '../types';
import { formatPrice } from '../utils/formatters';
import { couponService } from './couponService';
import { dbStore } from './store';

export interface CreateOrderParams {
  customerId: string;
  deliveryAddress: {
    recipientName: string;
    phone: string;
    streetAddress: string;
    city: string;
    area: string;
    postalCode: string;
    label: string;
  };
  items: {
    productId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
  }[];
  paymentMethod: PaymentMethod;
  couponCode?: string;
  customerNotes?: string;
}

export const orderService = {
  async createOrder(params: CreateOrderParams, requestingUser: User): Promise<Order> {
    await new Promise((r) => setTimeout(r, 250));

    // 1. Verify customer auth
    if (!requestingUser || requestingUser.id !== params.customerId) {
      throw new Error('Authentication required. You can only place orders for your own account.');
    }

    const state = dbStore.getState();
    const customer = state.customers.find((c) => c.id === params.customerId);
    if (!customer) {
      throw new Error('Customer profile not found.');
    }

    // 2. Validate delivery address
    const addr = params.deliveryAddress;
    if (!addr.recipientName.trim() || !addr.phone.trim() || !addr.streetAddress.trim() || !addr.city.trim()) {
      throw new Error('Please fill in complete delivery address details.');
    }

    if (!params.items || params.items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    // 3. Validate stock & build items
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of params.items) {
      const prod = state.products.find((p) => p.id === item.productId);
      if (!prod || !prod.isActive) {
        throw new Error(`Product "${prod?.name || 'Selected item'}" is no longer available.`);
      }

      if (prod.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${prod.name}". Available: ${prod.stockQuantity}, Requested: ${item.quantity}.`
        );
      }

      const unitPrice = prod.discountPrice || prod.price;
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        productImage: prod.images[0] || '',
        sku: prod.sku,
        unitPrice,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        subtotal: itemSubtotal,
      });
    }

    // 4. Validate Coupon
    let discountAmount = 0;
    let validCouponCode: string | undefined = undefined;

    if (params.couponCode && params.couponCode.trim()) {
      try {
        const couponResult = await couponService.validateCoupon(params.couponCode, subtotal);
        if (couponResult.isValid && couponResult.coupon) {
          discountAmount = couponResult.discountAmount;
          validCouponCode = couponResult.coupon.code;
          // Record usage
          couponService.recordUsage(couponResult.coupon.code);
        }
      } catch (err) {
        console.warn('Coupon application warning:', err);
      }
    }

    // 5. Calculate delivery fee
    const settings = state.settings;
    const deliveryFee =
      subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;

    const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

    // 6. Generate unique sequential Order ID (ALI-10026, etc)
    const existingIds = state.orders.map((o) => {
      const match = o.id.match(/ALI-(\d+)/);
      return match ? parseInt(match[1], 10) : 10000;
    });
    const maxNum = existingIds.length > 0 ? Math.max(...existingIds) : 10025;
    const newOrderId = `ALI-${maxNum + 1}`;

    const nowIso = new Date().toISOString();
    const newOrder: Order = {
      id: newOrderId,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: params.deliveryAddress.phone || customer.phone,
      deliveryAddress: params.deliveryAddress,
      items: orderItems,
      subtotal,
      discountAmount,
      couponCode: validCouponCode,
      deliveryFee,
      grandTotal,
      paymentMethod: params.paymentMethod,
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      customerNotes: params.customerNotes?.trim() || undefined,
      timeline: [
        {
          status: 'Pending',
          timestamp: nowIso,
          note: `Order placed via ${params.paymentMethod}. Total: ${formatPrice(grandTotal)}`,
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    // 7. Reduce stock for each product
    dbStore.setProducts((prev) =>
      prev.map((p) => {
        const matchingItem = params.items.find((item) => item.productId === p.id);
        if (matchingItem) {
          const newStock = Math.max(0, p.stockQuantity - matchingItem.quantity);
          const stockStatus =
            newStock <= 0 ? 'out_of_stock' : newStock <= p.lowStockThreshold ? 'low_stock' : 'in_stock';
          return {
            ...p,
            stockQuantity: newStock,
            stockStatus,
            updatedAt: nowIso,
          };
        }
        return p;
      })
    );

    // 8. Save Order
    dbStore.setOrders((prev) => [newOrder, ...prev]);

    // 9. Update customer statistics
    dbStore.setCustomers((prev) =>
      prev.map((c) =>
        c.id === customer.id
          ? {
              ...c,
              orderCount: c.orderCount + 1,
              totalSpent: c.totalSpent + grandTotal,
            }
          : c
      )
    );

    // 10. Create Admin Notification immediately
    dbStore.setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'new_order',
        title: `🔔 New Order Received #${newOrder.id}`,
        message: `${customer.name} placed an order of ${formatPrice(grandTotal)} (${params.paymentMethod}).`,
        orderId: newOrder.id,
        isRead: false,
        createdAt: nowIso,
      },
      ...prev,
    ]);

    return newOrder;
  },

  async getOrdersByCustomer(customerId: string, requestingUser: User): Promise<Order[]> {
    await new Promise((r) => setTimeout(r, 100));
    // STRICT DATA PRIVACY: A customer can ONLY see their own orders!
    if (requestingUser.role !== 'admin' && requestingUser.id !== customerId) {
      throw new Error('Access denied: You do not have permission to view these orders.');
    }

    const orders = dbStore.getState().orders.filter((o) => o.customerId === customerId);
    return orders;
  },

  async getOrderById(orderId: string, requestingUser: User): Promise<Order> {
    await new Promise((r) => setTimeout(r, 100));
    const order = dbStore.getState().orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Order #${orderId} was not found.`);
    }

    // STRICT DATA PRIVACY:
    if (requestingUser.role !== 'admin' && requestingUser.id !== order.customerId) {
      throw new Error('Access denied: You are not authorized to view this customer order.');
    }

    return order;
  },

  async getAllAdminOrders(requestingUser: User): Promise<Order[]> {
    await new Promise((r) => setTimeout(r, 120));
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }
    return [...dbStore.getState().orders];
  },

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    options: {
      courier?: string;
      trackingNumber?: string;
      adminNotes?: string;
      paymentStatus?: PaymentStatus;
      timelineNote?: string;
    },
    requestingUser: User
  ): Promise<Order> {
    await new Promise((r) => setTimeout(r, 150));
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin authorization required.');
    }

    let updatedOrder: Order | null = null;
    const nowIso = new Date().toISOString();

    dbStore.setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const statusChanged = o.orderStatus !== status;
          const note =
            options.timelineNote ||
            (status === 'Confirmed'
              ? 'Order verified and confirmed by store administrator.'
              : status === 'Processing'
              ? 'Order is being packed and prepared for dispatch.'
              : status === 'Shipped'
              ? `Order dispatched via ${options.courier || 'Courier Service'}. Tracking #${options.trackingNumber || 'Available'}`
              : status === 'Delivered'
              ? 'Order successfully delivered to customer destination.'
              : status === 'Cancelled'
              ? 'Order was cancelled.'
              : `Status updated to ${status}.`);

          const newTimeline = statusChanged
            ? [...o.timeline, { status, timestamp: nowIso, note }]
            : o.timeline;

          updatedOrder = {
            ...o,
            orderStatus: status,
            courier: options.courier !== undefined ? options.courier : o.courier,
            trackingNumber:
              options.trackingNumber !== undefined ? options.trackingNumber : o.trackingNumber,
            adminNotes: options.adminNotes !== undefined ? options.adminNotes : o.adminNotes,
            paymentStatus:
              options.paymentStatus !== undefined
                ? options.paymentStatus
                : status === 'Delivered' && o.paymentMethod === 'Cash on Delivery'
                ? 'Paid'
                : o.paymentStatus,
            timeline: newTimeline,
            updatedAt: nowIso,
          };
          return updatedOrder;
        }
        return o;
      })
    );

    if (!updatedOrder) throw new Error('Order not found.');
    return updatedOrder;
  },
};
