"use client";

import { cva } from "class-variance-authority";
import { cn } from "@/src/lib/cn";

interface TabsProps<T extends string> {
  options: Array<{ label: string; value: T }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const tabTriggerVariants = cva(
  "min-w-0 flex-1 cursor-pointer whitespace-nowrap rounded-button border px-2 py-2 text-center text-[10px] font-bold transition-colors",
  {
    variants: {
      active: {
        true: "border-primary-600 bg-white text-primary-600",
        false: "border-gray-300 bg-white text-gray-900",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export function Tabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: TabsProps<T>) {
  return (
    <div className={cn("flex gap-2", className)} role="tablist">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            type="button"
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={tabTriggerVariants({ active })}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
