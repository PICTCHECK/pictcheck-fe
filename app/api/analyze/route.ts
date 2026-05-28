import { buildPictcheckAnalysisResult } from '@/src/lib/analysis/build-analysis-result';
import { callOpenAiVision } from '@/src/lib/analysis/openai/client';
import { callSightengine } from '@/src/lib/analysis/sightengine/client';
import { extractSightengineAiGenerated } from '@/src/lib/analysis/sightengine/parser';
import { normalizeSightengineAiGenerated } from '@/src/lib/analysis/sightengine';
import { getSightengineCredentials } from '@/src/lib/analysis/shared/env';
import { ExternalApiError, PayloadParseError, PayloadValidationError } from '@/src/lib/analysis/shared/errors';
import { deriveRiskLevel } from '@/src/lib/risk-styles';
import { NextResponse } from 'next/server';

async function getImageFromFormData(request: Request): Promise<File | null> {
  const formData = await request.formData();
  const fileEntry = formData.get('file');
  return fileEntry instanceof File ? fileEntry : null;
}

export async function POST(request: Request): Promise<Response> {
  const fileEntry = await getImageFromFormData(request);

  if (!fileEntry) {
    return Response.json({ message: 'Image file is required.' }, { status: 400 });
  }

  try {
    getSightengineCredentials();
  } catch (error) {
    if (error instanceof PayloadValidationError) {
      return NextResponse.json(
        {
          message: 'Analyze configuration is missing.',
          reason: 'MISSING_SIGHTENGINE_ENV',
        },
        { status: 500 },
      );
    }
  }

  try {
    const sightengineRaw = await callSightengine(fileEntry);
    const sightengineAiGenerated = extractSightengineAiGenerated(sightengineRaw);
    const sightengineScore = normalizeSightengineAiGenerated(sightengineAiGenerated);
    const sightengineLevel = deriveRiskLevel(sightengineScore);
    const vision = await callOpenAiVision(fileEntry, { sightengineScore, sightengineLevel });
    const result = buildPictcheckAnalysisResult({ sightengineAiGenerated, vision });

    return Response.json(result);
  } catch (error) {
    console.error('[analyze] failed', error);

    if (error instanceof ExternalApiError) {
      return Response.json({ message: error.message }, { status: 502 });
    }

    if (error instanceof PayloadParseError || error instanceof PayloadValidationError) {
      return Response.json({ message: 'Failed to analyze image.' }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Failed to analyze image.' },
      { status: 500 },
    );
  }
}
