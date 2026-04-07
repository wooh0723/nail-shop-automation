"use client";

import { useRef, useCallback, useState, useEffect } from "react";

export const PRICES = ["39아트", "59아트", "79아트"] as const;
export type PriceIndex = 0 | 1 | 2;

export default function PriceSwiper({
  priceIndex,
  onChange,
  children,
}: {
  priceIndex: PriceIndex;
  onChange: (idx: PriceIndex) => void;
  children: React.ReactNode;
}) {
  const touchStartX = useRef<number>(0);
  const [showNudge, setShowNudge] = useState(false);

  const prev = useCallback(
    () => priceIndex > 0 && onChange((priceIndex - 1) as PriceIndex),
    [priceIndex, onChange]
  );
  const next = useCallback(
    () => priceIndex < 2 && onChange((priceIndex + 1) as PriceIndex),
    [priceIndex, onChange]
  );

  // 1.2초 후 nudge 트리거
  useEffect(() => {
    const timer = setTimeout(() => setShowNudge(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Price buttons — 선택된 가격 크고 bold, 나머지 작고 흐림 */}
      <div className="flex items-center justify-center gap-6 py-6">
        {PRICES.map((price, i) => {
          const isActive = i === priceIndex;
          const isAdjacent = Math.abs(i - priceIndex) === 1;
          const isNextRight = i === priceIndex + 1;

          return (
            <button
              key={price}
              onClick={() => onChange(i as PriceIndex)}
              className={`
                leading-none select-none
                ${
                  isActive
                    ? "text-[22px] font-bold text-[#0a0a0a]"
                    : isAdjacent
                      ? "text-[12px] font-normal text-[#bbb]"
                      : "text-[11px] font-normal text-[#ddd]"
                }
                ${showNudge && isNextRight ? "animate-nudge" : ""}
              `}
              style={{
                transition:
                  "font-size 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {price}
            </button>
          );
        })}
      </div>

      {/* Swipe area */}
      <div
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientX - touchStartX.current;
          if (delta < -50) next();
          else if (delta > 50) prev();
        }}
      >
        {children}
      </div>
    </div>
  );
}
