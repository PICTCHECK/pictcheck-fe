'use client';

import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { Badge, Card, SuspicionThumbnail } from '@/src/components/ui';
import { getRiskStyles } from '@/src/lib/risk-styles';

type SuspicionDetailCardProps = {
  current: PictcheckAnalysisResult['vision']['suspicions'][number];
  previewUrl: string | null;
};

export function SuspicionDetailCard({ current, previewUrl }: SuspicionDetailCardProps) {
  const currentRisk = getRiskStyles(current.riskLevel);

  return (
    <Card className="flex gap-3 p-3">
      {previewUrl ? (
        <SuspicionThumbnail src={previewUrl} alt={current.title} area={current.area} size="md" />
      ) : (
        <div className="size-28 shrink-0 rounded-xl bg-gray-100" />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-body-md leading-tight">{current.title}</p>
          <Badge variant={currentRisk.badgeVariant}>{currentRisk.label}</Badge>
        </div>
        <p className="whitespace-pre-line pt-2 text-caption text-muted-foreground">{current.detailDescription}</p>
        <p className="pt-2 text-caption text-muted-foreground">{current.technicalReason}</p>

        <div className="mt-3 flex items-center gap-2">
          <p className="text-label text-semantic-error">의심 강도</p>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-semantic-error" style={{ width: `${current.confidence}%` }} />
          </div>
          <p className="text-label-sm">{current.confidence}%</p>
        </div>
      </div>
    </Card>
  );
}
