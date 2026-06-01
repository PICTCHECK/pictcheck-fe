export const ANALYZING_STEPS = ['이미지 업로드 완료', 'AI 패턴 분석 중', '의심 영역 추정 중', '결과 생성 중'] as const;

export const ANALYZING_STEP_RANGES = [
  { start: 0, end: 35 },
  { start: 35, end: 70 },
  { start: 70, end: 95 },
  { start: 95, end: 99 },
] as const;

export const CIRCLE_SIZE = 220;
export const STROKE_WIDTH = 14;
export const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const ACTIVE_ITEM_TRANSITION = {
  duration: 0.42,
  ease: 'easeOut',
} as const;
