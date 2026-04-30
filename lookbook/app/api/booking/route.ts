import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contactSchema } from "@/lib/booking/contactSchema";
import { generateRequestId } from "@/lib/booking/requestId";
import { toUuid } from "@/lib/booking/notionId";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const yesNo = z.enum(["yes", "no"]);

const precheckPayloadSchema = z.object({
  gelRemoval: yesNo.optional(),
  hasExtension: yesNo.optional(),
  hasPartsToRemove: yesNo.optional(),
  handPhoto: z
    .object({
      fileUploadId: z.string().min(1),
      filename: z.string(),
    })
    .optional(),
});

const draftSchema = z.discriminatedUnion("track", [
  z.object({
    track: z.literal("existing"),
    existing: z.object({
      artId: z.string().regex(/^[0-9a-f]{32}$/i, "잘못된 아트 ID"),
      artName: z.string(),
      coverImage: z.string(),
      variationMemo: z.string(),
    }),
    contact: contactSchema,
    precheck: precheckPayloadSchema,
  }),
  z.object({
    track: z.literal("custom"),
    custom: z.object({
      images: z
        .array(
          z.object({
            fileUploadId: z.string().min(1),
            filename: z.string(),
          })
        )
        .max(5),
      memo: z.string(),
    }),
    contact: contactSchema,
    precheck: precheckPayloadSchema,
  }),
]);

type ImageBlock = {
  object: "block";
  type: "image";
  image: { type: "file_upload"; file_upload: { id: string } };
};

export async function POST(req: NextRequest) {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_BOOKING_DATABASE_ID;
  if (!token || !dbId) {
    console.error("[booking] env missing", {
      hasToken: !!token,
      hasDbId: !!dbId,
    });
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const parsed = draftSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[booking] validation failed", parsed.error.issues);
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다" },
      { status: 400 }
    );
  }
  const draft = parsed.data;

  const notion = new Client({ auth: token });
  const requestId = generateRequestId();

  const props: Record<string, unknown> = {
    첨부사진확인: { title: [{ text: { content: requestId } }] },
    유형: {
      select: { name: draft.track === "existing" ? "이달아" : "타샵디자인" },
    },
    고객명: { rich_text: [{ text: { content: draft.contact.name } }] },
    연락처: { phone_number: draft.contact.phone },
  };
  if (draft.contact.branch) {
    props["지점"] = { select: { name: draft.contact.branch } };
  }
  if (draft.contact.visitDate) {
    props["방문일자"] = { date: { start: draft.contact.visitDate } };
  }
  const precheckLine = formatPrecheck(draft.precheck);
  const memoCombined = [precheckLine, draft.contact.memo]
    .filter((s): s is string => !!s && s.length > 0)
    .join("\n\n");
  if (memoCombined) {
    props["예약자 메모"] = {
      rich_text: [{ text: { content: memoCombined } }],
    };
  }
  if (draft.track === "existing") {
    try {
      props["이달아 유형"] = {
        relation: [{ id: toUuid(draft.existing.artId) }],
      };
    } catch (e) {
      console.error("[booking] artId conversion failed", e);
      return NextResponse.json(
        { error: "선택한 아트 정보가 올바르지 않습니다" },
        { status: 400 }
      );
    }
    if (draft.existing.variationMemo) {
      props["이달아 메모"] = {
        rich_text: [{ text: { content: draft.existing.variationMemo } }],
      };
    }
  } else if (draft.track === "custom") {
    if (draft.custom.memo) {
      props["디자인 메모"] = {
        rich_text: [{ text: { content: draft.custom.memo } }],
      };
    }
  }

  let pageId: string;
  try {
    const page = await notion.pages.create({
      parent: { database_id: dbId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      properties: props as any,
    });
    pageId = page.id;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[booking] pages.create failed", msg);
    return NextResponse.json(
      { error: "예약 접수에 실패했습니다" },
      { status: 502 }
    );
  }

  const handPhoto =
    draft.precheck.gelRemoval === "yes" ? draft.precheck.handPhoto : undefined;
  const designImages =
    draft.track === "custom" ? draft.custom.images : [];
  const allUploadIds: { fileUploadId: string }[] = [
    ...(handPhoto ? [{ fileUploadId: handPhoto.fileUploadId }] : []),
    ...designImages,
  ];

  if (allUploadIds.length > 0) {
    const children: ImageBlock[] = allUploadIds.map((img) => ({
      object: "block",
      type: "image",
      image: { type: "file_upload", file_upload: { id: img.fileUploadId } },
    }));
    try {
      await notion.blocks.children.append({
        block_id: pageId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        children: children as any,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[booking] image append failed", msg);
      // Roll back: archive the orphan text-only row
      try {
        await notion.pages.update({ page_id: pageId, archived: true });
      } catch (rollbackErr) {
        console.error("[booking] rollback failed", rollbackErr);
      }
      const isExpired = /expired|not.*found|no longer/i.test(msg);
      return NextResponse.json(
        {
          error: isExpired
            ? "이미지 업로드 후 시간이 너무 경과했습니다. 다시 업로드해주세요."
            : "이미지 첨부에 실패했습니다",
        },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ requestId, pageId });
}

function formatPrecheck(p: z.infer<typeof precheckPayloadSchema>): string {
  const yn = (v: "yes" | "no" | undefined) => (v === "yes" ? "O" : "X");
  if (!p.gelRemoval) return "";
  if (p.gelRemoval === "no") return "[사전확인] 젤제거 X";
  return `[사전확인] 젤제거 O / 연장 ${yn(p.hasExtension)} / 파츠 ${yn(p.hasPartsToRemove)}`;
}
