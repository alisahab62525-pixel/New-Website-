import React, { useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { settings } = useCart();
  const { success } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Thank you! Your message has been dispatched to our support team.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          We Are Here To Assist You
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white">
          Contact Customer Care
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
          Have an inquiry about an active order, product specifications, or wholesale bulk requests?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 text-xs">
            <h2 className="font-heading font-bold text-base text-stone-900 dark:text-white">
              Official Store Details
            </h2>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Store Address</div>
                <div className="text-stone-500 leading-relaxed">
                  {settings?.address || 'Shop 14-B, Commercial Plaza, Gulberg III, Lahore'}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Phone Support</div>
                <div className="text-stone-500">{settings?.phone || '+92 300 7654321'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Email Inquiries</div>
                <div className="text-stone-500">{settings?.email || 'support@alionlinestore.pk'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-stone-800 dark:text-stone-200">Instant WhatsApp</div>
                <div className="text-stone-500">{settings?.whatsapp || '+92 300 7654321'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <h2 className="font-heading font-bold text-base text-stone-900 dark:text-white">
              Send a Direct Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order inquiry, product availability, etc."
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you today?"
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
