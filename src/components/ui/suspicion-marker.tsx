"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/cn";

interface SuspicionMarkerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  x: number;
  y: number;
  index: number;
}

export function SuspicionMarker({
  x,
  y,
  index,
  className,
  style,
  ...props
}: SuspicionMarkerProps) {
  const boundedX = Math.max(0, Math.min(100, x));
  const boundedY = Math.max(0, Math.min(100, y));

  return (
    <button
      type="button"
      className={cn(
        "absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-semantic-error text-label-sm text-white shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:shadow-focus",
        className,
      )}
      style={{
        left: `${boundedX}%`,
        top: `${boundedY}%`,
        ...style,
      }}
      {...props}
    >
      {index}
    </button>
  );
}
