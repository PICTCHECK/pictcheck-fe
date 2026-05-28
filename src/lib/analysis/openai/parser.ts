import { parseVisionPayloadFromUnknown } from '@/src/lib/analysis/openai-vision';
import { PayloadParseError, PayloadValidationError } from '@/src/lib/analysis/shared/errors';
import type { OpenAiResponsePayload, VisionResult } from '@/src/lib/analysis/openai/types';

export function extractOpenAiOutputText(payload: unknown): string | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const candidate = payload as OpenAiResponsePayload;

  if (typeof candidate.output_text === 'string' && candidate.output_text.trim()) {
    return candidate.output_text;
  }

  const firstText = candidate.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === 'output_text' && typeof content.text === 'string');

  if (firstText && typeof firstText.text === 'string' && firstText.text.trim()) {
    return firstText.text;
  }

  return null;
}

export function parseOpenAiVisionText(outputText: string): VisionResult {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(outputText);
  } catch (error) {
    throw new PayloadParseError('OpenAI output JSON parse failed.', { cause: error });
  }

  const parsedVision = parseVisionPayloadFromUnknown(parsedJson);
  if (!parsedVision) {
    throw new PayloadValidationError('OpenAI payload validation failed.');
  }

  return parsedVision;
}
