export const PROGRESS_PREPARING_END = 35;
export const PROGRESS_DETECTING_END = 70;
/** UI 단계(inspecting → finalizing) 전환 기준 */
export const PROGRESS_INSPECTING_END = 95;
/** API 완료 전 자연 감속으로 도달하는 상한 (100%는 완료 시에만) */
export const MAX_PROGRESS_BEFORE_COMPLETE = 99;

export type AnalyzingStep = 'preparing' | 'detecting' | 'inspecting' | 'finalizing';

export type ProgressTick = {
  delayMs: number;
  increment: number;
};

const FINALIZING_CRAWL_START = PROGRESS_INSPECTING_END;

export function getAnalyzingStep(progress: number): AnalyzingStep {
  if (progress >= PROGRESS_INSPECTING_END) return 'finalizing';
  if (progress >= PROGRESS_DETECTING_END) return 'inspecting';
  if (progress >= PROGRESS_PREPARING_END) return 'detecting';
  return 'preparing';
}

/**
 * 초반 빠름 → 중반 안정 → 후반 완만한 감속 → 95~99%는 끊김 없이 서서히 진행.
 */
export function computeAnalyzingProgressTick(currentProgress: number): ProgressTick | null {
  if (currentProgress >= MAX_PROGRESS_BEFORE_COMPLETE) return null;

  if (currentProgress < PROGRESS_PREPARING_END) {
    const phaseRatio = currentProgress / PROGRESS_PREPARING_END;
    const remaining = PROGRESS_PREPARING_END - currentProgress;
    return {
      delayMs: Math.round(28 + phaseRatio * 22),
      increment: Math.max(2, Math.round(remaining * 0.17 + 1.5)),
    };
  }

  if (currentProgress < PROGRESS_DETECTING_END) {
    const phaseSpan = PROGRESS_DETECTING_END - PROGRESS_PREPARING_END;
    const phaseRatio = (currentProgress - PROGRESS_PREPARING_END) / phaseSpan;
    const remaining = PROGRESS_DETECTING_END - currentProgress;
    return {
      delayMs: Math.round(130 + phaseRatio * 65),
      increment: Math.max(1, Math.round(remaining * 0.08 + 0.8)),
    };
  }

  if (currentProgress < FINALIZING_CRAWL_START) {
    const phaseSpan = FINALIZING_CRAWL_START - PROGRESS_DETECTING_END;
    const phaseRatio = (currentProgress - PROGRESS_DETECTING_END) / phaseSpan;
    const remaining = FINALIZING_CRAWL_START - currentProgress;
    return {
      delayMs: Math.round(170 + phaseRatio * 200),
      increment: Math.max(1, Math.round(remaining * (0.08 - phaseRatio * 0.04) + 0.5)),
    };
  }

  const crawlSpan = MAX_PROGRESS_BEFORE_COMPLETE - FINALIZING_CRAWL_START;
  const crawlRatio = (currentProgress - FINALIZING_CRAWL_START) / crawlSpan;
  return {
    delayMs: Math.round(420 + crawlRatio * 380),
    increment: 1,
  };
}

export function getNextProgressValue(currentProgress: number, increment: number): number {
  return Math.min(MAX_PROGRESS_BEFORE_COMPLETE, currentProgress + increment);
}

/** 분석 완료 후에도 기존 tick 리듬으로 100%까지 이어지도록 중간 값 생성 */
export function buildCompletionProgressSteps(from: number): number[] {
  const start = Math.min(from, MAX_PROGRESS_BEFORE_COMPLETE);
  const gap = 100 - start;
  if (gap <= 0) return [100];

  const stepCount = Math.min(5, Math.max(2, Math.ceil(gap / 2)));
  const steps: number[] = [];

  for (let i = 1; i <= stepCount; i++) {
    steps.push(Math.min(100, Math.round(start + (gap * i) / stepCount)));
  }

  if (steps[steps.length - 1] !== 100) {
    steps.push(100);
  }

  return steps.filter((value, index, array) => index === 0 || value > array[index - 1]);
}

export function getCompletionStepDelayMs(stepIndex: number, totalSteps: number): number {
  const progressThrough = totalSteps <= 1 ? 1 : (stepIndex + 1) / totalSteps;
  return Math.round(200 + progressThrough * 180);
}
