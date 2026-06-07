import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import { ShipCheapLogo } from "@/components/ShipCheapLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#252525]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <ShipCheapLogo compact />
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-4">
          <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-medium text-slate-300">
            <Link className="hover:text-white" href="/compare">
              Compare
            </Link>
            <Link className="hover:text-white" href="/guides/node-backend">
              Node guide
            </Link>
            <Link className="hover:text-white" href="/guides/fastapi">
              FastAPI
            </Link>
            <Link className="hover:text-white" href="/guides/no-card-hosting">
              No-card hosting
            </Link>
          </nav>
          <AuthControls />
        </div>
      </div>
    </header>
  );
}
