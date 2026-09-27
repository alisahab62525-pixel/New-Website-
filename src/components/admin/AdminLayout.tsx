import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  ExternalLink,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { dbStore } from '../../services/store';
import { AdminNotification } from '../../types';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Load and listen to notifications
  useEffect(() => {
    if (isAdmin && user) {
      notificationService.getAdminNotifications(user).then(setNotifications);

      const unsubscribe = dbStore.subscribe(() => {
        notificationService.getAdminNotifications(user).then(setNotifications);
      });
      return unsubscribe;
    }
  }, [isAdmin, user]);

  // Route protection: If loaded and not admin, redirect!
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login', { replace: true, state: { from: location.pathname } });
    }
  }, [user, isLoading, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-white text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying admin permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user);
    const updated = await notificationService.getAdminNotifications(user);
    setNotifications(updated);
  };

  const navItems = [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Categories', to: '/admin/categories', icon: Layers },
    { label: 'Inventory', to: '/admin/inventory', icon: Warehouse },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Coupons', to: '/admin/coupons', icon: Tag },
    { label: 'Reviews', to: '/admin/reviews', icon: MessageSquare },
    {
      label: 'Notifications',
      to: '/admin/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { label: 'Store Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-stone-900 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-sm">Admin Console</span>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-stone-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 border-r border-stone-800 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Bar */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/10">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-heading font-bold text-sm tracking-tight text-white">
                Ali Online Store
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-500">
                Administration
              </div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-sm'
                      : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white tabular-nums">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Storefront & Sign Out */}
        <div className="p-3 border-t border-stone-800 space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Customer Store</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/admin/login');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/20 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-stone-900/60 backdrop-blur-md border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-stone-400">
              Logged in as <span className="text-stone-200">{user?.name}</span> ({user?.email})
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                aria-label="Admin notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl py-2 z-50 divide-y divide-stone-800">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Store Alerts ({unreadCount} new)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-stone-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-500">No notifications yet</div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 hover:bg-stone-800/40 transition-colors ${
                            !notif.isRead ? 'bg-amber-500/5' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                !notif.isRead ? 'bg-amber-400' : 'bg-stone-600'
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-stone-200">{notif.title}</div>
                              <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                                {notif.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2 text-center bg-stone-950/40">
                    <Link
                      to="/admin/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-amber-400 hover:underline font-medium"
                    >
                      View all notifications &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Link to Customer Store */}
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-xl transition-colors"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
