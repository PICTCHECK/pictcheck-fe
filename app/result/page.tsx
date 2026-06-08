'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CircleCheck, ImageIcon, Lock, ScanSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { AnalysisCard, Button, Card, Header, MultilineText, ResultSummaryCard } from '@/src/components/ui';
import {
  formatSuspicionCountLabel,
  getPictcheckResultDisplay,
  getPictcheckSuspicionEmptyState,
  getRiskStyles,
  getVisionSectionDisplay,
  type PictcheckSuspicionEmptyState,
  type RiskLevel,
} from '@/src/lib/risk-styles';
import { cn } from '@/src/lib/cn';
import { applyResultPageTestOverrides } from './constants/result-page-test-cases';

type SuspicionListProps = {
  level: RiskLevel;
  showSuspicions: boolean;
  suspicions: PictcheckAnalysisResult['vision']['suspicions'];
  previewUrl: string | null;
  emptyState: PictcheckSuspicionEmptyState;
};

function SuspicionList({ level, showSuspicions, suspicions, previewUrl, emptyState }: SuspicionListProps) {
  const router = useRouter();

  if (!showSuspicions) {
    return <SuspicionEmptyState level={level} emptyState={emptyState} />;
  }

  return (
    <>
      {suspicions.map((item) => (
        <AnalysisCard
          key={item.id}
          title={item.title}
          description={item.description}
          confidence={item.evidenceStrength}
          thumbnail={previewUrl ? { src: previewUrl, area: item.area, alt: item.title } : null}
          onClick={() => router.push(`/detail?suspicion=${encodeURIComponent(item.id)}`)}
        />
      ))}
    </>
  );
}

function SuspicionEmptyState({
  level,
  emptyState,
}: {
  level: RiskLevel;
  emptyState: PictcheckSuspicionEmptyState;
}) {
  const riskStyles = getRiskStyles(level);

  return (
    <Card className={cn('flex flex-col items-center gap-3 px-4 py-8 text-center', riskStyles.card)}>
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          level === 'low' ? 'bg-emerald-100' : level === 'medium' ? 'bg-orange-100' : 'bg-red-100',
        )}
      >
        {level === 'low' ? (
          <CircleCheck className={cn('size-6', riskStyles.title)} aria-hidden />
        ) : (
          <ScanSearch className={cn('size-6', riskStyles.title)} aria-hidden />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-body-md font-semibold tracking-[-0.02em]">{emptyState.title}</p>
        <p className="text-body-sm leading-relaxed text-muted-foreground">
          <MultilineText copy={emptyState.description} />
        </p>
      </div>
    </Card>
  );
}

export default function Page() {
  const router = useRouter();
  const { previewUrl, analysisResult, clearFile } = useUploadImage();
  useEffect(() => {
    if (!analysisResult) router.replace('/');
  }, [analysisResult, router]);

  if (!analysisResult) return null;

  const {
    score,
    level,
    suspicionDetected,
    suspicions: visionSuspicions,
  } = applyResultPageTestOverrides({
    score: analysisResult.sightengine.score,
    level: analysisResult.sightengine.level,
    suspicionDetected: analysisResult.suspicionDetected,
    suspicions: analysisResult.vision.suspicions,
  });
  const resultDisplay = getPictcheckResultDisplay(level, suspicionDetected);
  const suspicions = resultDisplay.showSuspicions ? visionSuspicions : [];
  const suspicionEmptyState = getPictcheckSuspicionEmptyState(level);
  const visionSectionDisplay = getVisionSectionDisplay(level);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header title="분석 결과" />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <p className="text-center text-body-sm text-muted-foreground">거래 전 확인 결과 요약</p>

        <ResultSummaryCard
          score={score}
          level={level}
          statusLabel={resultDisplay.statusLabel}
          summary={resultDisplay.summary}
        />

        <div className="flex items-center justify-between px-1">
          <h2 className="text-body-md font-semibold tracking-[-0.02em]">{visionSectionDisplay.title}</h2>
          <p className="text-body-sm text-muted-foreground">
            {formatSuspicionCountLabel(suspicions.length, resultDisplay.showSuspicions)}
          </p>
        </div>

        <SuspicionList
          level={level}
          showSuspicions={resultDisplay.showSuspicions}
          suspicions={suspicions}
          previewUrl={previewUrl}
          emptyState={suspicionEmptyState}
        />

        {resultDisplay.showSuspicions && suspicions.length > 0 ? (
          <Link href="/detail" className="block">
            <Button variant="tertiary" size="lg" className="h-12 w-full">
              {visionSectionDisplay.detailButtonLabel}
            </Button>
          </Link>
        ) : null}

        <Button
          size="lg"
          className="h-12 w-full"
          onClick={() => {
            clearFile();
            router.push('/');
          }}
        >
          <ImageIcon className="size-4" />
          다른 이미지 분석
        </Button>

        <p className="flex items-center justify-center gap-2 pt-2 text-caption text-muted-foreground">
          <Lock className="size-3.5" />
          분석 결과는 참고용이며, 100% 확실하지 않을 수 있습니다.
        </p>
      </div>
    </main>
  );
}
