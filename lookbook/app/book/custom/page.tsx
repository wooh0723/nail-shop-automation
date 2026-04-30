"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/app/components/booking/BackButton";
import ImageUploader from "@/app/components/booking/ImageUploader";
import { useBookingDraft } from "@/lib/booking/useBookingDraft";
import { isExpiringSoon } from "@/lib/booking/uploadGuard";
import type { CustomImage } from "@/lib/booking/types";

export default function CustomTrackPage() {
  const router = useRouter();
  const { draft, patch, hydrated } = useBookingDraft();
  const [images, setImages] = useState<CustomImage[]>([]);
  const [memo, setMemo] = useState("");
  const [showExpireWarning, setShowExpireWarning] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (draft.custom) {
      setImages(draft.custom.images || []);
      setMemo(draft.custom.memo || "");
      setShowExpireWarning(isExpiringSoon(draft.custom.uploadedAt));
    }
  }, [hydrated, draft.custom]);

  function persist(nextImages: CustomImage[], nextMemo: string) {
    const previousUploadedAt = draft.custom?.uploadedAt;
    const uploadedAt =
      nextImages.length === 0
        ? undefined
        : previousUploadedAt ?? Date.now();
    patch({
      track: "custom",
      custom: { images: nextImages, memo: nextMemo, uploadedAt },
    });
    setShowExpireWarning(isExpiringSoon(uploadedAt));
  }

  function handleImagesChange(next: CustomImage[]) {
    setImages(next);
    persist(next, memo);
  }

  function handleMemoChange(value: string) {
    setMemo(value);
    persist(images, value);
  }

  function clearImages() {
    setImages([]);
    persist([], memo);
  }

  function handleNext() {
    persist(images, memo);
    router.push("/book/contact");
  }

  return (
    <div className="mx-auto max-w-[390px] px-5 pb-24 pt-4">
      <div className="mb-4">
        <BackButton to="/book" />
      </div>

      <div className="stagger-reveal">
        <header className="mb-6">
          <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-tight">
            원하는 디자인이 있어요
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            참고 이미지(최대 5장)와 설명을 남겨주세요.
          </p>
        </header>

        {showExpireWarning && (
          <div className="mb-4 rounded-lg border border-yellow-700/30 bg-yellow-50/70 p-3 text-[12px] leading-relaxed text-yellow-900">
            <p>
              이미지 업로드 후 시간이 오래 경과했어요.
              <br />
              제출 시 실패할 수 있어 다시 업로드해주세요.
            </p>
            <button
              type="button"
              onClick={clearImages}
              className="mt-2 underline"
            >
              업로드 초기화
            </button>
          </div>
        )}

        <section className="mb-6">
          <ImageUploader images={images} onChange={handleImagesChange} />
        </section>

        <section className="mb-8">
          <label
            htmlFor="custom-memo"
            className="mb-2 block text-sm text-foreground/70"
          >
            디자인 메모
          </label>
          <textarea
            id="custom-memo"
            value={memo}
            onChange={(e) => handleMemoChange(e.target.value)}
            rows={4}
            placeholder="원하는 컬러, 분위기 등을 자유롭게 적어주세요."
            maxLength={500}
            className="w-full rounded-lg border border-foreground/15 bg-transparent p-3 text-sm placeholder:text-foreground/30 focus:border-foreground/40 focus:outline-none"
          />
        </section>

        <button
          type="button"
          onClick={handleNext}
          className="magnetic-btn h-14 w-full rounded-2xl bg-foreground text-sm tracking-wide text-background"
        >
          다음
        </button>
      </div>
    </div>
  );
}
