import { PayloadValidationError } from '@/src/lib/analysis/shared/errors';

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new PayloadValidationError(`${name} is not configured.`);
  }

  return value;
}

export function getOpenAiApiKey(): string {
  return readRequiredEnv('OPENAI_API_KEY');
}

export function getSightengineCredentials(): { apiUser: string; apiSecret: string } {
  return {
    apiUser: readRequiredEnv('SIGHTENGINE_API_USER'),
    apiSecret: readRequiredEnv('SIGHTENGINE_API_SECRET'),
  };
}
