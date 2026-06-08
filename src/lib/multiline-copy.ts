/** 한 줄 문자열 또는 줄바꿈 단위 문자열 배열 */
export type MultilineCopy = string | readonly string[];

export function isMultilineCopyLines(value: MultilineCopy): value is readonly string[] {
  return Array.isArray(value);
}

/** 클립보드·문자열 변환용 — 빈 줄은 유지 */
export function multilineCopyToPlainText(copy: MultilineCopy): string {
  if (isMultilineCopyLines(copy)) return copy.join('\n');
  return copy;
}
