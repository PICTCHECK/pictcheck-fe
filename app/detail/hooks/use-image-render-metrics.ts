'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateContainedImageRect } from '@/src/lib/image-coordinate';

type Size = { width: number; height: number };

export function useImageRenderMetrics() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<Size>({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState<Size>({ width: 0, height: 0 });

  const updateContainerSize = useCallback(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerSize({ width, height });
  }, []);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
  }, []);

  useEffect(() => {
    updateContainerSize();
    const node = containerRef.current;
    if (!node) return;

    const resizeObserver = new ResizeObserver(() => {
      updateContainerSize();
    });
    resizeObserver.observe(node);

    window.addEventListener('resize', updateContainerSize);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateContainerSize);
    };
  }, [updateContainerSize]);

  const containedRect = useMemo(
    () =>
      calculateContainedImageRect({
        containerWidth: containerSize.width,
        containerHeight: containerSize.height,
        naturalWidth: naturalSize.width,
        naturalHeight: naturalSize.height,
      }),
    [containerSize.height, containerSize.width, naturalSize.height, naturalSize.width],
  );

  return {
    containerRef,
    handleImageLoad,
    containedRect,
    ready: containedRect.width > 0 && containedRect.height > 0,
  };
}
