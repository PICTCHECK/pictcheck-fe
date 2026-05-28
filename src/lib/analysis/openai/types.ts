import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import type { deriveRiskLevel } from '@/src/lib/risk-styles';

export interface VisionAnalysisContext {
  sightengineScore: number;
  sightengineLevel: ReturnType<typeof deriveRiskLevel>;
}

export interface OpenAiResponseOutputText {
  output_text?: string;
}

export interface OpenAiResponsePayload extends OpenAiResponseOutputText {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}

export type VisionResult = PictcheckAnalysisResult['vision'];
