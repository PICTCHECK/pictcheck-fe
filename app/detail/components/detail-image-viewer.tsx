'use client';

import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { Card, UploadImagePreview } from '@/src/components/ui';
import { SuspicionMarkerLayer } from './suspicion-marker-layer';

type DetailImageViewerProps = {
  previewUrl: string | null;
  suspicions: PictcheckAnalysisResult['vision']['suspicions'];
  containRect: { x: number; y: number; width: number; height: number };
};

export function DetailImageViewer({ previewUrl, suspicions, containRect }: DetailImageViewerProps) {
  return (
    <Card className="p-2">
      {previewUrl ? (
        <div className="relative">
          <UploadImagePreview src={previewUrl} alt="상세 분석 이미지" />
          {suspicions.map((item) => (
            <SuspicionMarkerLayer key={item.id} item={item} containRect={containRect} />
          ))}
        </div>
      ) : (
        <div className="aspect-square w-full rounded-xl bg-gray-100" />
      )}
    </Card>
  );
}
