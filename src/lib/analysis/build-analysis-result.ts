import { normalizeVisionSuspicions } from '@/src/lib/analysis/openai-vision';
import { normalizeSightengineAiGenerated } from '@/src/lib/analysis/sightengine';
import type { PictcheckAnalysisResult, VisionSuspicion } from '@/src/lib/analysis/types';
import { deriveRiskLevel } from '@/src/lib/risk-styles';

interface BuildAnalysisResultInput {
  sightengineAiGenerated: unknown;
  vision: {
    hasVisibleEvidence: boolean;
    summary: string;
    caution: string;
    suspicions: VisionSuspicion[];
  };
}

export function buildPictcheckAnalysisResult(input: BuildAnalysisResultInput): PictcheckAnalysisResult {
  const score = normalizeSightengineAiGenerated(input.sightengineAiGenerated);
  const level = deriveRiskLevel(score);
  const suspicions = normalizeVisionSuspicions(input.vision.suspicions);
  const suspicionDetected = input.vision.hasVisibleEvidence && suspicions.length > 0;

  return {
    sightengine: {
      score,
      level,
    },
    vision: {
      hasVisibleEvidence: input.vision.hasVisibleEvidence,
      summary: input.vision.summary,
      caution: input.vision.caution,
      suspicions,
    },
    suspicionDetected,
  };
}
