import type { VisionResult } from '@/src/lib/analysis/openai/types';

export const OPENAI_VISION_FALLBACK: VisionResult = {
  hasVisibleEvidence: false,
  summary: '외부 탐지 기준 분석은 완료되었지만, 참고할 시각적 관찰 정보를 충분히 생성하지 못했습니다.',
  caution: '이 섹션은 AI 판정 근거가 아니라 참고용 관찰 정보이며, 이미지 품질이나 응답 상태에 따라 제한될 수 있습니다.',
  suspicions: [],
};

export function getOpenAiVisionFallback(): VisionResult {
  return OPENAI_VISION_FALLBACK;
}
