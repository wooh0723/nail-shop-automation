export const UPLOAD_TTL_MS = 60 * 60 * 1000;
export const UPLOAD_WARN_AT_MS = 50 * 60 * 1000;

export function isExpiringSoon(
  uploadedAt: number | undefined,
  now: number = Date.now()
): boolean {
  if (!uploadedAt) return false;
  return now - uploadedAt >= UPLOAD_WARN_AT_MS;
}

export function isExpired(
  uploadedAt: number | undefined,
  now: number = Date.now()
): boolean {
  if (!uploadedAt) return false;
  return now - uploadedAt >= UPLOAD_TTL_MS;
}
