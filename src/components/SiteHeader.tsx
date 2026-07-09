import Link from "next/link";
import { ShipCheapLogo } from "@/components/ShipCheapLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b-[3px] border-[var(--line)] bg-white/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <ShipCheapLogo compact />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-black text-[var(--foreground)]">
          <Link className="hover:text-[var(--accent)]" href="/compare">
            Compare
          </Link>
          <Link className="hover:text-[var(--accent)]" href="/billing-risk">
            Bill risk
          </Link>
          <Link className="hover:text-[var(--accent)]" href="/launch-checks">
            Launch checks
          </Link>
          <Link className="hover:text-[var(--accent)]" href="/guides/no-card-hosting">
            No-card hosting
          </Link>
        </nav>
      </div>
    </header>
  );
}
