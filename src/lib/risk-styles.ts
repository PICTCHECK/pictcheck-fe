export type RiskLevel = 'high' | 'medium' | 'low';

/** 픽트체크 level 구간 (Sightengine score → semantic level) */
export const RISK_LEVEL_THRESHOLDS = {
  lowMax: 39,
  mediumMax: 69,
} as const;

/** Sightengine score + 픽트체크 level 해석 (UI 테마는 level, 표시·progress는 score) */
export interface AiGenerationResult {
  /** Sightengine AI 생성 가능성 퍼센트 (0~100) — 정량 수치 */
  score: number;
  /** Sightengine 기반 위험도 단계 — semantic color·카드 테마 */
  level: RiskLevel;
}

export interface PictcheckResultDisplay {
  /** 결과 카드 제목 (예: AI 가능성 높음 · 의심 요소 확인) */
  statusLabel: string;
  /** 결과 설명 본문 */
  summary: string;
  /** OpenAI Vision 시각적 관찰 목록·상세 분석 노출 여부 */
  showSuspicions: boolean;
}

export interface PictcheckSuspicionEmptyState {
  title: string;
  description: string;
}

export interface VisionSectionDisplay {
  title: string;
  detailButtonLabel: string;
  countLabelWhenEmpty: string;
}

export type RiskBadgeVariant = 'riskHigh' | 'riskMedium' | 'riskLow';

export interface RiskStyleTokens {
  card: string;
  title: string;
  score: string;
  gaugeTrack: string;
  gaugeStroke: string;
  badgeVariant: RiskBadgeVariant;
  label: string;
}

const RISK_STYLE_MAP: Record<RiskLevel, RiskStyleTokens> = {
  high: {
    card: 'border-red-200 bg-red-50/40',
    title: 'text-red-500',
    score: 'text-red-500',
    gaugeTrack: 'stroke-red-100',
    gaugeStroke: 'stroke-red-500',
    badgeVariant: 'riskHigh',
    label: '높음',
  },
  medium: {
    card: 'border-orange-200 bg-orange-50/40',
    title: 'text-orange-500',
    score: 'text-orange-500',
    gaugeTrack: 'stroke-orange-100',
    gaugeStroke: 'stroke-orange-500',
    badgeVariant: 'riskMedium',
    label: '보통',
  },
  low: {
    card: 'border-emerald-200 bg-emerald-50/40',
    title: 'text-emerald-500',
    score: 'text-emerald-500',
    gaugeTrack: 'stroke-emerald-100',
    gaugeStroke: 'stroke-emerald-500',
    badgeVariant: 'riskLow',
    label: '낮음',
  },
};

export function getRiskStyles(level: RiskLevel): RiskStyleTokens {
  return RISK_STYLE_MAP[level];
}

export function clampAiScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

/**
 * Sightengine score(0~100) → 픽트체크 semantic level
 * - 0~39: low
 * - 40~69: medium
 * - 70~100: high
 */
export function deriveRiskLevel(score: number): RiskLevel {
  const normalized = clampAiScore(score);
  if (normalized <= RISK_LEVEL_THRESHOLDS.lowMax) return 'low';
  if (normalized <= RISK_LEVEL_THRESHOLDS.mediumMax) return 'medium';
  return 'high';
}

/** Sightengine score만으로 결과 객체 생성 (level은 내부 기준으로 파생) */
export function createAiGenerationResult(rawScore: number): AiGenerationResult {
  const score = clampAiScore(rawScore);
  return { score, level: deriveRiskLevel(score) };
}

const PICTCHECK_RESULT_DISPLAY: Record<RiskLevel, Record<'true' | 'false', PictcheckResultDisplay>> = {
  high: {
    true: {
      statusLabel: 'AI 가능성 높음 · 의심 요소 확인',
      summary:
        '외부 탐지 기준 AI 생성 가능성이 높게 분석되었습니다. 이미지에서도 AI 생성 이미지에서 자주 나타나는 의심 요소가 확인되었습니다.',
      showSuspicions: true,
    },
    false: {
      statusLabel: 'AI 가능성 높음 · 근거 확인 어려움',
      summary:
        '외부 탐지 기준 AI 생성 가능성이 높게 분석되었습니다. 다만 사람이 눈으로 확인할 수 있는 뚜렷한 의심 요소는 제한적입니다.',
      showSuspicions: false,
    },
  },
  medium: {
    true: {
      statusLabel: 'AI 가능성 보통 · 의심 요소 확인',
      summary:
        '외부 탐지 기준 AI 생성 가능성이 보통 수준으로 분석되었습니다. 이미지 일부에서 AI 생성 이미지에서 자주 나타나는 의심 요소가 확인되었습니다.',
      showSuspicions: true,
    },
    false: {
      statusLabel: 'AI 가능성 보통 · 근거 확인 어려움',
      summary:
        '외부 탐지 기준 AI 생성 가능성은 보통 수준입니다. 다만 사람이 눈으로 확인할 수 있는 뚜렷한 의심 요소는 제한적입니다.',
      showSuspicions: false,
    },
  },
  low: {
    true: {
      statusLabel: 'AI 가능성 낮음 · 참고 요소 발견',
      summary:
        '외부 탐지 기준 AI 생성 가능성은 낮게 분석되었습니다. 다만 일부 영역에서 참고할 만한 시각적 요소가 발견되어 함께 표시했습니다.',
      showSuspicions: true,
    },
    false: {
      statusLabel: 'AI 가능성 낮음',
      summary:
        '외부 탐지 기준 AI 생성 가능성이 낮게 분석되었습니다. 이미지에서도 뚜렷한 의심 요소는 확인되지 않았습니다.',
      showSuspicions: false,
    },
  },
};

/** level + suspicionDetected 조합으로 픽트체크 결과 상태·설명 반환 */
export function getPictcheckResultDisplay(level: RiskLevel, suspicionDetected: boolean): PictcheckResultDisplay {
  return PICTCHECK_RESULT_DISPLAY[level][suspicionDetected ? 'true' : 'false'];
}

/** 시각적 관찰 포인트 미노출 시 빈 상태 (level별 톤·문구) */
const PICTCHECK_SUSPICION_EMPTY: Record<RiskLevel, PictcheckSuspicionEmptyState> = {
  high: {
    title: '시각적 특징이 제한적이에요',
    description:
      '외부 탐지 기준으로는 AI 생성 가능성이 높지만, 사람이 눈으로 확인할 수 있는 시각적 특징은 제한적입니다.',
  },
  medium: {
    title: '뚜렷한 시각 특징이 없어요',
    description: '외부 탐지 기준은 보통 수준이며, 이미지에서 사람이 확인할 만한 시각적 특징은 제한적입니다.',
  },
  low: {
    title: '참고할 시각 특징이 거의 없어요',
    description: '외부 탐지 기준으로는 AI 생성 가능성이 낮게 분석되었습니다.',
  },
};

export function getPictcheckSuspicionEmptyState(level: RiskLevel): PictcheckSuspicionEmptyState {
  return PICTCHECK_SUSPICION_EMPTY[level];
}

export function formatSuspicionCountLabel(count: number, showSuspicions: boolean): string {
  if (!showSuspicions) return '표시 없음';
  return `${count}개 표시`;
}

export function getVisionSectionDisplay(level: RiskLevel): VisionSectionDisplay {
  if (level === 'low') {
    return {
      title: '참고할 만한 시각적 특징',
      detailButtonLabel: '관찰 영역 자세히 보기 →',
      countLabelWhenEmpty: '표시 없음',
    };
  }

  return {
    title: '의심 요소',
    detailButtonLabel: '의심 요소 자세히 보기 →',
    countLabelWhenEmpty: '표시 없음',
  };
}
