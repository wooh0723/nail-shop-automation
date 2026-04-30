"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { NailArt } from "@/lib/nailarts";

type Props = {
  art: NailArt | null;
  onClose: () => void;
  onConfirm: (variationMemo: string) => void;
};

export default function SelectArtModal({ art, onClose, onConfirm }: Props) {
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (!art) return;
    // Reset memo each time a new art is selected.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMemo("");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [art]);

  if (!art) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[340px] rounded-2xl bg-background p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[5/2] overflow-hidden rounded-lg bg-[#f0f0f0]">
          {art.coverImage && (
            <Image
              src={art.coverImage}
              alt={art.name || "네일아트"}
              width={art.coverWidth > 0 ? art.coverWidth : 750}
              height={art.coverHeight > 0 ? art.coverHeight : 300}
              sizes="300px"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="요청사항 있으시면 남겨주세요"
          maxLength={80}
          className="mt-4 h-11 w-full rounded-lg border border-foreground/15 bg-transparent px-3 text-sm placeholder:text-foreground/30 focus:border-foreground/40 focus:outline-none"
          aria-label="변형 요청 메모"
        />

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="magnetic-btn h-12 flex-1 rounded-xl border border-foreground/15 text-sm"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(memo.trim())}
            className="magnetic-btn h-12 flex-1 rounded-xl bg-foreground text-sm text-background"
          >
            이 아트로 진행
          </button>
        </div>
      </div>
    </div>
  );
}
