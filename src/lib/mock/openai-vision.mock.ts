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
  evidenceStrength: VisionRiskLevel;
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
    description:
      '손가락 경계가 끊기지 않고 이어져 보이며, 관절 비율도 자연스러운 손 모양과 다르게 느껴질 수 있습니다.',
    detailDescription:
      '손가락 경계가 끊기지 않고 이어져 보이며, 관절 비율도 자연스러운 손 모양과 다르게 느껴질 수 있습니다. AI 생성 이미지에서는 손가락·관절 디테일이 자주 왜곡되는 편이라, 이 부분은 눈으로 한번 더 확인해볼 수 있습니다.',
    evidenceStrength: 'high',
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
    description:
      '인물과 배경의 그림자·명암 방향이 서로 다르게 보이는 영역이 있어, 조명이 한 장면에서 일관되지 않을 수 있습니다.',
    detailDescription:
      '인물과 배경의 그림자·명암 방향이 서로 다르게 보이는 영역이 있어, 조명이 한 장면에서 일관되지 않을 수 있습니다. 빛이 한 방향에서 온 것처럼 보이지 않으면 합성이나 생성 과정의 흔적으로 해석될 수 있으니, 해당 영역을 확대해 비교해볼 수 있습니다.',
    evidenceStrength: 'medium',
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
    description:
      '바닥·배경 일부에서 비슷한 질감이 짧은 간격으로 반복되는 것처럼 보이며, 자연 촬영보다 패턴이 눈에 띌 수 있습니다.',
    detailDescription:
      '바닥·배경 일부에서 비슷한 질감이 짧은 간격으로 반복되는 것처럼 보이며, 자연 촬영보다 패턴이 눈에 띌 수 있습니다. 생성형 이미지에서는 텍스처가 타일처럼 반복되는 경우가 있어, 반복되는 블록의 경계를 따라가며 확인해볼 수 있습니다.',
    evidenceStrength: 'medium',
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
