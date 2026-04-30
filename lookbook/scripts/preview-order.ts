// Dry-run: query nail DB, print arts sorted by 순서 (no image download).
import { Client } from "@notionhq/client";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const dbId = process.env.NOTION_DATABASE_ID!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOrder(prop: any): number {
  const raw = prop?.select?.name;
  if (!raw) return Number.MAX_SAFE_INTEGER;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

async function main() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion.databases.query({
      database_id: dbId,
      start_cursor: cursor,
      page_size: 100,
      filter: { property: "배포", checkbox: { equals: true } },
    });
    rows.push(...res.results);
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  const items = rows.map((p) => ({
    name:
      p.properties["이름"]?.title?.map((t: { plain_text: string }) => t.plain_text).join("") ?? "",
    category: p.properties["구분"]?.select?.name ?? "",
    theme: p.properties["테마"]?.select?.name ?? "",
    price: p.properties["가격"]?.select?.name ?? "",
    season: p.properties["시기"]?.select?.name ?? "",
    order: getOrder(p.properties["순서"]),
    rawOrder: p.properties["순서"]?.select?.name ?? "",
  }));

  items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  console.log(`${items.length}개 (순서 오름차순)\n`);
  console.log("# | 순서 | 시기 | 가격 | 테마 | 이름");
  items.slice(0, 30).forEach((it, i) => {
    const ord = it.order === Number.MAX_SAFE_INTEGER ? "—" : String(it.order);
    console.log(
      `${String(i + 1).padStart(3)} | ${ord.padStart(2)} | ${it.season} | ${it.price} | ${it.theme} | ${it.name}`
    );
  });
  const unset = items.filter((i) => i.order === Number.MAX_SAFE_INTEGER).length;
  if (unset > 0) console.log(`\n순서 미지정: ${unset}개 (가장 뒤로)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
