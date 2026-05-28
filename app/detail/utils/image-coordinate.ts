import type { SuspicionArea } from '@/src/lib/analysis/types';

type CalculateContainedImageRectParams = {
  containerWidth: number;
  containerHeight: number;
  naturalWidth: number;
  naturalHeight: number;
};

export type ContainedImageRect = {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};

type RenderPoint = { x: number; y: number };

export function calculateContainedImageRect({
  containerWidth,
  containerHeight,
  naturalWidth,
  naturalHeight,
}: CalculateContainedImageRectParams): ContainedImageRect {
  if (containerWidth <= 0 || containerHeight <= 0 || naturalWidth <= 0 || naturalHeight <= 0) {
    return { width: 0, height: 0, offsetX: 0, offsetY: 0 };
  }

  const containerRatio = containerWidth / containerHeight;
  const imageRatio = naturalWidth / naturalHeight;

  if (imageRatio > containerRatio) {
    const width = containerWidth;
    const height = containerWidth / imageRatio;

    return {
      width,
      height,
      offsetX: 0,
      offsetY: (containerHeight - height) / 2,
    };
  }

  const height = containerHeight;
  const width = containerHeight * imageRatio;

  return {
    width,
    height,
    offsetX: (containerWidth - width) / 2,
    offsetY: 0,
  };
}

export function toRenderedPoint(point: RenderPoint, rect: ContainedImageRect): RenderPoint {
  return {
    x: rect.offsetX + rect.width * (point.x / 100),
    y: rect.offsetY + rect.height * (point.y / 100),
  };
}

export function toRenderedArea(area: SuspicionArea, rect: ContainedImageRect) {
  return {
    left: rect.offsetX + rect.width * (area.x / 100),
    top: rect.offsetY + rect.height * (area.y / 100),
    width: rect.width * (area.width / 100),
    height: rect.height * (area.height / 100),
  };
}
