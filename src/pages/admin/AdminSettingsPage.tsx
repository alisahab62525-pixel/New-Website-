import React, { useEffect, useState } from 'react';
import { Building, CreditCard, DollarSign, KeyRound, Lock, Phone, Save, Settings, ShieldCheck, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { settingsService } from '../../services/settingsService';
import { dbStore } from '../../services/store';
import { StoreSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);

  // Admin security state
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    settingsService.getSettings().then(setSettings);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !user) return;

    setSaving(true);
    try {
      await settingsService.updateSettings(settings, user);
      success('Store settings saved and broadcast.');
    } catch (err: any) {
      error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword || newAdminPassword.length < 6) {
      error('Password must be at least 6 characters long.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      error('Passwords do not match. Please verify.');
      return;
    }

    setSavingPassword(true);
    try {
      dbStore.setAdminPassword(newAdminPassword);
      success('Admin password updated successfully! Keep this secret.');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all store data and settings to initial default seed state?')) {
      dbStore.resetToDefault();
      settingsService.getSettings().then(setSettings);
      success('Store database reset to initial demo seeds.');
    }
  };

  if (!settings) {
    return (
      <div className="p-12 text-center text-xs text-stone-500 animate-pulse">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-500" />
            <span>Store Configuration</span>
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Global delivery rates, contact channels, WhatsApp integration, and payment details.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold rounded-xl border border-rose-800/60 cursor-pointer"
        >
          Reset Demo Database
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Identity */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-stone-400 pb-2 border-b border-stone-800">
            <Building className="w-4 h-4 text-amber-500" />
            <span>Store Brand & Contact Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">Logo Text Brand</label>
              <input
                type="text"
                required
                value={settings.logoText}
                onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block text-stone-300 mb-1">Tagline & Description</label>
            <textarea
              rows={2}
              value={settings.description}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">Support Phone</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">
                WhatsApp Hotline (International format)
              </label>
              <input
                type="tel"
                value={settings.whatsapp}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                placeholder="+923007654321"
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">Physical Store Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">Business Hours</label>
              <input
                type="text"
                value={settings.businessHours}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery Rules */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-stone-400 pb-2 border-b border-stone-800">
            <Truck className="w-4 h-4 text-amber-500" />
            <span>Nationwide Delivery Logistics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">Standard Delivery Fee (PKR)</label>
              <input
                type="number"
                required
                value={settings.deliveryFee}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">
                Free Delivery Threshold (PKR)
              </label>
              <input
                type="number"
                required
                value={settings.freeDeliveryThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">Store Currency</label>
              <input
                type="text"
                disabled
                value={settings.currency}
                className="w-full px-3 py-2 bg-stone-800/50 border border-stone-700 rounded-xl text-stone-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-stone-400 pb-2 border-b border-stone-800">
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span>Configurable Payment Instructions</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="font-semibold block text-stone-300 mb-1">
                Cash on Delivery (COD) Instructions
              </label>
              <input
                type="text"
                value={settings.paymentInstructions.cod}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    paymentInstructions: { ...settings.paymentInstructions, cod: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="font-semibold block text-stone-300 mb-1">
                Bank Transfer Account & Title Details
              </label>
              <textarea
                rows={2}
                value={settings.paymentInstructions.bankTransfer}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    paymentInstructions: {
                      ...settings.paymentInstructions,
                      bankTransfer: e.target.value,
                    },
                  })
                }
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block text-stone-300 mb-1">JazzCash Details</label>
                <input
                  type="text"
                  value={settings.paymentInstructions.jazzCash}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentInstructions: {
                        ...settings.paymentInstructions,
                        jazzCash: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-semibold block text-stone-300 mb-1">Easypaisa Details</label>
                <input
                  type="text"
                  value={settings.paymentInstructions.easypaisa}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      paymentInstructions: {
                        ...settings.paymentInstructions,
                        easypaisa: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Owner Admin Security */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-stone-400 pb-2 border-b border-stone-800">
            <Lock className="w-4 h-4 text-amber-500" />
            <span>Store Owner Security & Admin Password</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-stone-950/60 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] text-stone-400">Registered Owner Email:</span>
                <div className="font-bold text-white text-sm">alisahab62525@gmail.com</div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold self-start sm:self-auto">
                Primary Store Administrator
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold block text-stone-300 mb-1">
                  New Admin Password
                </label>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block text-stone-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmAdminPassword}
                  onChange={(e) => setConfirmAdminPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleUpdatePassword}
                disabled={savingPassword || !newAdminPassword}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold rounded-xl border border-stone-700 transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{savingPassword ? 'Updating...' : 'Update Admin Password'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
