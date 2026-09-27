import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Bell, CheckCheck, Clock, ExternalLink, Package, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notificationService';
import { dbStore } from '../../services/store';
import { AdminNotification } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AdminNotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    if (!user) return;
    notificationService.getAdminNotifications(user).then((list) => {
      setNotifications(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchNotifs();
    const unsub = dbStore.subscribe(fetchNotifs);
    return unsub;
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user);
    fetchNotifs();
    success('All notifications marked as read.');
  };

  const handleMarkOne = async (id: string) => {
    if (!user) return;
    await notificationService.markAsRead(id, user);
    fetchNotifs();
  };

  const handleClear = async () => {
    if (!user) return;
    if (window.confirm('Clear all notifications?')) {
      await notificationService.clearAll(user);
      fetchNotifs();
      success('Notifications cleared.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-amber-500" />
            <span>Real-Time Store Alerts</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Order placements, customer registrations, and inventory replenishment alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All as Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2 text-stone-500 hover:text-rose-400 rounded-xl hover:bg-stone-900 cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-stone-500 animate-pulse">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-stone-900 border border-stone-800 space-y-3">
            <Bell className="w-8 h-8 text-stone-600 mx-auto" />
            <h3 className="font-bold text-stone-300 text-sm">No Notifications</h3>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              You are all caught up! New orders and warehouse stock triggers will appear here in real time.
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleMarkOne(notif.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                !notif.isRead
                  ? 'bg-amber-500/5 border-amber-500/30'
                  : 'bg-stone-900 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'new_order'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : notif.type === 'low_stock'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-purple-500/10 text-purple-400'
                  }`}
                >
                  {notif.type === 'new_order' ? (
                    <ShoppingCart className="w-5 h-5" />
                  ) : notif.type === 'low_stock' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{notif.title}</span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    )}
                  </div>
                  <p className="text-stone-300 text-xs leading-relaxed">{notif.message}</p>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(notif.createdAt)}</span>
                  </div>
                </div>
              </div>

              {notif.orderId && (
                <Link
                  to={`/admin/orders/${notif.orderId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 rounded-xl text-xs font-semibold self-end sm:self-center transition-colors"
                >
                  <span>Open Order</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
