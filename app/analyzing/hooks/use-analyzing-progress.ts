'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { toastError } from '@/src/components/ui';
import { analyzeImage } from '@/src/lib/analysis/analyze-image';
import { getUploadErrorMessage } from '@/src/lib/upload-errors';
import {
  buildCompletionProgressSteps,
  computeAnalyzingProgressTick,
  getAnalyzingStep,
  getCompletionStepDelayMs,
  getNextProgressValue,
  type AnalyzingStep,
} from '../lib/analyzing-progress-tick';

const REDIRECT_AFTER_COMPLETE_MS = 500;

const inFlightAnalyses = new Map<string, Promise<Awaited<ReturnType<typeof analyzeImage>>>>();

function advanceProgressThroughSteps(
  from: number,
  onUpdate: (value: number) => void,
): { promise: Promise<void>; cancel: () => void } {
  const steps = buildCompletionProgressSteps(from);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let cancelled = false;
  let resolvePromise: (() => void) | undefined;

  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve;

    const runStep = (index: number) => {
      if (cancelled || index >= steps.length) {
        resolve();
        return;
      }

      timeoutId = setTimeout(() => {
        if (cancelled) {
          resolve();
          return;
        }

        onUpdate(steps[index]);
        runStep(index + 1);
      }, getCompletionStepDelayMs(index, steps.length));
    };

    runStep(0);
  });

  return {
    promise,
    cancel: () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      resolvePromise?.();
    },
  };
}

export type { AnalyzingStep };

export function useAnalyzingProgress() {
  const router = useRouter();
  const { file, setAnalysisResult } = useUploadImage();
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const hasStartedAnalysisRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  const currentStep = useMemo(() => getAnalyzingStep(progress), [progress]);

  useEffect(() => {
    if (file || hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    router.replace('/');
  }, [file, router]);

  useEffect(() => {
    if (!file || hasStartedAnalysisRef.current) return;

    hasStartedAnalysisRef.current = true;
    const analysisKey = `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
    let isCancelled = false;
    let isAnalysisSettled = false;
    let shouldPreserveStartedRef = false;
    let progressTimerId: ReturnType<typeof setTimeout> | undefined;
    let redirectTimerId: ReturnType<typeof setTimeout> | undefined;
    let cancelCompletionProgress: (() => void) | undefined;
    progressRef.current = 0;
    setProgress(0);

    const analysisPromise = (() => {
      const existing = inFlightAnalyses.get(analysisKey);
      if (existing) return existing;

      const created = analyzeImage(file);
      inFlightAnalyses.set(analysisKey, created);
      return created;
    })();

    const scheduleProgressTick = () => {
      if (isCancelled || isAnalysisSettled) return;

      const tick = computeAnalyzingProgressTick(progressRef.current);
      if (!tick) return;

      progressTimerId = setTimeout(() => {
        if (isCancelled || isAnalysisSettled) return;

        const next = getNextProgressValue(progressRef.current, tick.increment);
        progressRef.current = next;
        setProgress(next);

        scheduleProgressTick();
      }, tick.delayMs);
    };

    const runAnalysis = async () => {
      try {
        scheduleProgressTick();
        const result = await analysisPromise;
        if (isCancelled) return;

        isAnalysisSettled = true;
        if (progressTimerId) clearTimeout(progressTimerId);

        const completion = advanceProgressThroughSteps(progressRef.current, (value) => {
          progressRef.current = value;
          setProgress(value);
        });
        cancelCompletionProgress = completion.cancel;

        await completion.promise;
        if (isCancelled) return;

        setAnalysisResult(result);
        shouldPreserveStartedRef = true;
        redirectTimerId = setTimeout(() => router.push('/result'), REDIRECT_AFTER_COMPLETE_MS);
      } catch (error) {
        if (isCancelled) return;
        isAnalysisSettled = true;
        if (progressTimerId) clearTimeout(progressTimerId);
        if (cancelCompletionProgress) cancelCompletionProgress();
        console.error('analyzeImage failed:', error);
        const toastMessage =
          error instanceof TypeError
            ? getUploadErrorMessage('NETWORK_UNSTABLE')
            : getUploadErrorMessage('ANALYSIS_FAILED');
        toastError(toastMessage);
        setAnalysisResult(null);
        router.replace('/');
      } finally {
        if (inFlightAnalyses.get(analysisKey) === analysisPromise) {
          inFlightAnalyses.delete(analysisKey);
        }
      }
    };

    void runAnalysis();

    return () => {
      isCancelled = true;
      isAnalysisSettled = true;
      if (progressTimerId) clearTimeout(progressTimerId);
      if (redirectTimerId) clearTimeout(redirectTimerId);
      if (cancelCompletionProgress) cancelCompletionProgress();
      if (!shouldPreserveStartedRef) {
        hasStartedAnalysisRef.current = false;
      }
    };
  }, [file, router, setAnalysisResult]);

  return { file, progress, currentStep };
}
