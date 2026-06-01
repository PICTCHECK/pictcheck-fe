import type { AnalyzingStep } from '../lib/analyzing-progress-tick';

export const ANALYZING_STEP_SECONDARY_MESSAGE: Record<AnalyzingStep, string> = {
  preparing: '분석에는 보통 3~8초 정도 소요될 수 있습니다',
  detecting: 'AI 흔적과 생성 패턴을 확인하고 있습니다',
  inspecting: '의심 영역을 하나씩 점검하고 있습니다',
  finalizing: '분석 완료 전까지 잠시만 기다려주세요',
};

/** 단계별로 순환 표시할 보조 메시지 (없으면 primary만 사용) */
export const ANALYZING_STEP_MESSAGE_VARIANTS: Record<AnalyzingStep, readonly string[]> = {
  preparing: ['이미지를 준비하고 있어요', '이미지 품질을 확인하고 있어요'],
  detecting: [
    'AI 생성 가능성을 분석하고 있어요',
    '생성 패턴과 AI 흔적을 찾고 있어요',
    '모델이 이미지를 꼼꼼히 살펴보고 있어요',
  ],
  inspecting: [
    '의심 요소를 자세히 확인하고 있어요',
    '의심 영역의 세부 특징을 검토하고 있어요',
    '마지막으로 결과를 교차 검증하고 있어요',
  ],
  finalizing: [
    '결과를 정리하고 있어요',
    '마지막 의심 요소를 정리하고 있어요',
    '분석 결과를 정리하는 중입니다',
    '조금만 기다려주세요. 결과를 확인하고 있어요',
  ],
};
