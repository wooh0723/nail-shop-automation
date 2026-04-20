import { Client } from "@notionhq/client";
import {
  PageObjectResponse,
  BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";
import sharp from "sharp";

// Load .env.local
import { config } from "dotenv";
config({ path: path.join(process.cwd(), ".env.local") });

const NOTION_TOKEN = process.env.NOTION_TOKEN!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  console.error("Missing NOTION_TOKEN or NOTION_DATABASE_ID");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_TOKEN });

const OUT_JSON = path.join(process.cwd(), "public/data/nailarts.json");
const OUT_IMAGES = path.join(process.cwd(), "public/images/nail");

interface NailArt {
  id: string;
  name: string;
  category: string;
  theme: string;
  price: string;
  season: string;
  artist: string;
  coverImage: string;
  coverWidth: number;
  coverHeight: number;
  detailImages: string[];
  materials: string[];
  purchaseLinks: string[];
}

function downloadToBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          downloadToBuffer(res.headers.location!).then(resolve).catch(reject);
          return;
        }
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

/** 가로 750px 리사이즈 + WebP 변환 (상세 이미지용) */
async function processImage(buf: Buffer, dest: string): Promise<{ width: number; height: number }> {
  const { width, height } = await sharp(buf)
    .resize({ width: 750 })
    .webp({ quality: 85 })
    .toFile(dest);
  return { width, height };
}

/** 커버 이미지: 가로 750px 리사이즈 + WebP 변환 (크롭 없이 원본 비율 보존) */
async function processCoverImage(
  buf: Buffer,
  dest: string
): Promise<{ width: number; height: number }> {
  const { width, height } = await sharp(buf)
    .resize({ width: 750, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(dest);
  return { width, height };
}

function getSelectValue(prop: any): string {
  return prop?.select?.name ?? "";
}

function getTitle(prop: any): string {
  return prop?.title?.map((t: any) => t.plain_text).join("") ?? "";
}

async function fetchAllPages(): Promise<PageObjectResponse[]> {
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      start_cursor: cursor,
      page_size: 100,
      filter: {
        property: "배포",
        checkbox: { equals: true },
      },
    });
    pages.push(...(res.results as PageObjectResponse[]));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return pages;
}

async function fetchBlocks(pageId: string): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...(res.results as BlockObjectResponse[]));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return blocks;
}

async function processPage(page: PageObjectResponse): Promise<NailArt> {
  const props = page.properties;
  const pageId = page.id.replace(/-/g, "");

  // Cover image
  let coverImage = "";
  let coverWidth = 0;
  let coverHeight = 0;
  const coverUrl =
    page.cover?.type === "external"
      ? page.cover.external.url
      : page.cover?.type === "file"
      ? page.cover.file.url
      : null;

  if (coverUrl) {
    const coverDest = path.join(OUT_IMAGES, `${pageId}-cover.webp`);
    try {
      const buf = await downloadToBuffer(coverUrl);
      const dims = await processCoverImage(buf, coverDest);
      coverImage = `/images/nail/${pageId}-cover.webp`;
      coverWidth = dims.width;
      coverHeight = dims.height;
    } catch (e) {
      console.warn(`  cover 다운로드 실패: ${pageId}`, e);
    }
  }

  // Blocks
  const blocks = await fetchBlocks(page.id);
  const detailImages: string[] = [];
  const materials: string[] = [];
  const purchaseLinks: string[] = [];

  const detailImageDims: { url: string; width: number; height: number }[] = [];
  let imgIndex = 0;
  for (const block of blocks) {
    if (block.type === "image") {
      const imgBlock = block as any;
      const imgUrl =
        imgBlock.image.type === "external"
          ? imgBlock.image.external.url
          : imgBlock.image.file.url;
      const dest = path.join(OUT_IMAGES, `${pageId}-${imgIndex}.webp`);
      try {
        const buf = await downloadToBuffer(imgUrl);
        const dims = await processImage(buf, dest);
        const url = `/images/nail/${pageId}-${imgIndex}.webp`;
        detailImages.push(url);
        detailImageDims.push({ url, width: dims.width, height: dims.height });
        imgIndex++;
      } catch (e) {
        console.warn(`  이미지 다운로드 실패: ${pageId}-${imgIndex}`, e);
      }
    } else if (block.type === "bulleted_list_item") {
      const text = (block as any).bulleted_list_item.rich_text
        .map((t: any) => t.plain_text)
        .join("");
      if (text) materials.push(text);
    } else if (block.type === "bookmark") {
      const url = (block as any).bookmark.url;
      if (url) purchaseLinks.push(url);
    } else if (block.type === "paragraph") {
      const richText = (block as any).paragraph.rich_text;
      for (const t of richText) {
        if (t.href) purchaseLinks.push(t.href);
      }
    }
  }

  return {
    id: pageId,
    name: getTitle(props["이름"]),
    category: getSelectValue(props["구분"]) || "NAIL",
    theme: getSelectValue(props["테마"]),
    price: getSelectValue(props["가격"]),
    season: getSelectValue(props["시기"]),
    artist: getSelectValue(props["제안자"]),
    coverImage,
    coverWidth,
    coverHeight,
    detailImages,
    materials,
    purchaseLinks,
  };
}

async function main() {
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.mkdirSync(OUT_IMAGES, { recursive: true });

  console.log("노션 DB 쿼리 중...");
  const pages = await fetchAllPages();
  console.log(`총 ${pages.length}개 페이지 발견`);

  const results: NailArt[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const name = getTitle(page.properties["이름"]);
    console.log(`[${i + 1}/${pages.length}] ${name || page.id}`);
    const art = await processPage(page);
    results.push(art);
  }

  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2), "utf-8");
  console.log(`\n완료: ${results.length}개 → ${OUT_JSON}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
