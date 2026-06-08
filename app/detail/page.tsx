'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { PreTradeCheckBottomSheet } from '../result/components/pre-trade-check-bottom-sheet';
import { AlertTriangle, ChevronRight, Lightbulb } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { AnalysisCard, Card, Header, Tabs } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import { DetailImageViewer } from './components/detail-image-viewer';

const DETAIL_VISUAL_NOTICE_SUMMARY = '일부 영역에서 부자연스러운 디테일이 확인됩니다.';
const DETAIL_VISUAL_NOTICE_CAUTION = '상세 분석 결과를 참고해보세요.';

function PreTradeGuideTrigger({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        'flex h-[52px] w-full items-center justify-between gap-3 rounded-2xl border border-[#E5E8EB] bg-white px-4 text-left transition-colors active:bg-[#F9FAFB]',
        className,
      )}
      onClick={onClick}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#F2F6FF]">
          <Lightbulb className="size-[18px] text-[#3182F6]" strokeWidth={1.75} aria-hidden />
        </span>
        <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-[#191F28]">
          거래 전 어떤 확인이 필요할까요?
        </span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-[#B0B8C1]" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

function DetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const suspicionFromUrl = searchParams.get('suspicion');
  const { previewUrl, analysisResult } = useUploadImage();
  const suspicions = useMemo(() => analysisResult?.vision.suspicions ?? [], [analysisResult]);
  const [tab, setTab] = useState('');
  const [preTradeSheetOpen, setPreTradeSheetOpen] = useState(false);

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
    if (suspicionFromUrl && suspicions.some((item) => item.id === suspicionFromUrl)) return suspicionFromUrl;
    return suspicions[0]?.id ?? '';
  }, [suspicions, tab, suspicionFromUrl]);

  const current = useMemo(
    () => suspicions.find((item) => item.id === activeTab) ?? suspicions[0],
    [activeTab, suspicions],
  );
  const tabOptions = useMemo(
    () => suspicions.map((item) => ({ label: item.title, value: item.id, index: item.marker.index })),
    [suspicions],
  );
  if (!analysisResult || !current) return null;
  const isLowLevel = analysisResult.sightengine.level === 'low';

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header title="상세 분석" showBackButton />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <p className="text-center text-body-sm text-muted-foreground">시각적 관찰 포인트와 확인 영역 안내</p>

        <DetailImageViewer
          previewUrl={previewUrl}
          suspicions={suspicions}
          activeSuspicionId={activeTab}
          onSuspicionSelect={setTab}
        />
        <Tabs value={activeTab} onChange={setTab} options={tabOptions} />
        <AnalysisCard
          title={current.title}
          description={current.detailDescription}
          confidence={current.evidenceStrength}
          thumbnail={previewUrl ? { src: previewUrl, area: current.area, alt: current.title } : null}
        />

        <PreTradeGuideTrigger onClick={() => setPreTradeSheetOpen(true)} />

        {analysisResult.vision.hasVisibleEvidence ? (
          <Card className="flex items-start gap-3 border-amber-200 bg-amber-50/30 p-3 mt-9 border">
            <AlertTriangle className="mt-0.5 size-6 text-semantic-warning" />
            <div className="space-y-1">
              <p className="text-caption text-muted-foreground">{DETAIL_VISUAL_NOTICE_SUMMARY}</p>
              <p className="text-caption text-muted-foreground">{DETAIL_VISUAL_NOTICE_CAUTION}</p>
              {isLowLevel ? (
                <p className="text-caption text-muted-foreground">
                  이 항목은 AI 판정 근거가 아니라 사용자가 직접 확인할 수 있는 시각적 관찰 정보입니다.
                </p>
              ) : null}
            </div>
          </Card>
        ) : null}
      </div>

      <PreTradeCheckBottomSheet
        open={preTradeSheetOpen}
        onOpenChange={setPreTradeSheetOpen}
        level={analysisResult.sightengine.level}
        suspicionDetected={analysisResult.suspicionDetected}
      />
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DetailPageContent />
    </Suspense>
  );
}
