/**
 * Format relative time in Korean (e.g., "5분 전", "3일 전")
 * Clamps to minimum 1 minute and maximum 1 month (30 days)
 */
export function formatRelativeTimeKo(date: Date | string, now = new Date()): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - dateObj.getTime();
  const minMs = 60 * 1000;
  const hourMs = 60 * minMs;
  const dayMs = 24 * hourMs;
  const monthMs = 30 * dayMs;

  // Clamp: minimum 1 minute, maximum 30 days (1 month)
  const clamped = Math.min(Math.max(diffMs, minMs), monthMs);

  if (clamped < hourMs) {
    const m = Math.floor(clamped / minMs);
    return `${m}분 전`;
  }
  if (clamped < dayMs) {
    const h = Math.floor(clamped / hourMs);
    return `${h}시간 전`;
  }
  if (clamped < monthMs) {
    const d = Math.floor(clamped / dayMs);
    return `${d}일 전`;
  }
  return `1개월 전`;
}

