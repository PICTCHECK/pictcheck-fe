'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SuspicionArea } from '@/src/lib/analysis/types';
import {
  getSuspicionAreaZoom,
  getSuspicionThumbnailTransform,
} from '@/src/lib/image-coordinate';

interface SuspicionThumbnailProps {
  src: string;
  alt: string;
  area: SuspicionArea;
  size?: 'sm' | 'md';
}

const SIZE_CLASS_MAP = {
  sm: 'size-24',
  md: 'size-28',
} as const;

const ZOOM_MAP = {
  sm: { min: 2.4, max: 5.2, ratio: 1.25 },
  md: { min: 2.6, max: 5.6, ratio: 1.35 },
} as const;

export function SuspicionThumbnail({ src, alt, area, size = 'sm' }: SuspicionThumbnailProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

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

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateContainerSize]);

  const zoom = useMemo(() => getSuspicionAreaZoom(area, ZOOM_MAP[size]), [area, size]);

  const thumbnailTransform = useMemo(() => {
    if (containerSize.width <= 0 || containerSize.height <= 0 || naturalSize.width <= 0) {
      return null;
    }

    return getSuspicionThumbnailTransform(area, containerSize, naturalSize, zoom);
  }, [area, containerSize, naturalSize, zoom]);

  const ready = thumbnailTransform !== null;

  return (
    <div
      ref={containerRef}
      className={`relative shrink-0 overflow-hidden rounded-xl bg-gray-100 ${SIZE_CLASS_MAP[size]}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview requires native img */}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        className={ready ? 'absolute max-w-none object-contain' : 'sr-only'}
        style={
          ready
            ? {
                left: thumbnailTransform.base.left,
                top: thumbnailTransform.base.top,
                width: thumbnailTransform.base.width,
                height: thumbnailTransform.base.height,
                transform: thumbnailTransform.transform,
                transformOrigin: thumbnailTransform.transformOrigin,
              }
            : undefined
        }
      />
    </div>
  );
}
