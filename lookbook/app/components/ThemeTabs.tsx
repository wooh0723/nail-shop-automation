"use client";

const THEMES = ["NUANCE", "LOVELY", "HIP KITSCH", "FRIENDS"] as const;
export type Theme = (typeof THEMES)[number];

export { THEMES };

export default function ThemeTabs({
  active,
  onChange,
}: {
  active: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <nav className="flex gap-3">
      {THEMES.map((theme) => {
        const isActive = active === theme;
        return (
          <button
            key={theme}
            onClick={() => onChange(theme)}
            className={`
              relative flex-1 py-4 text-[12px] font-semibold tracking-[.12em] uppercase
              ${isActive ? "text-[#0a0a0a]" : "text-[#ccc] hover:text-[#999]"}
            `}
            style={{
              transition: "color 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {theme}
            <span
              className={`
                absolute bottom-0 left-1/2 h-[1.5px] bg-[#0a0a0a]
                ${isActive ? "w-full -translate-x-1/2" : "w-0 -translate-x-1/2"}
              `}
              style={{
                transition:
                  "width 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
