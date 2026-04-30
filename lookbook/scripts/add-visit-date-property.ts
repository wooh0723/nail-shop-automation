// One-shot: add `방문일자` (Date) property to the bookings DB.
// Run: `npx tsx scripts/add-visit-date-property.ts`
import { Client } from "@notionhq/client";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const DB_ID = process.env.NOTION_BOOKING_DATABASE_ID!;

if (!NOTION_TOKEN || !DB_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_BOOKING_DATABASE_ID");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

async function main() {
  const db = await notion.databases.retrieve({ database_id: DB_ID });
  const existing = "방문일자" in (db as { properties: Record<string, unknown> }).properties;
  if (existing) {
    console.log("방문일자 이미 존재 — skip");
    return;
  }
  await notion.databases.update({
    database_id: DB_ID,
    properties: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      방문일자: { date: {} } as any,
    },
  });
  console.log("✓ 방문일자 (Date) property added");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
