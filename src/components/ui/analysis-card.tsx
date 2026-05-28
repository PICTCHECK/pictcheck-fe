'use client';

import type { ReactNode } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Card } from '@/src/components/ui/card';
import { SuspicionThumbnail } from '@/src/components/ui/suspicion-thumbnail';
import type { SuspicionArea, VisionEvidenceStrength } from '@/src/lib/analysis/types';
import type { RiskBadgeVariant } from '@/src/lib/risk-styles';

type AnalysisCardVariant = 'default';

type AnalysisCardProps = {
  title: string;
  description: string;
  confidence: VisionEvidenceStrength;
  thumbnail: {
    src: string;
    alt?: string;
    area: SuspicionArea;
  } | null;
  variant?: AnalysisCardVariant;
  children?: ReactNode;
};

const CONFIDENCE_UI: Record<VisionEvidenceStrength, { label: string; badgeVariant: RiskBadgeVariant }> = {
  high: { label: '높음', badgeVariant: 'riskHigh' },
  medium: { label: '보통', badgeVariant: 'riskMedium' },
  low: { label: '낮음', badgeVariant: 'riskLow' },
};

export function AnalysisCard({
  title,
  description,
  confidence,
  thumbnail,
  variant = 'default',
  children,
}: AnalysisCardProps) {
  const confidenceUi = CONFIDENCE_UI[confidence];
  const thumbnailSizeClass = variant === 'default' ? 'size-24' : 'size-24';

  return (
    <Card className="flex gap-3 p-3">
      {thumbnail ? (
        <SuspicionThumbnail src={thumbnail.src} alt={thumbnail.alt ?? title} area={thumbnail.area} size="sm" />
      ) : (
        <div className={`${thumbnailSizeClass} shrink-0 rounded-xl bg-gray-100`} />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 min-w-0 break-keep whitespace-normal text-body-md font-semibold leading-tight">
            {title}
          </p>
          <Badge className="shrink-0 whitespace-nowrap" variant={confidenceUi.badgeVariant}>
            {confidenceUi.label}
          </Badge>
        </div>
        <p className="break-keep whitespace-normal pt-1 text-caption leading-relaxed text-muted-foreground">{description}</p>
        {children}
      </div>
    </Card>
  );
}
