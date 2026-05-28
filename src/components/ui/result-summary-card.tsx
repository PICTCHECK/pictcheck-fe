"use client";

import { Card } from "@/src/components/ui/card";
import { RiskScoreCircle } from "@/src/components/ui/risk-score-circle";
import { cn } from "@/src/lib/cn";
import { getRiskStyles, type RiskLevel } from "@/src/lib/risk-styles";

interface ResultSummaryCardProps {
  score: number;
  level: RiskLevel;
  statusLabel: string;
  statusSuffix: string | null;
  summary: string;
  className?: string;
}

export function ResultSummaryCard({
  score,
  level,
  statusLabel,
  statusSuffix,
  summary,
  className,
}: ResultSummaryCardProps) {
  const riskStyles = getRiskStyles(level);

  return (
    <Card className={cn("space-y-5 border-gray-200 bg-white p-5 shadow-sm", className)}>
      <h2
        aria-label={statusLabel}
        className="text-title-lg font-bold leading-snug tracking-[-0.02em] text-foreground"
      >
        AI 가능성{" "}
        <span className={riskStyles.title}>{riskStyles.label}</span>
        {statusSuffix ? (
          <>
            <span aria-hidden> · </span>
            <span className="font-semibold">{statusSuffix}</span>
          </>
        ) : null}
      </h2>

      <div className="flex justify-center py-1">
        <RiskScoreCircle score={score} level={level} size="lg" />
      </div>

      <p className="max-w-[18rem] text-body-sm leading-relaxed text-muted-foreground">{summary}</p>
    </Card>
  );
}
