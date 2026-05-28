import { buildPictcheckAnalysisResult } from '@/src/lib/analysis/build-analysis-result';
import { MOCK_PICTCHECK_ANALYSIS_RESULT } from '@/src/lib/analysis/mock-analysis-result';
import type { PictcheckAnalysisResult } from '@/src/lib/analysis/types';
import { deriveRiskLevel } from '@/src/lib/risk-styles';
import { normalizeSightengineAiGenerated } from '@/src/lib/analysis/sightengine';
import { NextResponse } from 'next/server';

const SIGHTENGINE_ENDPOINT = 'https://api.sightengine.com/1.0/check.json';
const SIGHTENGINE_MODELS = 'genai';

interface SightengineRawResponse {
  status?: string;
  type?: {
    ai_generated?: unknown;
  };
}

interface VisionAnalysisContext {
  sightengineScore: number;
  sightengineLevel: ReturnType<typeof deriveRiskLevel>;
}

function getSightengineCredentials(): { apiUser: string; apiSecret: string } {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!apiUser || !apiSecret) {
    throw new Error('Sightengine credentials are not configured.');
  }

  return { apiUser, apiSecret };
}

function isSightengineRawResponse(value: unknown): value is SightengineRawResponse {
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

class SightengineRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SightengineRequestError';
  }
}

async function callSightengine(file: File): Promise<SightengineRawResponse> {
  const { apiUser, apiSecret } = getSightengineCredentials();
  const sightengineFormData = new FormData();

  sightengineFormData.append('models', SIGHTENGINE_MODELS);
  sightengineFormData.append('api_user', apiUser);
  sightengineFormData.append('api_secret', apiSecret);
  sightengineFormData.append('media', file, file.name);

  const response = await fetch(SIGHTENGINE_ENDPOINT, {
    method: 'POST',
    body: sightengineFormData,
  });

  if (!response.ok) {
    const responseBody = await response.text().catch(() => null);
    console.error('[analyze] sightengine request failed', {
      status: response.status,
      body: responseBody,
    });
    throw new SightengineRequestError(`Sightengine request failed with status ${response.status}`);
  }

  const raw: unknown = await response.json();
  if (!isSightengineRawResponse(raw)) {
    throw new SightengineRequestError('Sightengine response shape is invalid.');
  }

  return raw;
}

function extractSightengineAiGenerated(raw: SightengineRawResponse): number {
  const aiGenerated = raw.type?.ai_generated;
  if (typeof aiGenerated !== 'number' || Number.isNaN(aiGenerated)) {
    return 0;
  }

  return aiGenerated;
}

function buildVisionMockResult(_context: VisionAnalysisContext): PictcheckAnalysisResult['vision'] {
  // Keep mock output for now; `_context` will be used for real OpenAI Vision prompts next.
  return {
    hasVisibleEvidence: MOCK_PICTCHECK_ANALYSIS_RESULT.vision.hasVisibleEvidence,
    summary: MOCK_PICTCHECK_ANALYSIS_RESULT.vision.summary,
    caution: MOCK_PICTCHECK_ANALYSIS_RESULT.vision.caution,
    suspicions: MOCK_PICTCHECK_ANALYSIS_RESULT.vision.suspicions,
  };
}

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const fileEntry = formData.get('file');

  if (!(fileEntry instanceof File)) {
    return Response.json({ message: 'Image file is required.' }, { status: 400 });
  }

  if (!process.env.SIGHTENGINE_API_USER || !process.env.SIGHTENGINE_API_SECRET) {
    return NextResponse.json(
      {
        message: 'Analyze configuration is missing.',
        reason: 'MISSING_SIGHTENGINE_ENV',
      },
      { status: 500 },
    );
  }

  try {
    const sightengineRaw = await callSightengine(fileEntry);
    const sightengineAiGenerated = extractSightengineAiGenerated(sightengineRaw);
    const sightengineScore = normalizeSightengineAiGenerated(sightengineAiGenerated);
    const sightengineLevel = deriveRiskLevel(sightengineScore);

    const visionContext: VisionAnalysisContext = {
      sightengineScore,
      sightengineLevel,
    };

    const result: PictcheckAnalysisResult = buildPictcheckAnalysisResult({
      sightengineAiGenerated,
      vision: buildVisionMockResult(visionContext),
    });

    return Response.json(result);
  } catch (error) {
    console.error('[analyze] failed', error);

    if (error instanceof SightengineRequestError) {
      return Response.json({ message: error.message }, { status: 502 });
    }

    return Response.json({ message: 'Failed to analyze image.' }, { status: 500 });
  }
}
