"use client";

import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";
import { Toaster as Sonner, toast } from "sonner";
import { cn } from "@/src/lib/cn";
import type { SeverityStatus } from "@/src/components/ui/types";

const toastIconMap = {
  success: CircleCheck,
  error: CircleX,
  warning: CircleAlert,
  info: Info,
} as const;

const toastContainerClassMap: Record<SeverityStatus, string> = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-primary-100 bg-primary-100 text-primary-700",
};

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      richColors={false}
      toastOptions={{
        className: "rounded-button border px-3 py-2 text-body-sm shadow-card",
      }}
    />
  );
}

export function showToast(type: SeverityStatus, message: string) {
  const Icon = toastIconMap[type];
  const className = toastContainerClassMap[type];

  toast.custom(
    () => (
      <div className={cn("flex min-w-72 items-center gap-2 rounded-button border px-3 py-2 text-body-sm", className)}>
        <Icon className="size-4 shrink-0" />
        <p>{message}</p>
      </div>
    ),
    { duration: 2400 },
  );
}
