"use client";

import { useRef, useState } from "react";
import type { CustomImage } from "@/lib/booking/types";
import { makeThumbnail } from "@/lib/booking/imageThumbnail";

const MAX_IMAGES = 5;
const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

type Props = {
  images: CustomImage[];
  onChange: (next: CustomImage[]) => void;
};

type Pending = {
  id: string;
  filename: string;
  previewDataUrl?: string;
  status: "uploading" | "error";
  error?: string;
};

export default function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setNotice(null);

    const remaining = MAX_IMAGES - images.length - pending.length;
    if (remaining <= 0) {
      setNotice(`최대 ${MAX_IMAGES}장까지 업로드할 수 있어요.`);
      return;
    }

    const arr = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setNotice(`최대 ${MAX_IMAGES}장 — 앞에서 ${remaining}장만 추가했어요.`);
    }

    for (const f of arr) {
      if (f.size > MAX_BYTES) {
        setNotice(`${f.name} — 20MB를 초과해요.`);
        return;
      }
    }

    const tempIds = arr.map(
      () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    );
    setPending((prev) => [
      ...prev,
      ...arr.map((f, i) => ({
        id: tempIds[i],
        filename: f.name,
        status: "uploading" as const,
      })),
    ]);

    // Run uploads in parallel, then commit the whole batch in a single
    // onChange call. Per-file onChange would race because each closure
    // captures a stale `images` snapshot, dropping all but the last result.
    const results = await Promise.all(
      arr.map((f, i) => uploadOne(f, tempIds[i]))
    );
    const successes = results.filter(
      (r): r is CustomImage => r !== null
    );
    if (successes.length > 0) {
      onChange([...images, ...successes]);
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadOne(
    file: File,
    tempId: string
  ): Promise<CustomImage | null> {
    const previewDataUrl = await makeThumbnail(file);
    setPending((prev) =>
      prev.map((p) => (p.id === tempId ? { ...p, previewDataUrl } : p))
    );

    const form = new FormData();
    form.append("file", file, file.name);

    let res: Response;
    try {
      res = await fetch("/api/upload", { method: "POST", body: form });
    } catch {
      setPending((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? { ...p, status: "error", error: "네트워크 오류" }
            : p
        )
      );
      return null;
    }

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setPending((prev) =>
        prev.map((p) =>
          p.id === tempId
            ? {
                ...p,
                status: "error",
                error: data.error || "업로드 실패",
              }
            : p
        )
      );
      return null;
    }

    const data = (await res.json()) as { fileUploadId: string; filename: string };
    setPending((prev) => prev.filter((p) => p.id !== tempId));
    return {
      fileUploadId: data.fileUploadId,
      filename: data.filename,
      previewDataUrl,
    };
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function removePending(id: string) {
    setPending((prev) => prev.filter((p) => p.id !== id));
  }

  const total = images.length + pending.length;
  const canAdd = total < MAX_IMAGES;

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {images.map((img, i) => (
          <div
            key={img.fileUploadId}
            className="relative aspect-square overflow-hidden rounded-lg bg-[#f0f0f0]"
          >
            {img.previewDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.previewDataUrl}
                alt={img.filename}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center break-all px-1 text-center text-[10px] text-foreground/50">
                {img.filename}
              </div>
            )}
            <button
              type="button"
              onClick={() => removeImage(i)}
              aria-label="이미지 삭제"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}

        {pending.map((p) => (
          <div
            key={p.id}
            className="relative aspect-square overflow-hidden rounded-lg bg-[#f0f0f0]"
          >
            {p.previewDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.previewDataUrl}
                alt=""
                className="h-full w-full object-cover opacity-50"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              {p.status === "uploading" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
              ) : (
                <div className="px-2 text-center">
                  <p className="text-[10px] leading-tight text-red-600">
                    {p.error}
                  </p>
                  <button
                    type="button"
                    onClick={() => removePending(p.id)}
                    className="mt-1 text-[10px] text-foreground/60 underline"
                  >
                    제거
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="magnetic-btn flex aspect-square items-center justify-center rounded-lg border border-dashed border-foreground/20 text-3xl font-extralight text-foreground/40"
            aria-label="이미지 추가"
          >
            +
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-[11px] text-foreground/50">
        최대 {MAX_IMAGES}장 · 각 20MB 이하 · {total}/{MAX_IMAGES}
      </p>
      {notice && (
        <p className="mt-1 text-[11px] text-red-600">{notice}</p>
      )}
    </div>
  );
}
