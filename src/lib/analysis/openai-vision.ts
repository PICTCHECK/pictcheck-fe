import type { RiskLevel } from '@/src/lib/risk-styles';
import type {
  SuspicionArea,
  SuspicionMarker,
  VisionEvidenceStrength,
  VisionSuspicion,
  VisionSuspicionCategory,
} from '@/src/lib/analysis/types';

const MIN_BOUND = 0;
const MAX_BOUND = 100;
const MAX_SUSPICIONS = 3;
const MAX_TITLE_LENGTH = 32;

const VISION_CATEGORIES: VisionSuspicionCategory[] = [
  'anatomy',
  'lighting',
  'texture',
  'background',
  'artifact',
  'text',
];
const RISK_LEVELS: RiskLevel[] = ['high', 'medium', 'low'];
const FALLBACK_TITLE_BY_CATEGORY: Record<VisionSuspicionCategory, string> = {
  anatomy: '손가락 어색함',
  lighting: '반사 어색함',
  texture: '피부가 매끈함',
  background: '배경 경계 어색함',
  artifact: '머리카락 경계',
  text: '로고 왜곡',
};
const EASY_KOREAN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/diffusion artifact/gi, '번진 흔적'],
  [/artifact/gi, '번진 흔적'],
  [/smoothing/gi, '매끈한 느낌'],
  [/texture/gi, '질감'],
  [/anatomy inconsistency/gi, '모양 불일치'],
  [/inconsistency/gi, '불일치'],
  [/reflection inconsistency/gi, '반사 어색함'],
  [/reflection/gi, '반사'],
  [/fusion/gi, '붙어 보임'],
  [/consistency/gi, '일관성'],
];

function toSimpleKoreanText(text: string): string {
  return EASY_KOREAN_REPLACEMENTS.reduce(
    (accumulator, [pattern, replacement]) => accumulator.replace(pattern, replacement),
    text,
  )
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function sanitizeTitleText(title: string): string {
  const noTechTerms = toSimpleKoreanText(title);
  const noEnglishAndSpecial = noTechTerms
    .replace(/[A-Za-z]/g, '')
    .replace(/[()[\]{}<>]/g, '')
    .replace(/[^가-힣0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (noEnglishAndSpecial.length <= MAX_TITLE_LENGTH) {
    return noEnglishAndSpecial;
  }

  // Keep natural Korean word boundaries when shortening long titles.
  const shortened = noEnglishAndSpecial.slice(0, MAX_TITLE_LENGTH).trim();
  const lastSpaceIndex = shortened.lastIndexOf(' ');
  if (lastSpaceIndex < 3) {
    return shortened;
  }

  return shortened.slice(0, lastSpaceIndex);
}

function normalizeTitle(title: string, category: VisionSuspicionCategory): string {
  const normalized = sanitizeTitleText(title);
  if (!normalized) {
    return FALLBACK_TITLE_BY_CATEGORY[category];
  }

  return normalized;
}

function normalizeUserFacingSentence(text: string): string {
  const simplified = toSimpleKoreanText(text)
    .replace(/[。]/g, '.')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  if (!simplified) {
    return simplified;
  }

  const deduplicated = simplified
    .replace(/(처럼 보입니다\.?\s*){2,}/g, '처럼 보입니다. ')
    .replace(/(어색해 보입니다\.?\s*){2,}/g, '어색해 보입니다. ')
    .replace(/(의심됩니다\.?\s*){2,}/g, '의심됩니다. ')
    .replace(/(가능성이 있습니다\.?\s*){2,}/g, '가능성이 있습니다. ')
    .replace(/(확인됩니다\.?\s*){2,}/g, '확인됩니다. ')
    .replace(/(보일 수 있습니다\.?\s*){2,}/g, '보일 수 있습니다. ')
    .replace(/처럼 보입니다\.?\s*때문에/g, '때문에')
    .replace(/([.!?])\s*\1+/g, '$1')
    .trim();

  if (
    /(처럼 보입니다|어색해 보입니다|의심됩니다|가능성이 있습니다|확인됩니다|보일 수 있습니다)\.?$/.test(deduplicated)
  ) {
    return deduplicated.endsWith('.') ? deduplicated : `${deduplicated}.`;
  }

  if (/[.!?]$/.test(deduplicated)) {
    return deduplicated;
  }

  return `${deduplicated}.`;
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeDetailDescription(text: string): string {
  const normalized = normalizeUserFacingSentence(text);
  if (!normalized) {
    return normalized;
  }

  const sentences = splitSentences(normalized);
  if (sentences.length <= 2) {
    return normalized;
  }

  return sentences.slice(0, 2).join(' ');
}

function normalizeTechnicalReason(text: string): string {
  const simplified = toSimpleKoreanText(text)
    .replace(/[A-Za-z]+/g, ' ')
    .replace(/[。]/g, '.')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/([.!?])\s*\1+/g, '$1')
    .trim();

  if (!simplified) {
    return '';
  }

  const normalized = normalizeUserFacingSentence(simplified);
  const sentences = splitSentences(normalized);

  return sentences.slice(0, 3).join(' ');
}

function clampPercent(value: number): number {
  return Math.max(MIN_BOUND, Math.min(MAX_BOUND, value));
}

function normalizeArea(area: SuspicionArea): SuspicionArea {
  const width = clampPercent(area.width);
  const height = clampPercent(area.height);
  const x = clampPercent(area.x);
  const y = clampPercent(area.y);

  return {
    x: Math.min(x, MAX_BOUND - width),
    y: Math.min(y, MAX_BOUND - height),
    width,
    height,
  };
}

function getAreaCenter(area: SuspicionArea): { x: number; y: number } {
  return {
    x: clampPercent(area.x + area.width / 2),
    y: clampPercent(area.y + area.height / 2),
  };
}

function normalizeMarker(area: SuspicionArea, marker: SuspicionMarker): SuspicionMarker {
  const normalizedX = clampPercent(marker.x);
  const normalizedY = clampPercent(marker.y);
  const areaEndX = area.x + area.width;
  const areaEndY = area.y + area.height;
  const markerInsideArea =
    normalizedX >= area.x && normalizedX <= areaEndX && normalizedY >= area.y && normalizedY <= areaEndY;

  if (markerInsideArea) {
    return {
      index: marker.index,
      x: normalizedX,
      y: normalizedY,
    };
  }

  const center = getAreaCenter(area);
  return {
    index: marker.index,
    x: center.x,
    y: center.y,
  };
}

function normalizeSuspicion(suspicion: VisionSuspicion): VisionSuspicion {
  const area = normalizeArea(suspicion.area);
  return {
    ...suspicion,
    area,
    marker: normalizeMarker(area, suspicion.marker),
  };
}

export function normalizeVisionSuspicions(suspicions: VisionSuspicion[]): VisionSuspicion[] {
  return [...suspicions]
    .map(normalizeSuspicion)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, MAX_SUSPICIONS);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeCategory(value: unknown): VisionSuspicionCategory {
  return VISION_CATEGORIES.includes(value as VisionSuspicionCategory) ? (value as VisionSuspicionCategory) : 'artifact';
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  return RISK_LEVELS.includes(value as RiskLevel) ? (value as RiskLevel) : 'medium';
}

function confidenceToEvidenceStrength(confidence: number): VisionEvidenceStrength {
  if (confidence >= 70) return 'high';
  if (confidence >= 45) return 'medium';
  return 'low';
}

function normalizeEvidenceStrength(value: unknown): VisionEvidenceStrength {
  if (value === 'high' || value === 'medium' || value === 'low') {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return confidenceToEvidenceStrength(clampPercent(value));
  }

  return 'medium';
}

function toVisionSuspicion(value: unknown, index: number): VisionSuspicion | null {
  if (!isObject(value)) {
    return null;
  }

  const areaCandidate = isObject(value.area) ? value.area : {};
  const markerCandidate = isObject(value.marker) ? value.marker : {};
  const safeIndex = index + 1;
  const area: SuspicionArea = {
    x: readNumber(areaCandidate.x),
    y: readNumber(areaCandidate.y),
    width: readNumber(areaCandidate.width),
    height: readNumber(areaCandidate.height),
  };
  const marker: SuspicionMarker = {
    index: safeIndex,
    x: readNumber(markerCandidate.x, area.x + area.width / 2),
    y: readNumber(markerCandidate.y, area.y + area.height / 2),
  };

  const category = normalizeCategory(value.category);
  const id = readString(value.id) || `vision-suspicion-${safeIndex}`;
  const title = normalizeTitle(readString(value.title), category);
  const description = normalizeUserFacingSentence(readString(value.description));
  const rawDetailDescription = readString(value.detailDescription);
  const rawTechnicalReason = readString(value.technicalReason);
  const detailDescriptionBase = rawDetailDescription || description;
  let detailDescription = normalizeDetailDescription(detailDescriptionBase);
  let technicalReason = normalizeTechnicalReason(rawTechnicalReason);

  if (!technicalReason && rawDetailDescription) {
    const detailSentences = splitSentences(normalizeUserFacingSentence(rawDetailDescription));
    if (detailSentences.length > 2) {
      technicalReason = normalizeTechnicalReason(detailSentences.slice(1).join(' '));
    }
  }

  if (technicalReason && detailDescription.length >= technicalReason.length) {
    const detailSentences = splitSentences(detailDescription);
    technicalReason = normalizeTechnicalReason(technicalReason);
    if (detailSentences.length >= 1) {
      const shortenedDetail = normalizeDetailDescription(detailSentences[0]);
      detailDescription = shortenedDetail || detailDescription;
    }
  }

  if (technicalReason && technicalReason === detailDescription) {
    technicalReason = '';
  }
  const priority = readNumber(value.priority, safeIndex);
  const evidenceStrength = normalizeEvidenceStrength(
    value.evidenceStrength ?? value.visualClarity ?? value.confidence ?? normalizeRiskLevel(value.riskLevel),
  );

  if (!title || !description || !detailDescription) {
    return null;
  }

  return {
    id,
    title,
    description,
    detailDescription,
    technicalReason: technicalReason || undefined,
    evidenceStrength,
    category,
    area,
    marker,
    priority,
  };
}

export function parseVisionPayloadFromUnknown(value: unknown): {
  hasVisibleEvidence: boolean;
  summary: string;
  caution: string;
  suspicions: VisionSuspicion[];
} | null {
  if (!isObject(value)) {
    return null;
  }

  const summary = normalizeUserFacingSentence(readString(value.summary));
  const caution = normalizeUserFacingSentence(readString(value.caution));
  const rawSuspicions = Array.isArray(value.suspicions) ? value.suspicions : [];
  const suspicions = normalizeVisionSuspicions(
    rawSuspicions.map((entry, index) => toVisionSuspicion(entry, index)).filter(Boolean) as VisionSuspicion[],
  );

  if (!summary || !caution) {
    return null;
  }

  const hasVisibleEvidenceFromModel = typeof value.hasVisibleEvidence === 'boolean' ? value.hasVisibleEvidence : false;
  const hasVisibleEvidence = hasVisibleEvidenceFromModel && suspicions.length > 0;

  return {
    hasVisibleEvidence,
    summary,
    caution,
    suspicions,
  };
}
