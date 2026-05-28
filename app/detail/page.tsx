'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { Badge, Card, Header, SuspicionMarker, SuspicionThumbnail, Tabs, UploadImagePreview } from '@/src/components/ui';
import { getRiskStyles } from '@/src/lib/risk-styles';

type ImageDimensions = { width: number; height: number } | null;

function getContainRectPercent(dimensions: ImageDimensions) {
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

function mapToContainRect(
  point: { x: number; y: number },
  containRect: { x: number; y: number; width: number; height: number },
) {
  return {
    x: containRect.x + (point.x / 100) * containRect.width,
    y: containRect.y + (point.y / 100) * containRect.height,
  };
}

export default function DetailPage() {
  const router = useRouter();
  const { previewUrl, dimensions, analysisResult } = useUploadImage();
  const analysis = analysisResult;
  const suspicions = useMemo(() => analysis?.vision.suspicions ?? [], [analysis]);
  const [tab, setTab] = useState<string>('');

  useEffect(() => {
    if (!analysis) {
      router.replace('/');
      return;
    }

    if (!analysis.suspicionDetected || !analysis.vision.hasVisibleEvidence || suspicions.length === 0) {
      router.replace('/result');
    }
  }, [analysis, router, suspicions.length]);

  const activeTab = useMemo(() => {
    if (tab && suspicions.some((item) => item.id === tab)) return tab;
    return suspicions[0]?.id ?? '';
  }, [suspicions, tab]);
  const current = useMemo(() => suspicions.find((item) => item.id === activeTab) ?? suspicions[0], [activeTab, suspicions]);
  const tabOptions = useMemo(() => suspicions.map((item) => ({ label: item.title, value: item.id })), [suspicions]);
  const containRect = useMemo(() => getContainRectPercent(dimensions), [dimensions]);
  if (!analysis || !current) return null;
  const currentRisk = getRiskStyles(current.riskLevel);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header title="상세 분석" showBackButton />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <p className="text-center text-body-sm text-muted-foreground">의심 요소 시각화 및 상세 근거 확인</p>

        <Card className="p-2">
          {previewUrl ? (
            <div className="relative">
              <UploadImagePreview src={previewUrl} alt="상세 분석 이미지" />
              {suspicions.map((item) => (
                <div key={item.id}>
                  {(() => {
                    const areaCenter = {
                      x: item.area.x + item.area.width / 2,
                      y: item.area.y + item.area.height / 2,
                    };
                    const markerPoint = mapToContainRect(
                      {
                        x: item.marker.x,
                        y: item.marker.y,
                      },
                      containRect,
                    );
                    const areaCenterPoint = mapToContainRect(areaCenter, containRect);
                    const dx = areaCenterPoint.x - markerPoint.x;
                    const dy = areaCenterPoint.y - markerPoint.y;
                    const lineLength = Math.hypot(dx, dy);
                    const lineAngle = (Math.atan2(dy, dx) * 180) / Math.PI;

                    return (
                      <>
                        <div
                          className="absolute h-[2px] bg-semantic-error"
                          style={{
                            left: `${markerPoint.x}%`,
                            top: `${markerPoint.y}%`,
                            width: `${lineLength}%`,
                            transformOrigin: '0% 50%',
                            transform: `rotate(${lineAngle}deg)`,
                          }}
                        />
                        <SuspicionMarker x={markerPoint.x} y={markerPoint.y} index={item.marker.index} />
                      </>
                    );
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-square w-full rounded-xl bg-gray-100" />
          )}
        </Card>

        <Tabs value={activeTab} onChange={setTab} options={tabOptions} />

        <Card className="flex gap-3 p-3">
          {previewUrl ? (
            <SuspicionThumbnail src={previewUrl} alt={current.title} area={current.area} size="md" />
          ) : (
            <div className="size-28 shrink-0 rounded-xl bg-gray-100" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-body-md leading-tight">{current.title}</p>
              <Badge variant={currentRisk.badgeVariant}>{currentRisk.label}</Badge>
            </div>
            <p className="whitespace-pre-line pt-2 text-caption text-muted-foreground">{current.detailDescription}</p>
            <p className="pt-2 text-caption text-muted-foreground">{current.technicalReason}</p>

            <div className="mt-3 flex items-center gap-2">
              <p className="text-label text-semantic-error">의심 강도</p>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-semantic-error" style={{ width: `${current.confidence}%` }} />
              </div>
              <p className="text-label-sm">{current.confidence}%</p>
            </div>
          </div>
        </Card>

        {analysis.vision.hasVisibleEvidence ? (
          <Card className="flex items-start gap-3 border-amber-200 bg-amber-50/30 p-3">
            <AlertTriangle className="mt-0.5 size-5 text-semantic-warning" />
            <div className="space-y-1">
              <p className="text-caption text-muted-foreground">{analysis.vision.summary}</p>
              <p className="text-caption text-muted-foreground">{analysis.vision.caution}</p>
            </div>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
