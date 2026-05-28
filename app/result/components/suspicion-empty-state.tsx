'use client';

import { CircleCheck, ScanSearch } from 'lucide-react';
import { Card } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import { getRiskStyles, type PictcheckSuspicionEmptyState, type RiskLevel } from '@/src/lib/risk-styles';

type SuspicionEmptyStateProps = {
  level: RiskLevel;
  emptyState: PictcheckSuspicionEmptyState;
};

export function SuspicionEmptyState({ level, emptyState }: SuspicionEmptyStateProps) {
  const riskStyles = getRiskStyles(level);

  return (
    <Card className={cn('flex flex-col items-center gap-3 px-4 py-8 text-center', riskStyles.card)}>
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          level === 'low' ? 'bg-emerald-100' : level === 'medium' ? 'bg-orange-100' : 'bg-red-100',
        )}
      >
        {level === 'low' ? (
          <CircleCheck className={cn('size-6', riskStyles.title)} aria-hidden />
        ) : (
          <ScanSearch className={cn('size-6', riskStyles.title)} aria-hidden />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-body-md font-semibold tracking-[-0.02em]">{emptyState.title}</p>
        <p className="text-body-sm leading-relaxed text-muted-foreground">{emptyState.description}</p>
      </div>
    </Card>
  );
}
