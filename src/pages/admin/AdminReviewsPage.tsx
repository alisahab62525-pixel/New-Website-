import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, MessageSquare, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { reviewService } from '../../services/reviewService';
import { dbStore } from '../../services/store';
import { Review } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AdminReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = () => {
    if (!user) return;
    reviewService.getAllReviews(user).then((list) => {
      setReviews(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchReviews();
    const unsub = dbStore.subscribe(fetchReviews);
    return unsub;
  }, [user]);

  const handleToggleStatus = async (rev: Review) => {
    if (!user) return;
    const newStatus = rev.status === 'approved' ? 'hidden' : 'approved';
    try {
      await reviewService.updateReviewStatus(rev.id, newStatus, user);
      success(`Review marked as ${newStatus}.`);
    } catch (err: any) {
      error(err.message || 'Failed to update review status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (window.confirm('Permanently delete this customer review?')) {
      try {
        await reviewService.deleteReview(id, user);
        success('Review deleted.');
      } catch (err: any) {
        error(err.message || 'Failed to delete review');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Review Moderation</h1>
          <p className="text-xs text-stone-400 mt-1">
            Approve, conceal, or remove submitted buyer product reviews.
          </p>
        </div>

        <div className="text-xs text-stone-400">
          Total reviews: <span className="font-bold text-white">{reviews.length}</span>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-stone-600" />
            <div className="font-bold text-stone-300">No reviews submitted yet</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 font-bold uppercase tracking-wider bg-stone-950/40">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white max-w-xs truncate">
                      {r.productName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-stone-200 font-semibold">{r.customerName}</div>
                      {r.isVerifiedPurchase && (
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified Purchase</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              r.rating >= s
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-600'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm text-stone-300 line-clamp-2">
                      {r.comment}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px] whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'approved'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {r.status === 'approved' ? 'Visible' : 'Hidden'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(r)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                          title={r.status === 'approved' ? 'Hide review' : 'Approve review'}
                        >
                          {r.status === 'approved' ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-rose-400 cursor-pointer"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
