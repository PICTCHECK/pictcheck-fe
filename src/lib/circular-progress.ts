/**
 * strokeLinecap="round"일 때 끝이 호를 넘어 꽉 차 보이는 것을 줄이기 위한 arc 보정.
 * 표시 숫자(%)는 그대로 두고, stroke 길이만 일정량 줄인다. 진행률이 올라갈수록 arc도 항상 길어진다.
 */
export function getRoundCapAdjustedArcPercent(
  percent: number,
  circumference: number,
  strokeWidth: number,
): number {
  const p = Math.min(100, Math.max(0, percent));
  if (p >= 100) return 100;
  const capBleedPercent = (strokeWidth / circumference) * 100;
  return Math.max(0, p - capBleedPercent);
}
