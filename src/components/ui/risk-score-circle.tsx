'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/src/lib/cn';
import { getRoundCapAdjustedArcPercent } from '@/src/lib/circular-progress';
import {
  clampAiScore,
  deriveRiskLevel,
  getRiskGaugeGradient,
  type RiskLevel,
} from '@/src/lib/risk-styles';

type RiskScoreCircleSize = 'sm' | 'md' | 'lg';

interface RiskScoreCircleProps {
  /** Sightengine AI 생성 가능성 (0~100) — progress */
  score: number;
  /** 위험도 단계 — 게이지 색상 (미지정 시 score에서 파생) */
  level?: RiskLevel;
  size?: RiskScoreCircleSize;
  /** 원 중앙 퍼센트 표시 (기본: true) */
  showScore?: boolean;
  className?: string;
}

const SIZE_CONFIG: Record<
  RiskScoreCircleSize,
  { diameter: number; strokeWidth: number; valueClass: string; percentClass: string }
> = {
  sm: {
    diameter: 64,
    strokeWidth: 6,
    valueClass: 'text-xl font-bold',
    percentClass: 'text-body-sm font-bold',
  },
  md: {
    diameter: 96,
    strokeWidth: 8,
    valueClass: 'text-3xl font-bold',
    percentClass: 'text-lg font-bold',
  },
  lg: {
    diameter: 132,
    strokeWidth: 10,
    valueClass: 'text-[2.75rem] font-bold',
    percentClass: 'text-xl font-bold',
  },
};

export function RiskScoreCircle({
  score,
  level: levelProp,
  size = 'md',
  showScore = true,
  className,
}: RiskScoreCircleProps) {
  const normalizedScore = clampAiScore(score);
  const level = levelProp ?? deriveRiskLevel(normalizedScore);
  const { diameter, strokeWidth, valueClass, percentClass } = SIZE_CONFIG[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const visualProgress = getRoundCapAdjustedArcPercent(normalizedScore, circumference, strokeWidth);
  const dashOffset = circumference - (visualProgress / 100) * circumference;
  const gaugeGradient = getRiskGaugeGradient(level);
  const reactId = useId().replace(/:/g, '');
  const gradientId = `risk-gauge-gradient-${reactId}`;

  return (
    <div
      role="img"
      aria-label={`AI 생성 가능성 ${normalizedScore}%`}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: diameter, height: diameter }}
    >
      <svg width={diameter} height={diameter} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gaugeGradient.stops.map((stop) => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={gaugeGradient.trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          strokeDasharray={circumference}
        />
      </svg>
      {showScore ? (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <span className={cn('flex items-baseline justify-center leading-none tracking-[-0.03em] text-foreground')}>
            <span className={cn('tabular-nums', valueClass)}>{normalizedScore}</span>
            <span className={cn('ml-0.5 -translate-y-0.5', percentClass)}>%</span>
          </span>
        </motion.div>
      ) : null}
    </div>
  );
}
