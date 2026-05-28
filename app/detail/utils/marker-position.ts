import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { mapToContainRect } from './contain-rect';

type SuspicionItem = PictcheckAnalysisResult['vision']['suspicions'][number];

export function getMarkerLinePosition(
  item: SuspicionItem,
  containRect: { x: number; y: number; width: number; height: number },
) {
  const areaCenter = {
    x: item.area.x + item.area.width / 2,
    y: item.area.y + item.area.height / 2,
  };
  const markerPoint = mapToContainRect(
    {
      x: item.marker.x,
      y: item.marker.y,
    },
    containRect,
  );
  const areaCenterPoint = mapToContainRect(areaCenter, containRect);
  const dx = areaCenterPoint.x - markerPoint.x;
  const dy = areaCenterPoint.y - markerPoint.y;
  const lineLength = Math.hypot(dx, dy);
  const lineAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return {
    markerPoint,
    lineStyle: {
      left: `${markerPoint.x}%`,
      top: `${markerPoint.y}%`,
      width: `${lineLength}%`,
      transformOrigin: '0% 50%',
      transform: `rotate(${lineAngle}deg)`,
    },
  };
}
