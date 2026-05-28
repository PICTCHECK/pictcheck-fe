'use client';

import { CircleAlert, CircleCheck, CircleX, Info } from 'lucide-react';
import { Toaster as Sonner, toast } from 'sonner';
import { cn } from '@/src/lib/cn';
import type { SeverityStatus } from '@/src/components/ui/types';

export type ToastContent = {
  title: string;
  description?: string;
};

type ToastPayload = string | ToastContent;

const toastIconMap = {
  success: CircleCheck,
  error: CircleX,
  warning: CircleAlert,
  info: Info,
} as const;

const toastIconWrapClassMap: Record<SeverityStatus, string> = {
  success: 'bg-emerald-500/22',
  error: 'bg-red-500/22',
  warning: 'bg-amber-500/22',
  info: 'bg-primary-500/22',
};

const toastIconClassMap: Record<SeverityStatus, string> = {
  success: 'text-emerald-300',
  error: 'text-red-300',
  warning: 'text-amber-300',
  info: 'text-primary-200',
};

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors={false}
      toastOptions={{
        className: 'bg-transparent border-0 p-0 shadow-none',
      }}
      offset={16}
    />
  );
}

function normalizeToastPayload(payload: ToastPayload): ToastContent {
  if (typeof payload === 'string') {
    return { title: payload };
  }

  return payload;
}

export function showToast(type: SeverityStatus, payload: ToastPayload) {
  const Icon = toastIconMap[type];
  const iconWrapClassName = toastIconWrapClassMap[type];
  const iconClassName = toastIconClassMap[type];
  const { title, description } = normalizeToastPayload(payload);

  toast.custom(
    () => (
      <div className="relative w-[min(92vw,360px)] overflow-hidden rounded-2xl bg-gray-700/92 px-4 py-3 text-white shadow-[0_6px_16px_-12px_rgba(15,23,42,0.5)]">
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full', iconWrapClassName)}>
            <Icon className={cn('size-[18px] shrink-0', iconClassName)} />
          </div>
          <div className="min-w-0 flex-1 space-y-1 pr-1">
            <p className="text-body-sm font-semibold leading-5 text-white">{title}</p>
            {description ? (
              <p
                className="text-caption leading-4 text-white/72"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    ),
    { duration: 2600 },
  );
}

export const toastSuccess = (payload: ToastPayload) => showToast('success', payload);
export const toastError = (payload: ToastPayload) => showToast('error', payload);
export const toastWarning = (payload: ToastPayload) => showToast('warning', payload);
export const toastInfo = (payload: ToastPayload) => showToast('info', payload);
