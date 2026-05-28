'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUploadImage } from '@/src/components/providers/upload-image-provider';
import { Header, toastError } from '@/src/components/ui';
import { analyzeImage } from '@/src/lib/analysis/analyze-image';
import { getUploadErrorMessage } from '@/src/lib/upload-errors';

const STEPS = ['이미지 업로드 완료', 'AI 패턴 분석 중', '의심 영역 추정 중', '결과 생성 중'] as const;

const STEP_RANGES = [
  { start: 0, end: 25 },
  { start: 25, end: 50 },
  { start: 50, end: 75 },
  { start: 75, end: 100 },
] as const;

const CIRCLE_SIZE = 220;
const STROKE_WIDTH = 14;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ACTIVE_ITEM_TRANSITION = {
  duration: 0.42,
  ease: 'easeOut',
} as const;

const inFlightAnalysisKeys = new Set<string>();

export default function AnalyzingPage() {
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

  if (!file) return null;

  const strokeOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

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
          <div className="relative inline-flex size-[220px] items-center justify-center">
            <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} className="-rotate-90">
              <defs>
                <linearGradient id="analyzing-progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="55%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <filter id="analyzing-progress-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="#DDE8FF"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <motion.circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                stroke="url(#analyzing-progress-gradient)"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                filter="url(#analyzing-progress-glow)"
                fill="none"
              />
            </svg>
            <motion.span
              key={progress}
              initial={{ opacity: 0.3, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute text-display tracking-[-0.04em] text-primary-600"
            >
              {progress}%
            </motion.span>
          </div>
        </div>

        <div className="mt-8 space-y-4 px-2">
          {STEPS.map((step, index) => {
            const { start, end } = STEP_RANGES[index];
            const isCompleted = progress > end || progress === 100;
            const isActive = !isCompleted && progress >= start && progress <= end;
            const isPending = !isCompleted && !isActive;

            return (
              <motion.div
                key={step}
                className="flex items-center gap-3"
                initial={false}
                animate={
                  isActive
                    ? {
                        opacity: [0.35, 1],
                        y: [10, 0],
                        scale: [0.98, 1.04, 1],
                      }
                    : {
                        opacity: isPending ? 0.5 : 1,
                        y: 0,
                        scale: 1,
                      }
                }
                transition={ACTIVE_ITEM_TRANSITION}
              >
                <div className="flex size-6 items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {isCompleted ? (
                      <motion.div
                        key="completed"
                        initial={{ scale: 0.8, opacity: 0.65 }}
                        animate={{ scale: [0.8, 1.12, 1], opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="flex size-6 items-center justify-center rounded-full bg-primary-600"
                      >
                        <Check className="size-4 text-white" strokeWidth={3} />
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        key="active"
                        initial={{ scale: 0.94, opacity: 0.35 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.94, opacity: 0 }}
                        transition={{ duration: 0.36, ease: 'easeOut' }}
                        className="flex size-6 items-center justify-center rounded-full border-2 border-primary-600"
                      >
                        <LoaderCircle className="size-4 animate-spin text-primary-600" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pending"
                        initial={{ scale: 0.95, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className="size-6 rounded-full border-2 border-gray-300"
                      />
                    )}
                  </AnimatePresence>
                </div>
                <p
                  className={`text-body-sm leading-tight transition-colors duration-300 ${
                    isCompleted || isActive ? 'text-primary-600' : 'text-gray-500'
                  }`}
                >
                  {step}
                </p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-primary-100 bg-primary-100/20 px-4 py-3 text-center text-caption text-muted-foreground space-y-1">
          <p>AI 흔적을 분석하고 있습니다.</p>
          <p>분석에는 보통 3~8초 정도 소요될 수 있습니다</p>
        </div>
      </section>
    </main>
  );
}
