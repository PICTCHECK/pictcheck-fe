import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import type { ContainedImageRect } from './image-coordinate';
import { toRenderedArea, toRenderedPoint } from './image-coordinate';

type SuspicionItem = PictcheckAnalysisResult['vision']['suspicions'][number];

export function getMarkerLinePosition(
  item: SuspicionItem,
  containedRect: ContainedImageRect,
) {
  const markerPoint = toRenderedPoint({ x: item.marker.x, y: item.marker.y }, containedRect);
  const renderedArea = toRenderedArea(item.area, containedRect);
  const areaCenterPoint = {
    x: renderedArea.left + renderedArea.width / 2,
    y: renderedArea.top + renderedArea.height / 2,
  };
  const dx = areaCenterPoint.x - markerPoint.x;
  const dy = areaCenterPoint.y - markerPoint.y;
  const lineLength = Math.hypot(dx, dy);
  const lineAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    markerPoint,
    renderedArea,
    lineStyle: {
      left: `${markerPoint.x}px`,
      top: `${markerPoint.y}px`,
      width: `${lineLength}px`,
      transformOrigin: '0% 50%',
      transform: `rotate(${lineAngle}deg)`,
    },
  };
}
