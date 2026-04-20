"use client";

const CATEGORIES = ["NAIL", "PEDI"] as const;
export type Category = (typeof CATEGORIES)[number];

export { CATEGORIES };

export default function CategoryToggle({
  active,
  onChange,
}: {
  active: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <div className="flex gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`
              px-3 py-1 text-[9px] font-semibold tracking-[.18em] uppercase
              border transition-all duration-300
              ${
                isActive
                  ? "border-[#0a0a0a] bg-[#0a0a0a] text-white"
                  : "border-[#ddd] bg-white/80 text-[#bbb] hover:text-[#999] hover:border-[#bbb]"
              }
            `}
            style={{ borderRadius: "2px" }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
