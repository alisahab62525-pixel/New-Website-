import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  Truck,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { formatDate } from '../../utils/formatters';

interface OrderTimelineProps {
  order: Order;
}

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'Pending', label: 'Order Placed', icon: Clock },
  { status: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'Processing', label: 'Processing', icon: Package },
  { status: 'Shipped', label: 'Shipped', icon: Truck },
  { status: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const isCancelled = order.orderStatus === 'Cancelled';

  // Find index of current status
  const currentStepIndex = STEPS.findIndex((s) => s.status === order.orderStatus);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 border border-stone-200 dark:border-stone-800">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-white">Order Status</h3>
          <p className="text-xs text-stone-500 mt-0.5">Live tracking for Order #{order.id}</p>
        </div>

        <div>
          {isCancelled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 text-xs font-bold rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              Cancelled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-bold rounded-full">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              {order.orderStatus}
            </span>
          )}
        </div>
      </div>

      {isCancelled ? (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-200 text-xs leading-relaxed flex items-start gap-3">
          <RotateCcw className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">This order was cancelled.</div>
            <div>If you have any questions or require a refund, please contact customer support.</div>
          </div>
        </div>
      ) : (
        /* Progress Steps */
        <div className="relative">
          {/* Desktop Timeline */}
          <div className="grid grid-cols-5 gap-2 relative">
            {/* Background Track Line */}
            <div
              className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-stone-200 dark:bg-stone-800 -z-0"
              aria-hidden="true"
            >
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.max(0, Math.min(100, (currentStepIndex / (STEPS.length - 1)) * 100))}%`,
                }}
              />
            </div>

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isFuture = idx > currentStepIndex;

              return (
                <div key={step.status} className="flex flex-col items-center text-center relative z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-amber-500 text-stone-950 ring-4 ring-amber-100 dark:ring-amber-950 font-bold'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-400 border border-stone-200 dark:border-stone-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="mt-2.5">
                    <div
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? 'text-stone-900 dark:text-white font-bold'
                          : isPast
                          ? 'text-stone-700 dark:text-stone-300'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Courier & Tracking Details Card */}
          {order.trackingNumber && (
            <div className="mt-6 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">
                    Courier: {order.courier || 'Express Delivery'}
                  </div>
                  <div className="text-stone-500">
                    Tracking Number:{' '}
                    <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                      {order.trackingNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-stone-400">
                Updated: {formatDate(order.updatedAt)}
              </div>
            </div>
          )}

          {/* Detailed Timeline Events History */}
          <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-400">Activity Log</div>
            <div className="space-y-2">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5"></span>
                  <div className="flex-1">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">{event.status}: </span>
                    <span className="text-stone-600 dark:text-stone-400">{event.note || 'Status updated'}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 tabular-nums shrink-0">
                    {formatDate(event.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
