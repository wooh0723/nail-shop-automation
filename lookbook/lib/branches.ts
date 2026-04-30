export const BRANCHES = ["홍대", "건대", "신논현", "발산", "신림"] as const;

export type Branch = (typeof BRANCHES)[number];
