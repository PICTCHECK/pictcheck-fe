"use client";

import { cva } from "class-variance-authority";
import { cn } from "@/src/lib/cn";

interface TabsProps<T extends string> {
  options: Array<{ label: string; value: T; index?: number }>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

const tabTriggerVariants = cva(
  "shrink-0 cursor-pointer whitespace-nowrap rounded-button border px-3 py-2 text-center text-[11px] font-bold transition-colors",
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
    <div className={cn('scrollbar-none overflow-x-auto pb-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden', className)}>
      <div className="flex min-w-max gap-2" role="tablist">
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
            <span className="flex items-center gap-1.5">
              {option.index != null ? (
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full border border-white bg-semantic-error text-[10px] font-bold text-white shadow-sm',
                    active && 'ring-2 ring-primary-600/30',
                  )}
                  aria-hidden
                >
                  {option.index}
                </span>
              ) : null}
              <span className="block whitespace-nowrap">{option.label}</span>
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}
