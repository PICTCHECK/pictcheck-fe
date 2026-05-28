import { SIGHTENGINE_ENDPOINT, SIGHTENGINE_MODELS } from '@/src/lib/analysis/sightengine/constants';
import { isSightengineRawResponse } from '@/src/lib/analysis/sightengine/parser';
import type { SightengineRawResponse } from '@/src/lib/analysis/sightengine/types';
import { getSightengineCredentials } from '@/src/lib/analysis/shared/env';
import { ExternalApiError, PayloadParseError, PayloadValidationError } from '@/src/lib/analysis/shared/errors';

async function postSightengine(file: File, apiUser: string, apiSecret: string): Promise<Response> {
  const sightengineFormData = new FormData();
  sightengineFormData.append('models', SIGHTENGINE_MODELS);
  sightengineFormData.append('api_user', apiUser);
  sightengineFormData.append('api_secret', apiSecret);
  sightengineFormData.append('media', file, file.name);

  try {
    return await fetch(SIGHTENGINE_ENDPOINT, {
      method: 'POST',
      body: sightengineFormData,
    });
  } catch (error) {
    throw new ExternalApiError('Sightengine request failed.', { cause: error });
  }
}

export async function callSightengine(file: File): Promise<SightengineRawResponse> {
  const { apiUser, apiSecret } = getSightengineCredentials();
  const response = await postSightengine(file, apiUser, apiSecret);

  if (!response.ok) {
    const responseBody = await response.text().catch(() => null);
    console.error('[analyze] sightengine request failed', {
      status: response.status,
      body: responseBody,
    });
    throw new ExternalApiError(`Sightengine request failed with status ${response.status}`);
  }

  let raw: unknown;
  try {
    raw = await response.json();
  } catch (error) {
    throw new PayloadParseError('Sightengine response JSON parse failed.', { cause: error });
  }

  if (!isSightengineRawResponse(raw)) {
    throw new PayloadValidationError('Sightengine response shape is invalid.');
  }

  return raw;
}
