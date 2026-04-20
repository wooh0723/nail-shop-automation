import Image from "next/image";
import type { NailArt } from "@/lib/nailarts";

export default function NailArtCard({
  art,
}: {
  art: Pick<
    NailArt,
    | "id"
    | "name"
    | "category"
    | "theme"
    | "price"
    | "season"
    | "coverImage"
    | "coverWidth"
    | "coverHeight"
    | "artist"
  >;
}) {
  const isPedi = art.category === "PEDI";
  const hasDims = art.coverWidth > 0 && art.coverHeight > 0;
  const wrapperClass = isPedi ? "mx-auto max-w-[65%]" : "";

  const containerStyle =
    isPedi && hasDims
      ? { aspectRatio: `${art.coverWidth} / ${art.coverHeight}` }
      : undefined;
  const aspectClass = isPedi && hasDims ? "" : "aspect-[5/2]";

  return (
    <div className={wrapperClass}>
      <div
        className={`relative ${aspectClass} overflow-hidden bg-[#f0f0f0]`}
        style={containerStyle}
      >
        {art.coverImage ? (
          <Image
            src={art.coverImage}
            alt={art.name || "네일아트"}
            width={art.coverWidth > 0 ? art.coverWidth : 750}
            height={art.coverHeight > 0 ? art.coverHeight : 300}
            sizes={isPedi ? "280px" : "390px"}
            quality={85}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#bbb]">
            이미지 없음
          </div>
        )}
      </div>
      <p className="mt-2.5 truncate text-[13px] font-medium tracking-tight text-[#0a0a0a]">
        {art.name || "\u2014"}
      </p>
    </div>
  );
}
