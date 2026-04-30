"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { NailArt } from "@/lib/nailarts";
import NailArtCard from "./NailArtCard";
import CategoryToggle, { type Category } from "./CategoryToggle";
import ThemeTabs, { THEMES, type Theme } from "./ThemeTabs";
import PriceSwiper, { PRICES, type PriceIndex } from "./PriceSwiper";
import SelectArtModal from "./booking/SelectArtModal";
import BackButton from "./booking/BackButton";
import { useBookingDraft } from "@/lib/booking/useBookingDraft";

function formatSeason(s: string): string {
  if (s.length !== 4) return s;
  const mm = s.slice(2);
  return `${parseInt(mm, 10)}월`;
}

export default function LookbookClient({
  arts,
  seasons,
  initialSelectMode = false,
}: {
  arts: NailArt[];
  seasons: string[];
  initialSelectMode?: boolean;
}) {
  const router = useRouter();
  const { patch } = useBookingDraft();

  const [category, setCategory] = useState<Category>("NAIL");
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [priceIndex, setPriceIndex] = useState<PriceIndex>(0);
  const [activeSeason, setActiveSeason] = useState<string>(seasons[0] ?? "");
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const [selectMode] = useState(initialSelectMode);
  const [selectedArt, setSelectedArt] = useState<NailArt | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  function handleCategoryChange(next: Category) {
    setCategory(next);
    setContentKey((k) => k + 1);
  }

  function handleThemeChange(next: Theme) {
    setTheme(next);
    setContentKey((k) => k + 1);
  }

  function handlePriceChange(idx: PriceIndex) {
    setPriceIndex(idx);
    setContentKey((k) => k + 1);
  }

  function handleSeasonChange(s: string) {
    setActiveSeason(s);
    setSeasonOpen(false);
    setContentKey((k) => k + 1);
  }

  function handleConfirm(variationMemo: string) {
    if (!selectedArt) return;
    patch({
      track: "existing",
      existing: {
        artId: selectedArt.id,
        artName: selectedArt.name?.trim() || "",
        coverImage: selectedArt.coverImage,
        variationMemo,
      },
    });
    setSelectedArt(null);
    router.push("/book/contact");
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSeasonOpen(false);
      }
    }
    if (seasonOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [seasonOpen]);

  const filtered = arts.filter(
    (art) =>
      art.category === category &&
      (category === "PEDI" || art.theme === theme) &&
      art.price === PRICES[priceIndex] &&
      (activeSeason ? art.season === activeSeason : true)
  );

  return (
    <div>
      {selectMode && (
        <div className="-mx-5 mb-3 flex items-center border-b border-foreground/10 bg-background/95 px-3 py-2 backdrop-blur">
          <BackButton to="/book" ariaLabel="예약 분기로 돌아가기" />
        </div>
      )}

      {/* Header — brand + season (brand hidden in select mode) */}
      <header className="mb-3 flex items-baseline justify-between">
        {!selectMode && (
          <span
            className="text-[20px] font-extralight tracking-tight text-[#bbb] uppercase"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Signicho Nail
          </span>
        )}

        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            onClick={() => setSeasonOpen((v) => !v)}
            className="cursor-pointer text-[20px] font-semibold tracking-tight text-[#0a0a0a] border-b border-dashed border-[#aaa] pb-px"
          >
            {formatSeason(activeSeason)}
            <span
              className={`ml-0.5 inline-block text-[9px] text-[#aaa] transition-transform duration-300 ${
                seasonOpen ? "rotate-180" : ""
              }`}
            >
              &#9662;
            </span>
          </button>

          {seasonOpen && seasons.length > 1 && (
            <div
              className="absolute right-0 top-full z-40 mt-1.5 flex flex-col overflow-hidden bg-white py-1"
              style={{
                border: "0.5px solid #e0e0e0",
                borderRadius: "4px",
              }}
            >
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSeasonChange(s)}
                  className={`
                    px-5 py-1.5 text-right text-[15px] transition-colors duration-200 whitespace-nowrap
                    ${
                      s === activeSeason
                        ? "font-bold text-[#0a0a0a]"
                        : "font-normal text-[#aaa] hover:text-[#0a0a0a]"
                    }
                  `}
                >
                  {formatSeason(s)}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {category === "NAIL" && (
        <>
          <ThemeTabs active={theme} onChange={handleThemeChange} />
          <div className="h-px bg-[#e8e8e8]" />
        </>
      )}

      <PriceSwiper priceIndex={priceIndex} onChange={handlePriceChange}>
        {filtered.length > 0 ? (
          <div key={contentKey} className="stagger-reveal flex flex-col pt-2">
            {filtered.map((art, i) => (
              <div key={art.id}>
                {i > 0 && <div className="my-4 h-px bg-[#e8e8e8]" />}
                <NailArtCard
                  art={art}
                  onClick={
                    selectMode ? () => setSelectedArt(art) : undefined
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-52 items-center justify-center">
            <p className="text-[13px] font-light text-[#bbb]">
              해당 아트가 없습니다
            </p>
          </div>
        )}
      </PriceSwiper>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center">
        <div className="pointer-events-auto">
          <CategoryToggle active={category} onChange={handleCategoryChange} />
        </div>
      </div>

      <SelectArtModal
        art={selectedArt}
        onClose={() => setSelectedArt(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
