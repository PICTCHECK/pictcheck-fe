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
type ImageSize = { width: number; height: number };

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

export function getSuspicionAreaCenter(area: SuspicionArea): RenderPoint {
  return {
    x: area.x + area.width / 2,
    y: area.y + area.height / 2,
  };
}

type SuspicionZoomOptions = {
  min: number;
  max: number;
  ratio: number;
};

export function getSuspicionAreaZoom(area: SuspicionArea, options: SuspicionZoomOptions): number {
  const targetSize = Math.max(area.width, area.height, 1);

  return Math.max(options.min, Math.min(options.max, (100 / targetSize) * options.ratio));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** 확대 시 뷰포트에 보이는 이미지 반폭(%, 0~50) */
function getVisibleImageHalfPercent(zoom: number): number {
  return 50 / zoom;
}

/**
 * object-contain 배치 후 scale·translate만 적용하는 썸네일 변환.
 * center는 확대 시 잘리지 않도록 clamp, translate는 빈 여백이 생기지 않게 제한.
 */
export function getSuspicionThumbnailTransform(
  area: SuspicionArea,
  container: ImageSize,
  natural: ImageSize,
  zoom: number,
) {
  const containedRect = calculateContainedImageRect({
    containerWidth: container.width,
    containerHeight: container.height,
    naturalWidth: natural.width,
    naturalHeight: natural.height,
  });

  const center = getSuspicionAreaCenter(area);
  const visibleHalf = getVisibleImageHalfPercent(zoom);
  const focusX = clamp(center.x, visibleHalf, 100 - visibleHalf);
  const focusY = clamp(center.y, visibleHalf, 100 - visibleHalf);

  const focusPxX = containedRect.offsetX + containedRect.width * (focusX / 100);
  const focusPxY = containedRect.offsetY + containedRect.height * (focusY / 100);
  const originOffsetX = containedRect.width * (focusX / 100);
  const originOffsetY = containedRect.height * (focusY / 100);

  const scaledLeft = focusPxX - originOffsetX * zoom;
  const scaledTop = focusPxY - originOffsetY * zoom;
  const scaledRight = focusPxX + (containedRect.width - originOffsetX) * zoom;
  const scaledBottom = focusPxY + (containedRect.height - originOffsetY) * zoom;

  const translateX = clamp(
    container.width / 2 - focusPxX,
    container.width - scaledRight,
    -scaledLeft,
  );
  const translateY = clamp(
    container.height / 2 - focusPxY,
    container.height - scaledBottom,
    -scaledTop,
  );

  return {
    base: {
      left: containedRect.offsetX,
      top: containedRect.offsetY,
      width: containedRect.width,
      height: containedRect.height,
    },
    transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
    transformOrigin: `${focusX}% ${focusY}%`,
  };
}
