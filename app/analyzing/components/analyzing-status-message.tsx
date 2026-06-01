'use client';

import { useEffect, useState } from 'react';
import {
  ANALYZING_STEP_MESSAGE_VARIANTS,
  ANALYZING_STEP_SECONDARY_MESSAGE,
} from '../constants/analyzing-status';
import type { AnalyzingStep } from '../lib/analyzing-progress-tick';

const MESSAGE_ROTATION_MS_BY_STEP: Record<AnalyzingStep, number> = {
  preparing: 2400,
  detecting: 2600,
  inspecting: 2800,
  finalizing: 2000,
};

type Props = {
  currentStep: AnalyzingStep;
};

export function AnalyzingStatusMessage({ currentStep }: Props) {
  const [variantIndex, setVariantIndex] = useState(0);
  const variants = ANALYZING_STEP_MESSAGE_VARIANTS[currentStep];
  const primaryMessage = variants[variantIndex % variants.length];
  const secondaryMessage = ANALYZING_STEP_SECONDARY_MESSAGE[currentStep];
  const showPulse = currentStep === 'inspecting' || currentStep === 'finalizing';

  useEffect(() => {
    if (variants.length <= 1) return;

    const intervalMs = MESSAGE_ROTATION_MS_BY_STEP[currentStep];
    const timerId = setInterval(() => {
      setVariantIndex((prev) => (prev + 1) % variants.length);
    }, intervalMs);

    return () => clearInterval(timerId);
  }, [currentStep, variants.length]);

  return (
    <div className="mt-12 space-y-1 rounded-2xl border border-primary-100 bg-primary-100/20 px-4 py-3 text-center text-caption text-muted-foreground">
      <p>{primaryMessage}</p>
      <p>{secondaryMessage}</p>
      {showPulse ? (
        <div className="flex items-center justify-center gap-1 pt-1" aria-label="로딩 중">
          <span className="size-1.5 rounded-full bg-primary-500/70 animate-pulse" />
          <span className="size-1.5 rounded-full bg-primary-500/70 animate-pulse [animation-delay:160ms]" />
          <span className="size-1.5 rounded-full bg-primary-500/70 animate-pulse [animation-delay:320ms]" />
        </div>
      ) : null}
    </div>
  );
}
