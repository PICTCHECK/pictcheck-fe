'use client';

import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import type { PictcheckSuspicionEmptyState, RiskLevel } from '@/src/lib/risk-styles';
import { SuspicionCard } from './suspicion-card';
import { SuspicionEmptyState } from './suspicion-empty-state';

type SuspicionListProps = {
  level: RiskLevel;
  showSuspicions: boolean;
  suspicions: PictcheckAnalysisResult['vision']['suspicions'];
  previewUrl: string | null;
  emptyState: PictcheckSuspicionEmptyState;
};

export function SuspicionList({ level, showSuspicions, suspicions, previewUrl, emptyState }: SuspicionListProps) {
  if (!showSuspicions) {
    return <SuspicionEmptyState level={level} emptyState={emptyState} />;
  }

  return (
    <>
      {suspicions.map((item) => (
        <SuspicionCard key={item.id} item={item} previewUrl={previewUrl} />
      ))}
    </>
  );
}
