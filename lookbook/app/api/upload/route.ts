import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOTION_API = "https://api.notion.com/v1";
const MAX_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME = /^image\/(jpeg|png|webp|heic|heif)$/;

export async function POST(req: NextRequest) {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    console.error("[upload] NOTION_TOKEN missing");
    return NextResponse.json({ error: "서버 설정 오류" }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "파일이 20MB를 초과합니다" },
      { status: 413 }
    );
  }
  if (!ALLOWED_MIME.test(file.type)) {
    return NextResponse.json(
      { error: "지원하지 않는 이미지 형식입니다 (JPG/PNG/WebP/HEIC만 가능)" },
      { status: 415 }
    );
  }

  // 1) Create file_upload handle
  const createRes = await fetch(`${NOTION_API}/file_uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename: file.name, content_type: file.type }),
  });
  if (!createRes.ok) {
    const detail = await createRes.text();
    console.error(
      "[upload] create handle failed",
      createRes.status,
      detail.slice(0, 300)
    );
    return NextResponse.json(
      { error: "업로드 준비에 실패했습니다" },
      { status: 502 }
    );
  }
  const created = (await createRes.json()) as {
    id: string;
    upload_url: string;
  };

  // 2) Send bytes — Notion's upload_url lives on api.notion.com and still
  // requires the Bearer token + Notion-Version. Don't set Content-Type:
  // fetch will fill in the multipart boundary automatically.
  const sendForm = new FormData();
  sendForm.append("file", file, file.name);
  const sendRes = await fetch(created.upload_url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
    },
    body: sendForm,
  });
  if (!sendRes.ok) {
    const detail = await sendRes.text();
    console.error(
      "[upload] send bytes failed",
      sendRes.status,
      detail.slice(0, 300)
    );
    return NextResponse.json(
      { error: "이미지 업로드에 실패했습니다" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    fileUploadId: created.id,
    filename: file.name,
  });
}
