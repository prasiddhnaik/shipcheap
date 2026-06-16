function ShipCheapMark() {
  return (
    <svg aria-hidden="true" className="h-full w-full" viewBox="0 0 48 48" fill="none">
      <rect x="4.5" y="4.5" width="39" height="39" fill="#111111" stroke="#002fa7" strokeWidth="3" />
      <path d="M24 10.75V14.25M24 33.75V37.25M10.75 24H14.25M33.75 24H37.25" stroke="white" strokeOpacity="0.3" strokeWidth="1.8" />
      <path d="M13 31L20 24L26.5 28L35 16" stroke="#ffcf24" strokeWidth="3.8" strokeLinecap="square" strokeLinejoin="miter" />
      <circle cx="13" cy="31" r="3.25" fill="#111111" stroke="#ffcf24" strokeWidth="2.4" />
      <circle cx="20" cy="24" r="3" fill="#ffcf24" />
      <circle cx="26.5" cy="28" r="2.7" fill="#FFFFFF" />
      <path d="M35 11.6L40.4 17L35 22.4L29.6 17L35 11.6Z" fill="#002fa7" stroke="#ffffff" strokeWidth="1.4" />
      <path d="M32.9 17.25L34.45 18.8L37.25 15.45" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="miter" />
    </svg>
  );
}

export function ShipCheapLogo({ compact = false }: { compact?: boolean }) {
  const markSize = compact ? "h-9 w-9" : "h-11 w-11";
  const textSize = compact ? "text-base" : "text-xl";

  return (
    <span className="inline-flex items-center gap-3">
      <span className={`inline-flex shrink-0 items-center justify-center border-[3px] border-[var(--line)] bg-[var(--panel)] p-1 shadow-[4px_4px_0_var(--line)] ${markSize}`}>
        <ShipCheapMark />
      </span>
      <span className={`${textSize} font-black text-[var(--foreground)]`}>ShipCheap</span>
    </span>
  );
}
