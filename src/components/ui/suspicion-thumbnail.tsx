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
  const zoom = Math.max(zoomTokens.min, Math.min(zoomTokens.max, (100 / targetSize) * zoomTokens.ratio));
  const translateX = 50 - centerX * zoom;
  const translateY = 50 - centerY * zoom;

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-xl bg-gray-100 ${SIZE_CLASS_MAP[size]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- blob URL preview requires native img */}
      <img
        src={src}
        alt={alt}
        className="absolute left-0 top-0 h-full w-full object-cover"
        style={{
          transformOrigin: '0 0',
          transform: `translate(${translateX}%, ${translateY}%) scale(${zoom})`,
        }}
      />
    </div>
  );
}
