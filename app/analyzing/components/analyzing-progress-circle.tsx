'use client';

import { motion } from 'framer-motion';
import { getRoundCapAdjustedArcPercent } from '@/src/lib/circular-progress';
import { CIRCLE_SIZE, CIRCUMFERENCE, RADIUS, STROKE_WIDTH } from '../constants/analyzing.constants';

export function AnalyzingProgressCircle({ progress }: { progress: number }) {
  const visualArcProgress = getRoundCapAdjustedArcPercent(progress, CIRCUMFERENCE, STROKE_WIDTH);
  const strokeOffset = CIRCUMFERENCE - (visualArcProgress / 100) * CIRCUMFERENCE;

  return (
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
          transition={{ duration: 0.35, ease: 'easeOut' }}
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
  );
}
