'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { toastError } from '@/src/components/ui';
import { analyzeImage } from '@/src/lib/analysis/analyze-image';
import { getUploadErrorMessage } from '@/src/lib/upload-errors';

const inFlightAnalysisKeys = new Set<string>();

export function useAnalyzingProgress() {
  const router = useRouter();
  const { file, setAnalysisResult } = useUploadImage();
  const [progress, setProgress] = useState(0);
  const hasStartedAnalysisRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (file || hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    router.replace('/');
  }, [file, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 100 || !file || hasStartedAnalysisRef.current) return;

    hasStartedAnalysisRef.current = true;
    const analysisKey = `${file.name}:${file.size}:${file.lastModified}:${file.type}`;
    if (inFlightAnalysisKeys.has(analysisKey)) return;
    inFlightAnalysisKeys.add(analysisKey);

    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const runAnalysis = async () => {
      try {
        const result = await analyzeImage(file);
        if (isCancelled) return;

        setAnalysisResult(result);
        timeoutId = setTimeout(() => router.push('/result'), 500);
      } catch (error) {
        if (isCancelled) return;
        console.error('analyzeImage failed:', error);
        const toastMessage =
          error instanceof TypeError
            ? getUploadErrorMessage('NETWORK_UNSTABLE')
            : getUploadErrorMessage('ANALYSIS_FAILED');
        toastError(toastMessage);
        setAnalysisResult(null);
        router.replace('/');
      } finally {
        inFlightAnalysisKeys.delete(analysisKey);
      }
    };

    void runAnalysis();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [file, progress, router, setAnalysisResult]);

  return { file, progress };
}
