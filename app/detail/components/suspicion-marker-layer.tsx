'use client';

import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { SuspicionMarker } from '@/src/components/ui';
import { getMarkerPosition } from '../utils/marker-position';
import type { ContainedImageRect } from '../utils/image-coordinate';

type SuspicionMarkerLayerProps = {
  item: PictcheckAnalysisResult['vision']['suspicions'][number];
  containedRect: ContainedImageRect;
  active?: boolean;
  onSelect?: (id: string) => void;
};

export function SuspicionMarkerLayer({ item, containedRect, active, onSelect }: SuspicionMarkerLayerProps) {
  const markerPoint = getMarkerPosition(item, containedRect);

  return (
    <SuspicionMarker
      className="pointer-events-auto"
      x={markerPoint.x}
      y={markerPoint.y}
      index={item.marker.index}
      coordinateUnit="pixel"
      active={active}
      aria-label={`의심 영역 ${item.marker.index}: ${item.title}`}
      aria-current={active ? 'true' : undefined}
      onClick={() => onSelect?.(item.id)}
    />
  );
}
