'use client';

import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { Card, UploadImagePreview } from '@/src/components/ui';
import { useImageRenderMetrics } from '../hooks/use-image-render-metrics';
import { SuspicionMarkerLayer } from './suspicion-marker-layer';

type DetailImageViewerProps = {
  previewUrl: string | null;
  suspicions: PictcheckAnalysisResult['vision']['suspicions'];
  activeSuspicionId?: string;
  onSuspicionSelect?: (id: string) => void;
};

export function DetailImageViewer({
  previewUrl,
  suspicions,
  activeSuspicionId,
  onSuspicionSelect,
}: DetailImageViewerProps) {
  const { containerRef, handleImageLoad, containedRect, ready } = useImageRenderMetrics();

  return (
    <Card className="p-2">
      {previewUrl ? (
        <UploadImagePreview
          src={previewUrl}
          alt="상세 분석 이미지"
          containerRef={containerRef}
          onImageLoad={handleImageLoad}
        >
          {ready
            ? suspicions.map((item) => (
                <SuspicionMarkerLayer
                  key={item.id}
                  item={item}
                  containedRect={containedRect}
                  active={item.id === activeSuspicionId}
                  onSelect={onSuspicionSelect}
                />
              ))
            : null}
        </UploadImagePreview>
      ) : (
        <div className="aspect-square w-full rounded-xl bg-gray-100" />
      )}
    </Card>
  );
}
