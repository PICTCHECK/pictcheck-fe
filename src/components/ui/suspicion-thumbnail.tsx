'use client';

import type { SuspicionArea } from '@/src/lib/analysis/types';

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
  sm: { min: 1.8, max: 3.8, ratio: 0.9 },
  md: { min: 1.9, max: 4, ratio: 0.95 },
} as const;

export function SuspicionThumbnail({ src, alt, area, size = 'sm' }: SuspicionThumbnailProps) {
  const centerX = area.x + area.width / 2;
  const centerY = area.y + area.height / 2;
  const targetSize = Math.max(area.width, area.height);
  const zoomTokens = ZOOM_MAP[size];
  const zoom = Math.max(
    zoomTokens.min,
    Math.min(zoomTokens.max, (100 / targetSize) * zoomTokens.ratio),
  );

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative shrink-0 overflow-hidden rounded-xl bg-gray-100 ${SIZE_CLASS_MAP[size]}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: `${zoom * 100}%`,
        backgroundPosition: `${centerX}% ${centerY}%`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
}
