'use client';

import { Badge, Card, SuspicionThumbnail } from '@/src/components/ui';
import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { getRiskStyles } from '@/src/lib/risk-styles';

type SuspicionCardProps = {
  item: PictcheckAnalysisResult['vision']['suspicions'][number];
  previewUrl: string | null;
};

export function SuspicionCard({ item, previewUrl }: SuspicionCardProps) {
  const itemRisk = getRiskStyles(item.riskLevel);

  return (
    <Card className="flex gap-3 p-3">
      {previewUrl ? (
        <SuspicionThumbnail src={previewUrl} alt={item.title} area={item.area} size="sm" />
      ) : (
        <div className="size-24 shrink-0 rounded-xl bg-gray-100" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-body-md font-semibold leading-tight">{item.title}</p>
          <Badge variant={itemRisk.badgeVariant}>{itemRisk.label}</Badge>
        </div>
        <p className="pt-1 text-body-sm leading-relaxed text-muted-foreground">{item.description}</p>
      </div>
    </Card>
  );
}
