'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CircleCheck, ImageIcon, Lock, ScanSearch } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { Badge, Button, Card, Header, ResultSummaryCard, SuspicionThumbnail } from '@/src/components/ui';
import { cn } from '@/src/lib/cn';
import {
  formatSuspicionCountLabel,
  getPictcheckResultDisplay,
  getPictcheckSuspicionEmptyState,
  getRiskStyles,
  type PictcheckSuspicionEmptyState,
  type RiskLevel,
} from '@/src/lib/risk-styles';

function SuspicionEmptyState({ level, emptyState }: { level: RiskLevel; emptyState: PictcheckSuspicionEmptyState }) {
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
        <p className="text-body-sm leading-relaxed text-muted-foreground">{emptyState.description}</p>
      </div>
    </Card>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const { previewUrl, analysisResult, clearFile } = useUploadImage();

  useEffect(() => {
    if (!analysisResult) router.replace('/');
  }, [analysisResult, router]);

  if (!analysisResult) {
    return null;
  }

  const analysis = analysisResult;
  const score = analysis.sightengine.score;
  const level = analysis.sightengine.level;
  const resultDisplay = getPictcheckResultDisplay(level, analysis.suspicionDetected);
  const suspicions = resultDisplay.showSuspicions ? analysis.vision.suspicions : [];
  const suspicionEmptyState = getPictcheckSuspicionEmptyState(level);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header title="분석 결과" showBackButton />
      <div className="space-y-4 px-4 pb-8 pt-4">
        <p className="text-center text-body-sm text-muted-foreground">AI 생성 가능성 결과 및 핵심 요약</p>

        <ResultSummaryCard
          score={score}
          level={level}
          statusLabel={resultDisplay.statusLabel}
          statusSuffix={resultDisplay.statusSuffix}
          summary={resultDisplay.summary}
        />

        <div className="flex items-center justify-between px-1">
          <h2 className="text-body-md font-semibold tracking-[-0.02em]">핵심 의심 요소</h2>
          <p className="text-body-sm text-muted-foreground">
            {formatSuspicionCountLabel(suspicions.length, resultDisplay.showSuspicions)}
          </p>
        </div>

        {resultDisplay.showSuspicions ? (
          suspicions.map((item) => {
            const itemRisk = getRiskStyles(item.riskLevel);
            return (
              <Card key={item.id} className="flex gap-3 p-3">
                {previewUrl ? (
                  <SuspicionThumbnail src={previewUrl} alt={item.title} area={item.area} size="sm" />
                ) : (
                  <div className="size-24 shrink-0 rounded-xl bg-gray-100" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-body-md font-semibold leading-tight">{item.title}</p>
                    <Badge variant={itemRisk.badgeVariant}>{itemRisk.label}</Badge>
                  </div>
                  <p className="pt-1 text-body-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Card>
            );
          })
        ) : (
          <SuspicionEmptyState level={level} emptyState={suspicionEmptyState} />
        )}

        {resultDisplay.showSuspicions && suspicions.length > 0 ? (
          <Link href="/detail" className="block">
            <Button variant="tertiary" size="lg" className="h-12 w-full">
              AI 의심 영역 자세히 보기 →
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
