"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallback);
        }
      }}
      className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-brand transition active:scale-95 active:bg-brand-soft"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M15 4 7 12l8 8"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
