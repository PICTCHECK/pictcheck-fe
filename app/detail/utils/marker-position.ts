import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import type { ContainedImageRect } from '@/src/lib/image-coordinate';
import { getSuspicionAreaCenter, toRenderedPoint } from '@/src/lib/image-coordinate';

type SuspicionItem = PictcheckAnalysisResult['vision']['suspicions'][number];

export function getMarkerPosition(item: SuspicionItem, containedRect: ContainedImageRect) {
  return toRenderedPoint(getSuspicionAreaCenter(item.area), containedRect);
}
