"use client";

import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  CircleHelp,
  GitBranch,
  Grid2X2,
  MessageSquare,
  Moon,
  Package,
  Settings2,
  Shield,
  ShieldCheck,
  Star,
  Sun,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: Grid2X2, key: "dashboard" },
  { label: "Recommendations", href: "/#recommendations", icon: Settings2, key: "recommendations" },
  { label: "Compare", href: "/compare", icon: BadgeDollarSign, key: "compare" },
  { label: "Providers", href: "/compare", icon: Package, key: "providers" },
  { label: "Saved Filters", href: "/#recommendations", icon: Boxes, key: "saved" },
  { label: "Favorites", href: "/#recommendations", icon: Star, key: "favorites" },
];

const supportItems = [
  { label: "Billing Risk Guide", href: "/guides/no-card-hosting", icon: Shield },
  { label: "How It Works", href: "/#calculator", icon: CircleHelp },
];

export function AppChrome({
  active = "dashboard",
  compactSidebar = false,
  children,
}: {
  active?: "dashboard" | "recommendations" | "compare" | "providers" | "saved" | "favorites";
  compactSidebar?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100">
      <div className="flex">
        <Sidebar active={active} compact={compactSidebar} />
        <main className="min-w-0 flex-1">
          <Topbar />
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ active, compact }: { active: string; compact: boolean }) {
  return (
    <aside className={`hidden min-h-screen shrink-0 border-r border-white/10 bg-[#080d14] lg:sticky lg:top-0 lg:flex lg:flex-col ${compact ? "w-48" : "w-60"}`}>
      <Link href="/" className={`flex h-13 items-center gap-3 py-3 ${compact ? "px-4" : "px-5"}`}>
        <Boxes className="text-violet-400" size={compact ? 24 : 28} />
        <span className={`${compact ? "text-base" : "text-lg"} font-semibold text-white`}>ShipCheap</span>
      </Link>

      <nav className={`space-y-1 py-2 ${compact ? "px-2" : "px-3"}`}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center rounded-md py-2.5 text-sm font-medium transition ${compact ? "gap-2 px-2.5" : "gap-3 px-3"} ${
              item.key === active
                ? "border border-violet-400/25 bg-violet-500/15 text-violet-200"
                : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={`${compact ? "mx-2 my-4" : "mx-3 my-5"} border-t border-white/10`} />

      <nav className={`space-y-1 ${compact ? "px-2" : "px-3"}`}>
        {supportItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center rounded-md py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white ${compact ? "gap-2 px-2.5" : "gap-3 px-3"}`}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={`mt-auto ${compact ? "p-2" : "p-3"}`}>
        <div className={`rounded-lg border border-white/10 bg-white/[0.03] ${compact ? "p-3" : "p-4"}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
            <ShieldCheck size={18} />
          </div>
          <h2 className="mt-4 text-sm font-semibold text-white">Why ShipCheap?</h2>
          <p className={`${compact ? "mt-2 text-xs leading-5" : "mt-3 text-sm leading-6"} text-slate-400`}>
            We analyze pricing, limits, and upgrade paths so you can deploy without surprise bills.
          </p>
          <Link href="/guides/no-card-hosting" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-300 hover:text-violet-200">
            Learn more <ArrowRight size={14} />
          </Link>
        </div>

        <p className="mt-8 text-xs leading-5 text-slate-500">
          © 2026 ShipCheap
          <br />
          All rights reserved.
        </p>

        <div className="mt-4 inline-flex rounded-md border border-white/10 bg-white/[0.03] p-1 text-slate-400">
          <button className="rounded px-2 py-1" aria-label="Moon theme">
            <Moon size={15} />
          </button>
          <button className="rounded bg-violet-500 px-3 py-1 text-white" aria-label="Active theme">
            <Moon size={15} />
          </button>
          <button className="rounded px-2 py-1" aria-label="Sun theme">
            <Sun size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="flex min-h-13 items-center justify-between border-b border-white/10 bg-[#080d14]/90 px-4 py-2 backdrop-blur sm:px-8">
      <Link href="/" className="flex items-center gap-3 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-cyan-300 text-sm font-black text-slate-950">SC</span>
        <span className="font-semibold text-white">ShipCheap</span>
      </Link>
      <div className="hidden text-sm text-slate-500 lg:block"> </div>
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/prasiddhnaik/shipcheap"
          className="hidden items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.05] sm:inline-flex"
        >
          <GitBranch size={15} />
          Star
          <span className="text-slate-500">1.2k</span>
        </a>
        <Link
          href="/compare"
          className="hidden items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.05] sm:inline-flex"
        >
          <MessageSquare size={15} />
          Feedback
        </Link>
        <AuthControls />
      </div>
    </header>
  );
}
