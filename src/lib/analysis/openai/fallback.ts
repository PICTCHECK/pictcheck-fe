import type { VisionResult } from '@/src/lib/analysis/openai/types';

export const OPENAI_VISION_FALLBACK: VisionResult = {
  hasVisibleEvidence: false,
  summary: '외부 탐지 기준으로 분석은 완료되었지만, 시각적 근거 설명을 생성하지 못했습니다.',
  caution: '이미지 품질, 네트워크 상태 또는 분석 모델 응답 문제로 상세 설명이 제한될 수 있습니다.',
  suspicions: [],
};

export function getOpenAiVisionFallback(): VisionResult {
  return OPENAI_VISION_FALLBACK;
}
