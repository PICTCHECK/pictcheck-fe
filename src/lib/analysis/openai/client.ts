import { OPENAI_RESPONSES_ENDPOINT, OPENAI_TIMEOUT_MS, OPENAI_VISION_MODEL } from '@/src/lib/analysis/openai/constants';
import { getOpenAiVisionFallback } from '@/src/lib/analysis/openai/fallback';
import { extractOpenAiOutputText, parseOpenAiVisionText } from '@/src/lib/analysis/openai/parser';
import { createOpenAiPrompt } from '@/src/lib/analysis/openai/prompt';
import type { VisionAnalysisContext, VisionResult } from '@/src/lib/analysis/openai/types';
import { getOpenAiApiKey } from '@/src/lib/analysis/shared/env';
import { ExternalApiError, PayloadParseError, PayloadValidationError, TimeoutError } from '@/src/lib/analysis/shared/errors';
import { withTimeout } from '@/src/lib/analysis/shared/timeout';

async function postOpenAiVision(file: File, context: VisionAnalysisContext): Promise<Response> {
  const apiKey = getOpenAiApiKey();
  const fileArrayBuffer = await file.arrayBuffer();
  const mimeType = file.type || 'image/jpeg';
  const base64Image = Buffer.from(fileArrayBuffer).toString('base64');

  try {
    return await withTimeout(
      fetch(OPENAI_RESPONSES_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_VISION_MODEL,
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: createOpenAiPrompt(context),
                },
                {
                  type: 'input_image',
                  image_url: `data:${mimeType};base64,${base64Image}`,
                },
              ],
            },
          ],
        }),
      }),
      OPENAI_TIMEOUT_MS,
    );
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw error;
    }

    throw new ExternalApiError('OpenAI request failed.', { cause: error });
  }
}

export async function callOpenAiVision(file: File, context: VisionAnalysisContext): Promise<VisionResult> {
  try {
    const response = await postOpenAiVision(file, context);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => null);
      console.error('[analyze] openai vision request failed', {
        status: response.status,
        body: errorBody?.slice(0, 500) ?? null,
      });
      return getOpenAiVisionFallback();
    }

    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch (error) {
      throw new PayloadParseError('OpenAI response body parse failed.', { cause: error });
    }

    const outputText = extractOpenAiOutputText(responseBody);
    if (!outputText) {
      throw new PayloadValidationError('OpenAI output text is empty.');
    }

    return parseOpenAiVisionText(outputText);
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error('[analyze] OPENAI_TIMEOUT', { message: error.message });
      return getOpenAiVisionFallback();
    }

    if (error instanceof ExternalApiError) {
      console.error('[analyze] OPENAI_NETWORK_FAILED', { message: error.message });
      return getOpenAiVisionFallback();
    }

    if (error instanceof PayloadParseError) {
      console.error('[analyze] OPENAI_JSON_PARSE_FAILED', { message: error.message });
      return getOpenAiVisionFallback();
    }

    if (error instanceof PayloadValidationError) {
      console.error('[analyze] OPENAI_PAYLOAD_VALIDATION_FAILED', { message: error.message });
      return getOpenAiVisionFallback();
    }

    console.error('[analyze] openai vision request error', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
    return getOpenAiVisionFallback();
  }
}
