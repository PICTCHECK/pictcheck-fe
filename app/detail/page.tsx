'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { Card, Header, Tabs } from '@/src/components/ui';
import { DetailImageViewer } from './components/detail-image-viewer';
import { SuspicionDetailCard } from './components/suspicion-detail-card';
import { getContainRectPercent } from './utils/contain-rect';

export default function Page() {
  const router = useRouter();
  const { previewUrl, dimensions, analysisResult } = useUploadImage();
  const suspicions = useMemo(() => analysisResult?.vision.suspicions ?? [], [analysisResult]);
  const [tab, setTab] = useState('');

  useEffect(() => {
    if (!analysisResult) {
      router.replace('/');
      return;
    }

    if (!analysisResult.suspicionDetected || !analysisResult.vision.hasVisibleEvidence || suspicions.length === 0) {
      router.replace('/result');
    }
  }, [analysisResult, router, suspicions.length]);

  const activeTab = useMemo(() => {
    if (tab && suspicions.some((item) => item.id === tab)) return tab;
    return suspicions[0]?.id ?? '';
  }, [suspicions, tab]);

  const current = useMemo(() => suspicions.find((item) => item.id === activeTab) ?? suspicions[0], [activeTab, suspicions]);
  const tabOptions = useMemo(() => suspicions.map((item) => ({ label: item.title, value: item.id })), [suspicions]);
  const containRect = useMemo(() => getContainRectPercent(dimensions), [dimensions]);

  if (!analysisResult || !current) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header title="상세 분석" showBackButton />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <p className="text-center text-body-sm text-muted-foreground">의심 요소 시각화 및 상세 근거 확인</p>

        <DetailImageViewer previewUrl={previewUrl} suspicions={suspicions} containRect={containRect} />
        <Tabs value={activeTab} onChange={setTab} options={tabOptions} />
        <SuspicionDetailCard current={current} previewUrl={previewUrl} />

        {analysisResult.vision.hasVisibleEvidence ? (
          <Card className="flex items-start gap-3 border-amber-200 bg-amber-50/30 p-3">
            <AlertTriangle className="mt-0.5 size-5 text-semantic-warning" />
            <div className="space-y-1">
              <p className="text-caption text-muted-foreground">{analysisResult.vision.summary}</p>
              <p className="text-caption text-muted-foreground">{analysisResult.vision.caution}</p>
            </div>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
