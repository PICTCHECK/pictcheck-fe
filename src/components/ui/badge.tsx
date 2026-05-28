import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/src/lib/cn';

const badgeVariants = cva('inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] leading-4 font-bold', {
  variants: {
    variant: {
      riskHigh: 'border-red-100 bg-red-50 text-red-600',
      riskMedium: 'border-orange-100 bg-orange-50 text-orange-600',
      riskLow: 'border-emerald-100 bg-emerald-50 text-emerald-600',
    },
  },
  defaultVariants: {
    variant: 'riskLow',
  },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
