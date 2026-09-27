import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';

type AuthView = 'login' | 'forgot_request' | 'forgot_verify';

export const AdminLoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // View state
  const [view, setView] = useState<AuthView>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Forgot password state
  const [resetEmail, setResetEmail] = useState('alisahab62525@gmail.com');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Handle standard admin login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email, password);

      if (user.role !== 'admin') {
        setFormError('Access Denied: Store administrator account required.');
        error('Access Denied: Admin authorization required.');
        return;
      }

      success('Welcome back, Ali Sahab! Store Console loaded.');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setFormError(err.message || 'Invalid administrator credentials.');
      error(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Request Password Reset Code
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await authService.requestAdminPasswordReset(resetEmail);
      if (!res.success) {
        setFormError(res.message);
        error(res.message);
        return;
      }

      setDispatchedCode(res.code || null);
      success(`Verification code dispatched to ${resetEmail}`);
      setView('forgot_verify');
    } catch (err: any) {
      setFormError(err.message || 'Unable to process password reset request.');
      error(err.message || 'Reset failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify Code and Set New Password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match. Please verify both fields.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authService.resetAdminPassword(resetEmail, resetCode, newPassword);
      if (!res.success) {
        setFormError(res.message);
        error(res.message);
        return;
      }

      success('Password updated successfully! Please log in with your new password.');
      setResetSuccessMessage('Your admin password has been updated. You can now log in.');
      setEmail(resetEmail);
      setPassword('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setDispatchedCode(null);
      setView('login');
    } catch (err: any) {
      setFormError(err.message || 'Failed to update password.');
      error(err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6 text-stone-100 relative">
        {/* Header Icon */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-stone-950 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShoppingBag className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
              {view === 'login'
                ? 'Store Management Console'
                : view === 'forgot_request'
                ? 'Forgot Admin Password'
                : 'Set New Admin Password'}
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              {view === 'login'
                ? 'Ali Online Store · Authorized Owner Portal'
                : view === 'forgot_request'
                ? 'Enter your registered store email to receive a verification code'
                : `Enter the 6-digit code sent to ${resetEmail}`}
            </p>
          </div>
        </div>

        {/* Success message banner */}
        {resetSuccessMessage && view === 'login' && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{resetSuccessMessage}</span>
          </div>
        )}

        {/* Error message banner */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Simulated Email Dispatch Notification Banner */}
        {dispatchedCode && view === 'forgot_verify' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 to-stone-900 border border-amber-500/40 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Mail className="w-4 h-4" />
              <span>Email Dispatched to {resetEmail}</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              A 6-digit security verification code has been generated and sent to your email inbox:
            </p>
            <div className="p-2.5 bg-stone-950/90 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <span className="text-xs text-stone-400">Your Verification Code:</span>
              <span className="font-mono text-base font-extrabold tracking-widest text-amber-400">
                {dispatchedCode}
              </span>
            </div>
            <p className="text-[10px] text-stone-500">
              Code valid for 15 minutes. Use this code in the field below.
            </p>
          </div>
        )}

        {/* VIEW 1: Standard Login */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alisahab62525@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-stone-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setResetEmail(email || 'alisahab62525@gmail.com');
                    setView('forgot_request');
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors cursor-pointer hover:underline"
                >
                  Forgot Password? / پاس ورڈ بھول گئے؟
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret password"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Store Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* VIEW 2: Forgot Password - Request OTP */}
        {view === 'forgot_request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Enter Store Owner Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="alisahab62525@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                We will dispatch a secure 6-digit verification code to this email to reset your admin password.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Sending Code...' : 'Send Verification Code to Email'}</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setView('login');
                }}
                className="text-xs text-stone-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Admin Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: Forgot Password - Enter OTP & New Password */}
        {view === 'forgot_verify' && (
          <form onSubmit={handleVerifyAndReset} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                6-Digit Verification Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-mono tracking-widest bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
                <ShieldCheck className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer mt-2"
            >
              <span>{isSubmitting ? 'Verifying...' : 'Set New Password & Return to Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between text-xs text-stone-400 pt-2">
              <button
                type="button"
                onClick={() => handleRequestReset({ preventDefault: () => {} } as any)}
                className="text-amber-400 hover:underline"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormError(null);
                  setView('login');
                }}
                className="hover:text-white"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* Back to Customer Store */}
        <div className="text-center pt-2 border-t border-stone-800">
          <a
            href="/"
            className="text-xs text-stone-500 hover:text-stone-300 transition-colors inline-flex items-center gap-1"
          >
            <span>&larr; Return to Customer Storefront</span>
          </a>
        </div>
      </div>
    </div>
  );
};
