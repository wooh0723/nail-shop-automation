"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { BookingDraft } from "@/lib/booking/types";

type Props = {
  draft: BookingDraft;
};

export default function SummaryCard({ draft }: Props) {
  const router = useRouter();

  if (draft.track === "existing" && draft.existing) {
    return (
      <div className="rounded-2xl border border-foreground/10 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[.15em] text-foreground/50">
            선택한 아트
          </p>
          <button
            type="button"
            onClick={() => router.push("/?mode=select")}
            className="text-[11px] text-foreground/60 underline"
          >
            변경
          </button>
        </div>
        <div className="flex gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[#f0f0f0]">
            {draft.existing.coverImage && (
              <Image
                src={draft.existing.coverImage}
                alt={draft.existing.artName || "네일아트"}
                width={120}
                height={120}
                sizes="64px"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {draft.existing.artName || "—"}
            </p>
            {draft.existing.variationMemo && (
              <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-foreground/60">
                {draft.existing.variationMemo}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (draft.track === "custom" && draft.custom) {
    const imgs = draft.custom.images || [];
    return (
      <div className="rounded-2xl border border-foreground/10 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[.15em] text-foreground/50">
            참고 이미지
          </p>
          <button
            type="button"
            onClick={() => router.push("/book/custom")}
            className="text-[11px] text-foreground/60 underline"
          >
            변경
          </button>
        </div>
        {imgs.length > 0 ? (
          <div className="grid grid-cols-5 gap-1.5">
            {imgs.map((img) => (
              <div
                key={img.fileUploadId}
                className="aspect-square overflow-hidden rounded bg-[#f0f0f0]"
              >
                {img.previewDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.previewDataUrl}
                    alt={img.filename}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center break-all px-1 text-center text-[8px] text-foreground/50">
                    {img.filename}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[12px] text-foreground/50">이미지 없음 (메모만 전달)</p>
        )}
        {draft.custom.memo && (
          <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed text-foreground/60">
            {draft.custom.memo}
          </p>
        )}
      </div>
    );
  }

  return null;
}
