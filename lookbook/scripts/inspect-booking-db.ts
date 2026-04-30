import { Client } from "@notionhq/client";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const notion = new Client({ auth: process.env.NOTION_TOKEN! });
const dbId = process.env.NOTION_BOOKING_DATABASE_ID!;

async function main() {
  const db = (await notion.databases.retrieve({
    database_id: dbId,
  })) as { properties: Record<string, { type: string; name: string }> };
  console.log("DB:", dbId);
  console.log("Properties:");
  for (const [name, prop] of Object.entries(db.properties)) {
    console.log(`  - ${name} (${prop.type})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
