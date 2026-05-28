"use client";

import { motion } from "framer-motion";
import { cn } from "@/src/lib/cn";
import {
  clampAiScore,
  deriveRiskLevel,
  getRiskStyles,
  type RiskLevel,
} from "@/src/lib/risk-styles";

type RiskScoreCircleSize = "sm" | "md" | "lg";

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
    strokeWidth: 5,
    valueClass: "text-xl font-bold",
    percentClass: "text-body-sm font-bold",
  },
  md: {
    diameter: 96,
    strokeWidth: 6,
    valueClass: "text-3xl font-bold",
    percentClass: "text-lg font-bold",
  },
  lg: {
    diameter: 132,
    strokeWidth: 7,
    valueClass: "text-[2.75rem] font-bold",
    percentClass: "text-xl font-bold",
  },
};

export function RiskScoreCircle({
  score,
  level: levelProp,
  size = "md",
  showScore = true,
  className,
}: RiskScoreCircleProps) {
  const normalizedScore = clampAiScore(score);
  const level = levelProp ?? deriveRiskLevel(normalizedScore);
  const { diameter, strokeWidth, valueClass, percentClass } = SIZE_CONFIG[size];
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalizedScore / 100) * circumference;
  const riskStyles = getRiskStyles(level);

  return (
    <div
      role="img"
      aria-label={`AI 생성 가능성 ${normalizedScore}%`}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: diameter, height: diameter }}
    >
      <svg width={diameter} height={diameter} className="-rotate-90" aria-hidden>
        <circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          className={riskStyles.gaugeTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={diameter / 2}
          cy={diameter / 2}
          r={radius}
          className={riskStyles.gaugeStroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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
          <span
            className={cn(
              "flex items-baseline justify-center leading-none tracking-[-0.03em] text-foreground",
            )}
          >
            <span className={cn("tabular-nums", valueClass)}>{normalizedScore}</span>
            <span className={cn("ml-0.5 -translate-y-0.5", percentClass)}>%</span>
          </span>
        </motion.div>
      ) : null}
    </div>
  );
}
