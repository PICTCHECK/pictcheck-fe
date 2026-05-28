import type { RiskLevel } from '@/src/lib/risk-styles';

export type VisionRiskLevel = RiskLevel;

export type VisionSuspicionCategory = 'anatomy' | 'lighting' | 'texture' | 'background' | 'artifact' | 'text';

export interface SuspicionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VisionSuspicion {
  id: string;
  title: string;
  description: string;
  detailDescription: string;
  technicalReason: string;
  riskLevel: VisionRiskLevel;
  confidence: number;
  category: VisionSuspicionCategory;
  area: SuspicionArea;
  marker: {
    index: number;
    x: number;
    y: number;
    lineW: number;
    lineRotate: number;
  };
  priority: number;
}

export const MOCK_OPENAI_VISION_SUSPICIONS: VisionSuspicion[] = [
  {
    id: 'distortion',
    title: '손 구조 왜곡 가능성',
    description: '손가락 경계가 비정상적으로 연결되어 있습니다.',
    detailDescription:
      '손가락 경계가 비정상적으로 이어지고 일부 관절 비율이 자연스러운 해부학 패턴과 다르게 나타납니다. AI 생성 이미지에서 자주 관찰되는 왜곡 유형입니다.',
    technicalReason:
      '손가락 분절 구조가 연속 곡면으로 융합되며 관절 간 거리 편차가 커집니다. 생성 모델이 미세 윤곽을 복원하는 과정에서 형태 제약을 충분히 반영하지 못할 때 발생할 수 있습니다.',
    riskLevel: 'high',
    confidence: 88,
    category: 'anatomy',
    area: {
      x: 26,
      y: 24,
      width: 22,
      height: 26,
    },
    marker: {
      index: 1,
      x: 31,
      y: 32,
      lineW: 52,
      lineRotate: 32,
    },
    priority: 1,
  },
  {
    id: 'light',
    title: '광원 방향 불일치',
    description: '인물과 배경의 그림자 방향이 일치하지 않는 영역이 확인됩니다.',
    detailDescription:
      '피사체와 배경 오브젝트의 명암 및 그림자 방향이 서로 다른 광원 조건을 가리킵니다. 장면 전체 조명 일관성이 낮아 합성 또는 생성 흔적으로 해석될 수 있습니다.',
    technicalReason:
      '주요 엣지 주변 하이라이트와 투영 그림자의 각도 벡터가 동일 소실점으로 수렴하지 않습니다. 픽셀 단위 조명 단서가 물리적 조명 모델과 부분적으로 어긋납니다.',
    riskLevel: 'medium',
    confidence: 74,
    category: 'lighting',
    area: {
      x: 76,
      y: 38,
      width: 20,
      height: 24,
    },
    marker: {
      index: 2,
      x: 88,
      y: 47,
      lineW: 40,
      lineRotate: -36,
    },
    priority: 2,
  },
  {
    id: 'texture',
    title: '텍스처 반복 패턴',
    description: '일부 영역에서 반복되는 텍스처 패턴이 감지되었습니다.',
    detailDescription:
      '바닥과 외곽 배경에서 짧은 주기로 유사한 질감 블록이 반복됩니다. 자연 촬영 이미지보다 패턴 주기성이 강해 생성형 모델의 타일링 흔적일 가능성이 있습니다.',
    technicalReason:
      '고주파 성분 분포가 국소 영역에서 주기적으로 재현되며 비슷한 텍스처 패치가 반복됩니다. 디테일 업샘플링 단계에서 동일 특징이 재사용되며 생길 수 있습니다.',
    riskLevel: 'medium',
    confidence: 69,
    category: 'texture',
    area: {
      x: 47,
      y: 72,
      width: 28,
      height: 20,
    },
    marker: {
      index: 3,
      x: 56,
      y: 81,
      lineW: 52,
      lineRotate: -8,
    },
    priority: 3,
  },
];
