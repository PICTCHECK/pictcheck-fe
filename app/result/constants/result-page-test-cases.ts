import { MOCK_PICTCHECK_ANALYSIS_RESULT } from '@/src/lib/analysis/mock-analysis-result';
import type { VisionSuspicion } from '@/src/lib/analysis/types';
import type { RiskLevel } from '@/src/lib/risk-styles';

/**
 * 결과 페이지 UI QA — 케이스별 하드코딩
 *
 * 1. `enabled`를 `true`로
 * 2. `caseId`만 아래 중 하나로 변경
 *
 * | caseId                  | AI 가능성 | 시각 특징 |
 * |-------------------------|-----------|-----------|
 * | high-with-vision        | 높음 92%  | 있음      |
 * | high-without-vision     | 높음 88%  | 없음      |
 * | medium-with-vision      | 보통 62%  | 있음      |
 * | medium-without-vision   | 보통 57%  | 없음      |
 * | low-with-vision         | 낮음 32%  | 있음      |
 * | low-without-vision      | 낮음 18%  | 없음      |
 */
export const RESULT_PAGE_TEST = {
  enabled: false,
  caseId: 'medium-with-vision',
} as const;

export type ResultPageTestCaseId = keyof typeof RESULT_PAGE_TEST_CASES;

const MOCK_SUSPICIONS = MOCK_PICTCHECK_ANALYSIS_RESULT.vision.suspicions;

type ResultPageTestCase = {
  level: RiskLevel;
  score: number;
  suspicionDetected: boolean;
  suspicions: VisionSuspicion[];
};

const RESULT_PAGE_TEST_CASES = {
  'high-with-vision': {
    level: 'high',
    score: 92,
    suspicionDetected: true,
    suspicions: MOCK_SUSPICIONS,
  },
  'high-without-vision': {
    level: 'high',
    score: 88,
    suspicionDetected: false,
    suspicions: [],
  },
  'medium-with-vision': {
    level: 'medium',
    score: 62,
    suspicionDetected: true,
    suspicions: MOCK_SUSPICIONS,
  },
  'medium-without-vision': {
    level: 'medium',
    score: 57,
    suspicionDetected: false,
    suspicions: [],
  },
  'low-with-vision': {
    level: 'low',
    score: 32,
    suspicionDetected: true,
    suspicions: MOCK_SUSPICIONS,
  },
  'low-without-vision': {
    level: 'low',
    score: 18,
    suspicionDetected: false,
    suspicions: [],
  },
} satisfies Record<string, ResultPageTestCase>;

export function applyResultPageTestOverrides(actual: {
  score: number;
  level: RiskLevel;
  suspicionDetected: boolean;
  suspicions: VisionSuspicion[];
}): {
  score: number;
  level: RiskLevel;
  suspicionDetected: boolean;
  suspicions: VisionSuspicion[];
} {
  if (!RESULT_PAGE_TEST.enabled) return actual;

  const testCase = RESULT_PAGE_TEST_CASES[RESULT_PAGE_TEST.caseId];
  return {
    score: testCase.score,
    level: testCase.level,
    suspicionDetected: testCase.suspicionDetected,
    suspicions: testCase.suspicions,
  };
}
