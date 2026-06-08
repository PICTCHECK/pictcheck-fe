import { OPENAI_RESPONSES_ENDPOINT, OPENAI_TIMEOUT_MS, OPENAI_VISION_MODEL } from '@/src/lib/analysis/openai/constants';
import { getOpenAiVisionFallback } from '@/src/lib/analysis/openai/fallback';
import { extractOpenAiOutputText, parseOpenAiVisionText } from '@/src/lib/analysis/openai/parser';
import {
  createOpenAiPrompt,
  MIN_SUSPICIONS_WHEN_HIGH,
  type CreateOpenAiPromptOptions,
} from '@/src/lib/analysis/openai/prompt';
import type { VisionAnalysisContext, VisionResult } from '@/src/lib/analysis/openai/types';
import { getOpenAiApiKey } from '@/src/lib/analysis/shared/env';
import {
  ExternalApiError,
  PayloadParseError,
  PayloadValidationError,
  TimeoutError,
} from '@/src/lib/analysis/shared/errors';
import { withTimeout } from '@/src/lib/analysis/shared/timeout';

function hasEnoughSuspicionsForHighLevel(context: VisionAnalysisContext, result: VisionResult): boolean {
  if (context.sightengineLevel !== 'high') {
    return true;
  }

  return result.suspicions.length >= MIN_SUSPICIONS_WHEN_HIGH;
}

async function postOpenAiVision(
  file: File,
  context: VisionAnalysisContext,
  promptOptions: CreateOpenAiPromptOptions = {},
): Promise<Response> {
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
                  text: createOpenAiPrompt(context, promptOptions),
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

async function parseOpenAiVisionResponse(response: Response): Promise<VisionResult> {
  if (!response.ok) {
    const errorBody = await response.text().catch(() => null);
    console.error('[analyze] openai vision request failed', {
      status: response.status,
      body: errorBody?.slice(0, 500) ?? null,
    });
    throw new ExternalApiError('OpenAI vision request returned non-OK status.');
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
}

async function requestOpenAiVision(
  file: File,
  context: VisionAnalysisContext,
  promptOptions: CreateOpenAiPromptOptions = {},
): Promise<VisionResult> {
  const response = await postOpenAiVision(file, context, promptOptions);
  return parseOpenAiVisionResponse(response);
}

export async function callOpenAiVision(file: File, context: VisionAnalysisContext): Promise<VisionResult> {
  try {
    let result = await requestOpenAiVision(file, context);

    if (!hasEnoughSuspicionsForHighLevel(context, result)) {
      console.warn('[analyze] openai vision insufficient suspicions for high level, retrying', {
        count: result.suspicions.length,
        minimum: MIN_SUSPICIONS_WHEN_HIGH,
      });

      try {
        const retryResult = await requestOpenAiVision(file, context, {
          retryBecauseInsufficientSuspicions: true,
        });

        if (retryResult.suspicions.length > result.suspicions.length) {
          result = retryResult;
        }
      } catch (retryError) {
        console.error('[analyze] openai vision retry failed', {
          message: retryError instanceof Error ? retryError.message : 'unknown error',
        });
      }
    }

    return result;
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
