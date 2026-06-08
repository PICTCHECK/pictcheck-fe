'use client';

import { Header } from '@/src/components/ui';
import { AnalyzingProgressCircle } from './components/analyzing-progress-circle';
import { AnalyzingStatusMessage } from './components/analyzing-status-message';
import { AnalyzingStepList } from './components/analyzing-step-list';
import { useAnalyzingProgress } from './hooks/use-analyzing-progress';

export default function Page() {
  const { file, progress } = useAnalyzingProgress();

  if (!file) return null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[390px] bg-background">
      <Header title="분석 중" showBackButton />
      <section className="px-4 pb-8 pt-8">
        <h1 className="text-center text-title-lg font-semibold leading-tight tracking-[-0.03em]">
          AI 모델이 이미지를
          <br />
          분석하고 있어요.
        </h1>

        <div className="mt-8 flex justify-center">
          <AnalyzingProgressCircle progress={progress} />
        </div>

        <AnalyzingStepList progress={progress} />
        <AnalyzingStatusMessage />
      </section>
    </main>
  );
}
