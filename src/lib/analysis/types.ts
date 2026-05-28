import type { RiskLevel } from '@/src/lib/risk-styles';

export interface SuspicionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SuspicionMarker {
  index: number;
  x: number;
  y: number;
}

export type VisionSuspicionCategory = 'anatomy' | 'lighting' | 'texture' | 'background' | 'artifact' | 'text';

export interface VisionSuspicion {
  id: string;
  title: string;
  description: string;
  detailDescription: string;
  technicalReason: string;
  riskLevel: RiskLevel;
  confidence: number;
  category: VisionSuspicionCategory;
  area: SuspicionArea;
  marker: SuspicionMarker;
  priority: number;
}

export interface PictcheckAnalysisResult {
  sightengine: {
    score: number;
    level: RiskLevel;
  };
  vision: {
    hasVisibleEvidence: boolean;
    summary: string;
    caution: string;
    suspicions: VisionSuspicion[];
  };
  suspicionDetected: boolean;
}
