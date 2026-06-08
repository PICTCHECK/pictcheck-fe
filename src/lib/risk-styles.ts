import type { MultilineCopy } from '@/src/lib/multiline-copy';

export type RiskLevel = 'high' | 'medium' | 'low';

/** 픽트체크 level 구간 (Sightengine score → semantic level) */
export const RISK_LEVEL_THRESHOLDS = {
  lowMax: 39,
  mediumMax: 69,
} as const;

export interface PictcheckResultDisplay {
  /** 결과 카드 제목 (예: AI 가능성 높음 · 의심 요소 확인) */
  statusLabel: string;
  /** 결과 설명 본문 */
  summary: MultilineCopy;
  /** OpenAI Vision 시각적 관찰 목록·상세 분석 노출 여부 */
  showSuspicions: boolean;
}

export interface PictcheckSuspicionEmptyState {
  title: string;
  description: MultilineCopy;
}

export interface VisionSectionDisplay {
  title: string;
  detailButtonLabel: string;
  countLabelWhenEmpty: string;
}

export type RiskBadgeVariant = 'riskHigh' | 'riskMedium' | 'riskLow';

export interface RiskGaugeGradientStop {
  offset: string;
  color: string;
}

/** 결과 원형 게이지 — 분석 중 프로그레스와 같은 3단 그라데이션 */
export interface RiskGaugeGradient {
  trackColor: string;
  stops: readonly RiskGaugeGradientStop[];
}

const RISK_GAUGE_GRADIENT_MAP: Record<RiskLevel, RiskGaugeGradient> = {
  high: {
    trackColor: '#FFE9EC',
    stops: [
      { offset: '0%', color: '#FF8A95' },
      { offset: '55%', color: '#FF5C67' },
      { offset: '100%', color: '#FF4756' },
    ],
  },
  medium: {
    trackColor: '#FFF6DE',
    stops: [
      { offset: '0%', color: '#FFD969' },
      { offset: '55%', color: '#FFC83D' },
      { offset: '100%', color: '#FFBC1F' },
    ],
  },
  low: {
    trackColor: '#DFF9E6',
    stops: [
      { offset: '0%', color: '#7FE7A4' },
      { offset: '55%', color: '#4DD979' },
      { offset: '100%', color: '#30C462' },
    ],
  },
};

export function getRiskGaugeGradient(level: RiskLevel): RiskGaugeGradient {
  return RISK_GAUGE_GRADIENT_MAP[level];
}

export interface RiskStyleTokens {
  card: string;
  title: string;
}

/** 결과 요약 카드 — 레벨 무관 공통 배경 */
const RESULT_SUMMARY_CARD_BG = 'bg-[#FFFFFD]';

const RISK_STYLE_MAP: Record<RiskLevel, RiskStyleTokens> = {
  high: {
    card: `${RESULT_SUMMARY_CARD_BG} shadow-[0_10px_24px_-14px_rgba(255,71,86,0.18)]`,
    title: 'text-[#FF4756]',
  },
  medium: {
    card: `${RESULT_SUMMARY_CARD_BG} shadow-[0_10px_24px_-14px_rgba(255,188,31,0.2)]`,
    title: 'text-[#FFBC1F]',
  },
  low: {
    card: `${RESULT_SUMMARY_CARD_BG} shadow-[0_10px_24px_-14px_rgba(48,196,98,0.18)]`,
    title: 'text-[#30C462]',
  },
};

export function getRiskStyles(level: RiskLevel): RiskStyleTokens {
  return RISK_STYLE_MAP[level];
}

const RISK_LEVEL_BADGE_LABEL: Record<RiskLevel, string> = {
  high: '위험도 높음',
  medium: '위험도 중간',
  low: '위험도 낮음',
};

export function getRiskLevelBadgeLabel(level: RiskLevel): string {
  return RISK_LEVEL_BADGE_LABEL[level];
}

const RISK_LEVEL_BADGE_CLASS: Record<RiskLevel, string> = {
  high: 'border border-[#FFD9DF] bg-[#FFF1F4] text-[#FF4756]',
  medium: 'border border-[#FFE8AF] bg-[#FFF8E7] text-[#FFBC1F]',
  low: 'border border-[#CCF1D8] bg-[#EEFBF1] text-[#30C462]',
};

export function getRiskLevelBadgeClass(level: RiskLevel): string {
  return RISK_LEVEL_BADGE_CLASS[level];
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

const PICTCHECK_RESULT_DISPLAY = {
  high: {
    true: {
      statusLabel: '거래 전 확인이 필요해요',
      summary: ['이 사진에서 실제 촬영 사진과 다른', '의심 신호가 확인되었습니다.'],
      showSuspicions: true,
    },
    false: {
      statusLabel: '거래 전 확인이 필요해요',
      summary: ['분석 결과, 거래 전 한 번 더 확인해야 할', '위험 신호가 감지되었습니다.'],
      showSuspicions: false,
    },
  },

  medium: {
    true: {
      statusLabel: '추가 확인을 권장해요',
      summary: ['일부 영역에서 신뢰도를 낮출 수 있는', '의심 신호가 발견되었습니다.'],
      showSuspicions: true,
    },
    false: {
      statusLabel: '신중한 확인을 권장해요',
      summary: ['큰 이상은 보이지 않지만,', '이미지 하나만으로 판단하기에는 주의가 필요합니다.'],
      showSuspicions: false,
    },
  },

  low: {
    true: {
      statusLabel: '전반적으로 양호해요',
      summary: ['전반적으로 자연스럽지만 일부 영역에서', '참고할 만한 관찰 포인트가 발견되었습니다.'],
      showSuspicions: true,
    },
    false: {
      statusLabel: '특별한 이상 징후가 없어요',
      summary: ['현재 분석 기준에서는 거래 신뢰도를 낮출 만한', '위험 신호가 보이지 않습니다.'],
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
    title: '눈에 보이는 단서는 제한적이에요',
    description: [
      '압축, 보정, 낮은 해상도처럼 이미지 상태에 따라 사람이',
      '직접 확인할 수 있는 단서가 적을 수 있습니다.',
    ],
  },

  medium: {
    title: '확인 가능한 단서가 적어요',
    description: [
      '사진 안에서 명확히 짚을 수 있는 부분은 많지 않습니다.',
      '판매자에게 추가 사진이나 원본 사진을 요청해보세요.',
    ],
  },

  low: {
    title: '짚어볼 만한 영역이 없어요',
    description: ['현재 이미지에서는 따로 확대해서 확인할 만한', '의심 영역이 발견되지 않았습니다.'],
  },
};
export function getPictcheckSuspicionEmptyState(level: RiskLevel): PictcheckSuspicionEmptyState {
  return PICTCHECK_SUSPICION_EMPTY[level];
}

export function formatSuspicionCountLabel(count: number, showSuspicions: boolean): string {
  if (!showSuspicions) return '표시 없음';
  return `${count}개 발견`;
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
