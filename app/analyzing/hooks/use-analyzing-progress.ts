'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { toastError } from '@/src/components/ui';
import { analyzeImage } from '@/src/lib/analysis/analyze-image';
import { getUploadErrorMessage } from '@/src/lib/upload-errors';

const FAST_PROGRESS_CAP = 95;
const FINAL_PROGRESS_CAP = 99;
const inFlightAnalyses = new Map<string, Promise<Awaited<ReturnType<typeof analyzeImage>>>>();

export function useAnalyzingProgress() {
  const router = useRouter();
  const { file, setAnalysisResult } = useUploadImage();
  const [progress, setProgress] = useState(0);
  const [waitingMessageIndex, setWaitingMessageIndex] = useState(0);
  const progressRef = useRef(0);
  const hasStartedAnalysisRef = useRef(false);
  const hasRedirectedRef = useRef(false);

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
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    progressRef.current = 0;
    setProgress(0);
    setWaitingMessageIndex(0);

    const analysisPromise = (() => {
      const existing = inFlightAnalyses.get(analysisKey);
      if (existing) return existing;

      const created = analyzeImage(file);
      inFlightAnalyses.set(analysisKey, created);
      return created;
    })();

    const scheduleProgressTick = () => {
      if (isCancelled || isAnalysisSettled) return;
      if (progressRef.current >= FINAL_PROGRESS_CAP) return;

      const isFastPhase = progressRef.current < FAST_PROGRESS_CAP;
      const delayMs = isFastPhase
        ? Math.round(80 + (progressRef.current / FAST_PROGRESS_CAP) ** 2 * 420)
        : 700;

      progressTimerId = setTimeout(() => {
        if (isCancelled || isAnalysisSettled) return;

        setProgress((prev) => {
          const cap = prev < FAST_PROGRESS_CAP ? FAST_PROGRESS_CAP : FINAL_PROGRESS_CAP;
          const remaining = cap - prev;
          if (remaining <= 0) {
            progressRef.current = cap;
            return cap;
          }

          const step = prev < FAST_PROGRESS_CAP ? Math.max(1, Math.round(remaining * 0.14)) : 1;
          const next = Math.min(cap, prev + step);
          progressRef.current = next;
          return next;
        });

        scheduleProgressTick();
      }, delayMs);
    };

    const runAnalysis = async () => {
      try {
        scheduleProgressTick();
        const result = await analysisPromise;
        if (isCancelled) return;

        isAnalysisSettled = true;
        if (progressTimerId) clearTimeout(progressTimerId);
        progressRef.current = 100;
        setProgress(100);
        setAnalysisResult(result);
        shouldPreserveStartedRef = true;
        timeoutId = setTimeout(() => router.push('/result'), 500);
      } catch (error) {
        if (isCancelled) return;
        isAnalysisSettled = true;
        if (progressTimerId) clearTimeout(progressTimerId);
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
      if (timeoutId) clearTimeout(timeoutId);
      if (!shouldPreserveStartedRef) {
        hasStartedAnalysisRef.current = false;
      }
    };
  }, [file, router, setAnalysisResult]);

  const isFinalizing = progress >= FAST_PROGRESS_CAP && progress < 100;

  useEffect(() => {
    if (!isFinalizing) return;

    const waitingMessageTimer = setInterval(() => {
      setWaitingMessageIndex((prev) => (prev + 1) % 3);
    }, 1800);

    return () => clearInterval(waitingMessageTimer);
  }, [isFinalizing]);

  return { file, progress, isFinalizing, waitingMessageIndex };
}
