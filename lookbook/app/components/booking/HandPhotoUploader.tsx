"use client";

import { useRef, useState } from "react";
import type { HandPhoto } from "@/lib/booking/types";
import { makeThumbnail, resizeForUpload } from "@/lib/booking/imageThumbnail";

const MAX_BYTES = 20 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

type Props = {
  value: HandPhoto | undefined;
  onChange: (next: HandPhoto | undefined) => void;
};

type Status = "idle" | "uploading" | "error";

export default function HandPhotoUploader({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | undefined>();

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (file.size > MAX_BYTES) {
      setStatus("error");
      setError("20MB를 초과해요.");
      return;
    }

    const previewDataUrl = await makeThumbnail(file);
    setPendingPreview(previewDataUrl);
    setStatus("uploading");

    const upload = await resizeForUpload(file);
    const form = new FormData();
    form.append("file", upload, upload.name);

    let res: Response;
    try {
      res = await fetch("/api/upload", { method: "POST", body: form });
    } catch {
      setStatus("error");
      setError("네트워크 오류");
      return;
    }

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setError(data.error || "업로드 실패");
      return;
    }

    const data = (await res.json()) as { fileUploadId: string; filename: string };
    setStatus("idle");
    setPendingPreview(undefined);
    onChange({
      fileUploadId: data.fileUploadId,
      filename: data.filename,
      previewDataUrl,
    });

    if (inputRef.current) inputRef.current.value = "";
  }

  function clear() {
    onChange(undefined);
    setStatus("idle");
    setError(null);
    setPendingPreview(undefined);
    if (inputRef.current) inputRef.current.value = "";
  }

  const previewUrl = value?.previewDataUrl ?? pendingPreview;

  return (
    <div>
      {previewUrl ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#f0f0f0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={value?.filename || "현재 손 미리보기"}
            className={`h-full w-full object-cover ${
              status === "uploading" ? "opacity-50" : ""
            }`}
          />
          {status === "uploading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
            </div>
          )}
          {status !== "uploading" && (
            <button
              type="button"
              onClick={clear}
              aria-label="사진 삭제"
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm text-white"
            >
              ×
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="magnetic-btn flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-foreground/20 text-foreground/50"
          aria-label="현재 손사진 첨부"
        >
          <span className="text-3xl font-extralight">+</span>
          <span className="text-[12px]">현재 손사진 첨부</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />

      <p className="mt-2 text-[11px] text-foreground/50">20MB 이하</p>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </div>
  );
}
