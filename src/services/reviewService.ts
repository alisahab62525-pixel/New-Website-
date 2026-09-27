import { Review, User } from '../types';
import { dbStore } from './store';

export const reviewService = {
  async getReviewsByProduct(productId: string): Promise<Review[]> {
    return dbStore
      .getState()
      .reviews.filter((r) => r.productId === productId && r.status === 'approved');
  },

  async addReview(
    data: {
      productId: string;
      rating: number;
      comment: string;
    },
    requestingUser: User
  ): Promise<Review> {
    const state = dbStore.getState();
    const product = state.products.find((p) => p.id === data.productId);
    if (!product) throw new Error('Product not found.');

    // Check if customer purchased it
    const hasPurchased = state.orders.some(
      (o) =>
        o.customerId === requestingUser.id &&
        (o.orderStatus === 'Delivered' || o.orderStatus === 'Shipped') &&
        o.items.some((i) => i.productId === data.productId)
    );

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      productId: data.productId,
      productName: product.name,
      customerId: requestingUser.id,
      customerName: requestingUser.name,
      rating: data.rating,
      comment: data.comment.trim(),
      isVerifiedPurchase: hasPurchased,
      status: 'approved', // auto-approve in demo
      createdAt: new Date().toISOString(),
    };

    dbStore.setReviews((prev) => [newReview, ...prev]);

    // Recalculate product rating
    const currentReviews = dbStore
      .getState()
      .reviews.filter((r) => r.productId === data.productId && r.status === 'approved');
    const avgRating =
      currentReviews.reduce((acc, r) => acc + r.rating, 0) / (currentReviews.length || 1);

    dbStore.setProducts((prev) =>
      prev.map((p) =>
        p.id === data.productId
          ? {
              ...p,
              rating: Math.round(avgRating * 10) / 10,
              reviewsCount: currentReviews.length,
            }
          : p
      )
    );

    return newReview;
  },

  async getAllReviews(requestingUser: User): Promise<Review[]> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }
    return [...dbStore.getState().reviews];
  },

  async updateReviewStatus(
    reviewId: string,
    status: 'approved' | 'hidden',
    requestingUser: User
  ): Promise<Review> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }

    let updated: Review | null = null;
    dbStore.setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          updated = { ...r, status };
          return updated;
        }
        return r;
      })
    );

    if (!updated) throw new Error('Review not found.');
    return updated;
  },

  async deleteReview(reviewId: string, requestingUser: User): Promise<void> {
    if (requestingUser.role !== 'admin') {
      throw new Error('Access denied: Admin credentials required.');
    }
    dbStore.setReviews((prev) => prev.filter((r) => r.id !== reviewId));
  },
};
