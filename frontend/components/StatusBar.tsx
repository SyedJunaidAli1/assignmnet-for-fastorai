/** iOS-style status bar shown in the Figma designs. Purely decorative. */
export default function StatusBar() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-6 pt-1 text-[15px] font-semibold text-ink">
      <span className="tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {/* cellular */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
          <rect x="0" y="7" width="3" height="4" rx="1" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" />
        </svg>
        {/* wifi */}
        <svg width="16" height="11" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 11.2 5.9 8.8a3.1 3.1 0 0 1 4.2 0L8 11.2Z" />
          <path
            d="M8 4.6c1.7 0 3.2.6 4.4 1.7l-1.3 1.4A4.7 4.7 0 0 0 8 6.6c-1.2 0-2.3.4-3.1 1.1L3.6 6.3A6.3 6.3 0 0 1 8 4.6Z"
            opacity=".9"
          />
          <path
            d="M8 1.4c2.5 0 4.8 1 6.5 2.6l-1.3 1.4A7.9 7.9 0 0 0 8 3.4 7.9 7.9 0 0 0 2.8 5.4L1.5 4A9.5 9.5 0 0 1 8 1.4Z"
            opacity=".9"
          />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="18" height="8" rx="2.2" fill="currentColor" />
          <path
            d="M23 4.2c.9.3 1.4 1 1.4 1.8s-.5 1.5-1.4 1.8V4.2Z"
            fill="currentColor"
            opacity=".45"
          />
        </svg>
      </div>
    </div>
  );
}
