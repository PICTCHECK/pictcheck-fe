'use client';

import { Card } from '@/src/components/ui/card';
import { MultilineText } from '@/src/components/ui/multiline-text';
import { RiskScoreCircle } from '@/src/components/ui/risk-score-circle';
import { cn } from '@/src/lib/cn';
import type { MultilineCopy } from '@/src/lib/multiline-copy';
import { getRiskLevelBadgeClass, getRiskLevelBadgeLabel, getRiskStyles, type RiskLevel } from '@/src/lib/risk-styles';

interface ResultSummaryCardProps {
  score: number;
  level: RiskLevel;
  statusLabel: string;
  summary: MultilineCopy;
  className?: string;
}

export function ResultSummaryCard({
  score,
  level,
  statusLabel,
  summary,
  className,
}: ResultSummaryCardProps) {
  const riskStyles = getRiskStyles(level);

  return (
    <Card className={cn('space-y-4 p-5', riskStyles.card, className)}>
      <div className="space-y-2 text-center">
        <h2 className="text-title-lg font-bold leading-snug tracking-[-0.02em] text-foreground">{statusLabel}</h2>
        <span
          className={cn(
            'inline-flex items-center rounded-[12px] px-3 py-2 text-[15px] leading-[14px] font-semibold tracking-[-0.02em]',
            getRiskLevelBadgeClass(level),
          )}
        >
          {getRiskLevelBadgeLabel(level)}
        </span>
      </div>

      <div className="flex justify-center py-1">
        <RiskScoreCircle score={score} level={level} size="lg" />
      </div>

      <p className="mx-auto max-w-[18rem] text-center text-body-sm leading-relaxed text-muted-foreground">
        <MultilineText copy={summary} />
      </p>
    </Card>
  );
}
