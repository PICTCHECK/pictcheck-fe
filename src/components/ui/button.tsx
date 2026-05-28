"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Spinner } from "@/src/components/ui/spinner";
import { cn } from "@/src/lib/cn";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-button px-4 text-label-sm font-semibold transition-colors focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 hover:bg-primary-500",
        secondary:
          "border border-[#60A5FA] bg-white hover:bg-primary-100/40",
        tertiary: "border border-border bg-white hover:bg-gray-100",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3 text-caption",
        lg: "h-11 px-5 text-label-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

const buttonTextColorMap = {
  primary: "#FFFFFF",
  secondary: "#005BFF",
  tertiary: "var(--color-foreground)",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const resolvedVariant = (variant ?? "primary") as keyof typeof buttonTextColorMap;

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isDisabled}
      aria-busy={loading}
      style={{ ...style, color: buttonTextColorMap[resolvedVariant] }}
      {...props}
    >
      {loading ? <Spinner size="sm" tone="current" aria-hidden /> : null}
      {children}
    </button>
  );
}

export { Button };
