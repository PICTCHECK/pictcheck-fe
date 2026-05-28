import type { SuspicionArea, SuspicionMarker, VisionSuspicion } from '@/src/lib/analysis/types';

const MIN_BOUND = 0;
const MAX_BOUND = 100;

function clampPercent(value: number): number {
  return Math.max(MIN_BOUND, Math.min(MAX_BOUND, value));
}

function normalizeArea(area: SuspicionArea): SuspicionArea {
  const width = clampPercent(area.width);
  const height = clampPercent(area.height);
  const x = clampPercent(area.x);
  const y = clampPercent(area.y);

  return {
    x: Math.min(x, MAX_BOUND - width),
    y: Math.min(y, MAX_BOUND - height),
    width,
    height,
  };
}

function getAreaCenter(area: SuspicionArea): { x: number; y: number } {
  return {
    x: clampPercent(area.x + area.width / 2),
    y: clampPercent(area.y + area.height / 2),
  };
}

function normalizeMarker(area: SuspicionArea, marker: SuspicionMarker): SuspicionMarker {
  const normalizedX = clampPercent(marker.x);
  const normalizedY = clampPercent(marker.y);
  const areaEndX = area.x + area.width;
  const areaEndY = area.y + area.height;
  const markerInsideArea =
    normalizedX >= area.x && normalizedX <= areaEndX && normalizedY >= area.y && normalizedY <= areaEndY;

  if (markerInsideArea) {
    return {
      index: marker.index,
      x: normalizedX,
      y: normalizedY,
    };
  }

  const center = getAreaCenter(area);
  return {
    index: marker.index,
    x: center.x,
    y: center.y,
  };
}

function normalizeSuspicion(suspicion: VisionSuspicion): VisionSuspicion {
  const area = normalizeArea(suspicion.area);
  return {
    ...suspicion,
    confidence: clampPercent(suspicion.confidence),
    area,
    marker: normalizeMarker(area, suspicion.marker),
  };
}

export function normalizeVisionSuspicions(suspicions: VisionSuspicion[]): VisionSuspicion[] {
  return [...suspicions].map(normalizeSuspicion).sort((a, b) => a.priority - b.priority);
}
