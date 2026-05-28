'use client';

import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { SuspicionMarker } from '@/src/components/ui';
import { getMarkerLinePosition } from '../utils/marker-position';

type SuspicionMarkerLayerProps = {
  item: PictcheckAnalysisResult['vision']['suspicions'][number];
  containRect: { x: number; y: number; width: number; height: number };
};

export function SuspicionMarkerLayer({ item, containRect }: SuspicionMarkerLayerProps) {
  const { markerPoint, lineStyle } = getMarkerLinePosition(item, containRect);

  return (
    <>
      <div className="absolute h-[2px] bg-semantic-error" style={lineStyle} />
      <SuspicionMarker x={markerPoint.x} y={markerPoint.y} index={item.marker.index} />
    </>
  );
}
