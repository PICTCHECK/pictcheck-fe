import type { SightengineRawResponse } from '@/src/lib/analysis/sightengine/types';

export function isSightengineRawResponse(value: unknown): value is SightengineRawResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as {
    status?: unknown;
    type?: {
      ai_generated?: unknown;
    };
  };

  if (candidate.status !== undefined && typeof candidate.status !== 'string') {
    return false;
  }

  if (candidate.type !== undefined && (typeof candidate.type !== 'object' || candidate.type === null)) {
    return false;
  }

  return true;
}

export function extractSightengineAiGenerated(raw: SightengineRawResponse): number {
  const aiGenerated = raw.type?.ai_generated;
  if (typeof aiGenerated !== 'number' || Number.isNaN(aiGenerated)) {
    return 0;
  }

  return aiGenerated;
}
