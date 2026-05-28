'use client';

import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { SuspicionMarker } from '@/src/components/ui';
import { getMarkerLinePosition } from '../utils/marker-position';
import type { ContainedImageRect } from '../utils/image-coordinate';

type SuspicionMarkerLayerProps = {
  item: PictcheckAnalysisResult['vision']['suspicions'][number];
  containedRect: ContainedImageRect;
};

export function SuspicionMarkerLayer({ item, containedRect }: SuspicionMarkerLayerProps) {
  const { markerPoint, lineStyle, renderedArea } = getMarkerLinePosition(item, containedRect);

  return (
    <>
      <div
        className="absolute rounded-[10px] border border-semantic-error/70 bg-semantic-error/10"
        style={{
          left: `${renderedArea.left}px`,
          top: `${renderedArea.top}px`,
          width: `${renderedArea.width}px`,
          height: `${renderedArea.height}px`,
        }}
      />
      <div className="absolute h-[2px] bg-semantic-error" style={lineStyle} />
      <SuspicionMarker x={markerPoint.x} y={markerPoint.y} index={item.marker.index} coordinateUnit="pixel" />
    </>
  );
}
