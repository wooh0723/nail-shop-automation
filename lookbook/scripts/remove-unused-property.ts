// One-shot: remove `참고 이미지` (files) property from the bookings DB.
// The booking API attaches images as page-body image blocks, not as files prop.
// Run: `npx tsx scripts/remove-unused-property.ts`
import { Client } from "@notionhq/client";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const dbId = process.env.NOTION_BOOKING_DATABASE_ID!;

async function main() {
  const db = (await notion.databases.retrieve({
    database_id: dbId,
  })) as { properties: Record<string, { type: string }> };
  const target = "참고 이미지";
  if (!(target in db.properties)) {
    console.log(`${target} already absent — skip`);
    return;
  }
  await notion.databases.update({
    database_id: dbId,
    properties: {
      // Setting a property to null removes it.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [target]: null as any,
    },
  });
  console.log(`✓ removed ${target}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
