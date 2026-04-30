"use client";

import { useRouter } from "next/navigation";

type Props = {
  to?: string;
  ariaLabel?: string;
};

export default function BackButton({ to, ariaLabel = "뒤로 가기" }: Props) {
  const router = useRouter();
  const onClick = () => {
    if (to) router.push(to);
    else router.back();
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="magnetic-btn -ml-3 flex h-12 w-12 items-center justify-center text-foreground"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
