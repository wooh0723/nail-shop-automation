import Image from "next/image";
import Link from "next/link";
import type { NailArt } from "@/lib/nailarts";

export default function NailArtCard({
  art,
}: {
  art: Pick<NailArt, "id" | "name" | "theme" | "price" | "season" | "coverImage" | "artist">;
}) {
  return (
    <Link href={`/art/${art.id}`} className="group block">
      <div className="relative aspect-[5/2] overflow-hidden bg-[#f0f0f0]">
        {art.coverImage ? (
          <>
            <Image
              src={art.coverImage}
              alt={art.name || "네일아트"}
              width={780}
              height={312}
              className="h-full w-full object-cover transition-transform duration-700"
              style={{
                transition:
                  "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
            <div
              className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5"
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#bbb]">
            이미지 없음
          </div>
        )}
      </div>
      <p className="mt-2.5 truncate text-[13px] font-medium tracking-tight text-[#0a0a0a]">
        {art.name || "\u2014"}
      </p>
    </Link>
  );
}
