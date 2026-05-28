import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';

export class AnalyzeRequestFailedError extends Error {
  constructor(public readonly status: number) {
    super(`Image analysis request failed with status ${status}`);
    this.name = 'AnalyzeRequestFailedError';
  }
}

function isPictcheckAnalysisResult(value: unknown): value is PictcheckAnalysisResult {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as {
    sightengine?: { score?: unknown; level?: unknown };
    vision?: {
      hasVisibleEvidence?: unknown;
      summary?: unknown;
      caution?: unknown;
      suspicions?: unknown;
    };
    suspicionDetected?: unknown;
  };

  return (
    typeof candidate.sightengine?.score === 'number' &&
    typeof candidate.sightengine.level === 'string' &&
    typeof candidate.vision?.hasVisibleEvidence === 'boolean' &&
    typeof candidate.vision.summary === 'string' &&
    typeof candidate.vision.caution === 'string' &&
    Array.isArray(candidate.vision.suspicions) &&
    typeof candidate.suspicionDetected === 'boolean'
  );
}

export async function analyzeImage(file: File): Promise<PictcheckAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    console.error('[analyzeImage] failed response', {
      status: response.status,
      body: errorBody,
    });
    throw new AnalyzeRequestFailedError(response.status);
  }

  const data: unknown = await response.json();
  if (!isPictcheckAnalysisResult(data)) {
    throw new Error('Invalid analysis response payload.');
  }

  return data;
}
