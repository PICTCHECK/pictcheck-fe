"use client";

import type { RefObject, SyntheticEvent } from 'react';
import { motion } from "framer-motion";
import { cn } from "@/src/lib/cn";

interface UploadImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  layoutId?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
  onImageLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
}

export function UploadImagePreview({ src, alt, className, layoutId, containerRef, onImageLoad }: UploadImagePreviewProps) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element -- blob URL preview requires native img
    <img src={src} alt={alt} className="h-full w-full object-contain object-center" onLoad={onImageLoad} />
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100",
        className,
      )}
    >
      {layoutId ? (
        <motion.div layoutId={layoutId} className="absolute inset-0">
          {image}
        </motion.div>
      ) : (
        <div className="absolute inset-0">{image}</div>
      )}
    </div>
  );
}

export type { UploadImagePreviewProps };
