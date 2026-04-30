"use client";

import { useRouter } from "next/navigation";
import { useBookingDraft } from "@/lib/booking/useBookingDraft";

export default function BookPage() {
  const router = useRouter();
  const { patch } = useBookingDraft();

  const goExisting = () => {
    patch({ track: "existing" });
    router.push("/?mode=select");
  };

  const goCustom = () => {
    patch({ track: "custom" });
    router.push("/book/custom");
  };

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[390px] flex-col px-5 pb-16 pt-10">
      <div className="stagger-reveal flex flex-1 flex-col">
        <span
          className="mb-3 text-[20px] font-extralight tracking-tight text-[#bbb] uppercase"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Signicho Nail
        </span>
        <header className="mb-12">
          <h1 className="font-['Cormorant_Garamond'] text-4xl font-light tracking-tight">
            아트/디자인 사전 접수
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70">
            오시기 전 어떤 디자인을 원하시는지 알려주세요.
          </p>
        </header>

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            onClick={goExisting}
            className="magnetic-btn h-14 rounded-2xl bg-foreground text-sm tracking-wide text-background"
          >
            시그니초 이달의 아트가 좋아요
          </button>
          <button
            type="button"
            onClick={goCustom}
            className="magnetic-btn h-14 rounded-2xl border border-foreground/20 bg-transparent text-sm tracking-wide text-foreground"
          >
            원하는 디자인이 따로 있어요
          </button>
        </div>
      </div>
    </div>
  );
}
