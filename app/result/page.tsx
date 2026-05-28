'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ImageIcon, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { Button, Header, ResultSummaryCard } from '@/src/components/ui';
import {
  formatSuspicionCountLabel,
  getPictcheckResultDisplay,
  getPictcheckSuspicionEmptyState,
  getVisionSectionDisplay,
} from '@/src/lib/risk-styles';
import { SuspicionList } from './components/suspicion-list';

export default function Page() {
  const router = useRouter();
  const { previewUrl, analysisResult, clearFile } = useUploadImage();

  useEffect(() => {
    if (!analysisResult) router.replace('/');
  }, [analysisResult, router]);

  if (!analysisResult) return null;

  const score = analysisResult.sightengine.score;
  const level = analysisResult.sightengine.level;
  const resultDisplay = getPictcheckResultDisplay(level, analysisResult.suspicionDetected);
  const suspicions = resultDisplay.showSuspicions ? analysisResult.vision.suspicions : [];
  const suspicionEmptyState = getPictcheckSuspicionEmptyState(level);
  const visionSectionDisplay = getVisionSectionDisplay(level);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header title="분석 결과" />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <p className="text-center text-body-sm text-muted-foreground">AI 생성 가능성 결과 및 시각 관찰 요약</p>

        <ResultSummaryCard
          score={score}
          level={level}
          statusLabel={resultDisplay.statusLabel}
          statusSuffix={resultDisplay.statusSuffix}
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
