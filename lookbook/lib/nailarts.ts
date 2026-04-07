import { readFileSync } from "fs";
import { join } from "path";

export interface NailArt {
  id: string;
  name: string;
  theme: string;
  price: string;
  season: string;
  artist: string;
  coverImage: string;
  detailImages: string[];
  materials: string[];
  purchaseLinks: string[];
}

export function getNailArts(): NailArt[] {
  const filePath = join(process.cwd(), "public/data/nailarts.json");
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
