function pad(n: number, w = 2): string {
  return n.toString().padStart(w, "0");
}

export function generateRequestId(now: Date = new Date()): string {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = kst.getUTCFullYear();
  const m = pad(kst.getUTCMonth() + 1);
  const d = pad(kst.getUTCDate());
  const hh = pad(kst.getUTCHours());
  const mm = pad(kst.getUTCMinutes());
  const ss = pad(kst.getUTCSeconds());
  const rand = Math.random().toString(36).slice(2, 6);
  return `REQ-${y}${m}${d}-${hh}${mm}${ss}-${rand}`;
}
