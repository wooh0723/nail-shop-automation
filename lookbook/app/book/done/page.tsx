"use client";

import { useRouter } from "next/navigation";
import { useBookingDraft } from "@/lib/booking/useBookingDraft";

export default function DonePage() {
  const router = useRouter();
  const { clear } = useBookingDraft();

  function another() {
    clear();
    router.push("/book");
  }

  return (
    <div className="mx-auto max-w-[390px] px-5 pb-24 pt-16">
      <div className="stagger-reveal">
        <h1 className="font-['Cormorant_Garamond'] text-3xl font-light tracking-tight">
          접수 완료
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-foreground/70">
          방문 전 준비에 활용됩니다.
          <br />
          이 화면을 닫으셔도 좋아요.
        </p>

        <div className="mt-10">
          <button
            type="button"
            onClick={another}
            className="magnetic-btn h-14 w-full rounded-2xl bg-foreground text-sm tracking-wide text-background"
          >
            한 분 더 신청하기
          </button>
        </div>
      </div>
    </div>
  );
}
