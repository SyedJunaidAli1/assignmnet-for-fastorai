import type { ReactNode } from "react";

/** Mobile-first screen container, centered as a phone-sized column on desktop. */
export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white shadow-[0_0_80px_rgba(16,24,40,0.10)] md:border-x md:border-black/5">
      {children}
    </div>
  );
}
