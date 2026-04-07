import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNailArts } from "@/lib/nailarts";

export async function generateStaticParams() {
  return getNailArts().map((art) => ({ id: art.id }));
}

export default async function ArtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const art = getNailArts().find((a) => a.id === id);

  if (!art) notFound();

  return (
    <div className="mx-auto max-w-[390px] px-5 pb-16 pt-10">
      {/* Back navigation */}
      <Link
        href="/"
        className="magnetic-btn inline-block text-[10px] font-medium tracking-[.2em] text-[#999] uppercase hover:text-[#0a0a0a] transition-colors duration-300"
      >
        ← lookbook
      </Link>

      <div className="mt-10">
        {/* Cover image — full bleed within container */}
        {art.coverImage && (
          <div className="overflow-hidden">
            <Image
              src={art.coverImage}
              alt={art.name || "네일아트"}
              width={750}
              height={750}
              sizes="390px"
              quality={85}
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        {/* Title + meta */}
        <div className="mt-8">
          <h1 className="text-[22px] font-bold tracking-tight leading-snug text-[#0a0a0a]">
            {art.name || "\u2014"}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] tracking-wide text-[#aaa]">
            {art.theme && <span>{art.theme}</span>}
            {art.price && <span>{art.price}</span>}
            {art.season && <span>{art.season}</span>}
            {art.artist && <span>{art.artist}</span>}
          </div>
        </div>

        {/* Detail images */}
        {art.detailImages.length > 0 && (
          <div className="mt-10 grid gap-3">
            {art.detailImages.map((src, i) => (
              <div key={src} className="overflow-hidden">
                <Image
                  src={src}
                  alt={`${art.name} 상세 ${i + 1}`}
                  width={750}
                  height={750}
                  sizes="390px"
                  quality={85}
                  className="w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        )}

        {/* Materials */}
        {art.materials.length > 0 && (
          <div className="mt-12">
            <h2 className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#aaa]">
              Materials
            </h2>
            <ul className="mt-4 space-y-2">
              {art.materials.map((m, i) => (
                <li
                  key={i}
                  className="text-[13px] font-light leading-relaxed text-[#666]"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Purchase links */}
        {art.purchaseLinks.length > 0 && (
          <div className="mt-12">
            <h2 className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#aaa]">
              Purchase
            </h2>
            <ul className="mt-4 space-y-3">
              {[...new Set(art.purchaseLinks)].map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="magnetic-btn inline-block text-[13px] text-[#0a0a0a] underline underline-offset-4 decoration-[#ddd] hover:decoration-[#0a0a0a] transition-colors duration-300 break-all"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
