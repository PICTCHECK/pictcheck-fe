import { clampAiScore } from '@/src/lib/risk-styles';

export function normalizeSightengineAiGenerated(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return clampAiScore(Math.round(value * 100));
}
