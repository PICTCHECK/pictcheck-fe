'use client';

import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { Card, UploadImagePreview } from '@/src/components/ui';
import { useImageRenderMetrics } from '../hooks/use-image-render-metrics';
import { SuspicionMarkerLayer } from './suspicion-marker-layer';

type DetailImageViewerProps = {
  previewUrl: string | null;
  suspicions: PictcheckAnalysisResult['vision']['suspicions'];
};

export function DetailImageViewer({ previewUrl, suspicions }: DetailImageViewerProps) {
  const { containerRef, handleImageLoad, containedRect, ready } = useImageRenderMetrics();

  return (
    <Card className="p-2">
      {previewUrl ? (
        <div className="relative">
          <UploadImagePreview
            src={previewUrl}
            alt="상세 분석 이미지"
            containerRef={containerRef}
            onImageLoad={handleImageLoad}
          />
          {ready
            ? suspicions.map((item) => <SuspicionMarkerLayer key={item.id} item={item} containedRect={containedRect} />)
            : null}
        </div>
      ) : (
        <div className="aspect-square w-full rounded-xl bg-gray-100" />
      )}
    </Card>
  );
}
