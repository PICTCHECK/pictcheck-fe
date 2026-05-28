type ImageDimensions = { width: number; height: number } | null;

export function getContainRectPercent(dimensions: ImageDimensions) {
  if (!dimensions) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  const { width, height } = dimensions;
  if (width <= 0 || height <= 0) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  const dominant = Math.max(width, height);
  const scaledWidth = (width / dominant) * 100;
  const scaledHeight = (height / dominant) * 100;

  return {
    x: (100 - scaledWidth) / 2,
    y: (100 - scaledHeight) / 2,
    width: scaledWidth,
    height: scaledHeight,
  };
}

export function mapToContainRect(
  point: { x: number; y: number },
  containRect: { x: number; y: number; width: number; height: number },
) {
  return {
    x: containRect.x + (point.x / 100) * containRect.width,
    y: containRect.y + (point.y / 100) * containRect.height,
  };
}
