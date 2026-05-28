"use client";

import { LoaderCircle } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/cn";

const spinnerVariants = cva("inline-flex items-center justify-center", {
  variants: {
    size: {
      sm: "size-3",
      lg: "size-6",
    },
    tone: {
      primary: "text-primary-600",
      current: "text-current",
    },
  },
  defaultVariants: {
    size: "sm",
    tone: "primary",
  },
});

type SpinnerProps = ComponentPropsWithoutRef<"span"> &
  VariantProps<typeof spinnerVariants>;

export function Spinner({ className, size, tone, ...props }: SpinnerProps) {
  return (
    <span className={cn(spinnerVariants({ size, tone }), className)} {...props}>
      <LoaderCircle className="size-full animate-spin" />
    </span>
  );
}
