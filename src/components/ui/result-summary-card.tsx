"use client";

import { Card } from "@/src/components/ui/card";
import { RiskScoreCircle } from "@/src/components/ui/risk-score-circle";
import { cn } from "@/src/lib/cn";
import type { RiskLevel } from "@/src/lib/risk-styles";

interface ResultSummaryCardProps {
  score: number;
  level: RiskLevel;
  statusLabel: string;
  summary: string;
  className?: string;
}

export function ResultSummaryCard({
  score,
  level,
  statusLabel,
  summary,
  className,
}: ResultSummaryCardProps) {
  return (
    <Card className={cn("space-y-5 border-gray-200 bg-white p-5 shadow-sm", className)}>
      <h2 className="text-title-lg font-bold leading-snug tracking-[-0.02em] text-foreground">
        {statusLabel}
      </h2>

      <div className="flex justify-center py-1">
        <RiskScoreCircle score={score} level={level} size="lg" />
      </div>

      <p className="mx-auto max-w-[18rem] text-center text-body-sm leading-relaxed text-muted-foreground">
        {summary}
      </p>
    </Card>
  );
}
