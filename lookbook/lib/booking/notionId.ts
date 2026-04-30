export function toUuid(hex32: string): string {
  const clean = hex32.replace(/-/g, "");
  if (clean.length !== 32 || !/^[0-9a-f]{32}$/i.test(clean)) {
    throw new Error(`Invalid Notion id: ${hex32}`);
  }
  return [
    clean.slice(0, 8),
    clean.slice(8, 12),
    clean.slice(12, 16),
    clean.slice(16, 20),
    clean.slice(20, 32),
  ].join("-");
}
