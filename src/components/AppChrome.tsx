"use client";

import Link from "next/link";
import { AuthControls } from "@/components/AuthControls";
import { ShipCheapLogo } from "@/components/ShipCheapLogo";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  CircleHelp,
  Grid2X2,
  Package,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: Grid2X2, key: "dashboard" },
  { label: "Compare", href: "/compare", icon: BadgeDollarSign, key: "compare" },
  { label: "Risk Simulator", href: "/billing-risk", icon: ShieldAlert, key: "billing-risk" },
  { label: "Providers", href: "/compare", icon: Package, key: "providers" },
  { label: "Saved Filters", href: "/saved", icon: Boxes, key: "saved" },
  { label: "Favorites", href: "/favorites", icon: Star, key: "favorites" },
];

const supportItems = [
  { label: "Billing Risk Guide", href: "/guides/no-card-hosting", icon: Shield, key: "billing-risk-guide" },
  { label: "How It Works", href: "/how-it-works", icon: CircleHelp, key: "how-it-works" },
];

export function AppChrome({
  active = "dashboard",
  compactSidebar = false,
  supportActive,
  children,
}: {
  active?: "dashboard" | "compare" | "billing-risk" | "providers" | "saved" | "favorites" | "none";
  compactSidebar?: boolean;
  supportActive?: "billing-risk-guide" | "how-it-works";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex">
        <Sidebar active={active} compact={compactSidebar} supportActive={supportActive} />
        <main className="min-w-0 flex-1">
          <Topbar />
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ active, compact, supportActive }: { active: string; compact: boolean; supportActive?: string }) {
  return (
    <aside className={`hidden min-h-screen shrink-0 border-r-[3px] border-[var(--line)] bg-[var(--yellow)] lg:sticky lg:top-0 lg:flex lg:flex-col ${compact ? "w-52" : "w-64"}`}>
      <Link href="/" className={`flex items-center gap-3 py-4 ${compact ? "px-4" : "px-5"}`}>
        <ShipCheapLogo compact={compact} />
      </Link>

      <nav className={`space-y-2 py-2 ${compact ? "px-2" : "px-4"}`}>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex min-h-11 items-center text-sm font-black transition ${compact ? "gap-2 px-2.5" : "gap-3 px-3"} ${
              item.key === active
                ? "border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[4px_4px_0_var(--line)]"
                : "text-[var(--foreground)] hover:bg-[var(--panel)]"
            }`}
          >
            <span className={`grid h-8 w-8 place-items-center border-2 border-[var(--line)] ${item.key === active ? "bg-[var(--accent)] text-white" : "bg-[var(--panel)]"}`}>
              <item.icon size={18} strokeWidth={2.5} />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={`${compact ? "mx-2 my-4" : "mx-4 my-5"} border-t-[3px] border-[var(--line)]`} />

      <nav className={`space-y-2 ${compact ? "px-2" : "px-4"}`}>
        {supportItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex min-h-11 items-center text-sm font-black text-[var(--foreground)] transition ${compact ? "gap-2 px-2.5" : "gap-3 px-3"} ${
              item.key === supportActive
                ? "border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[4px_4px_0_var(--line)]"
                : "hover:bg-[var(--panel)]"
            }`}
          >
            <span className={`grid h-8 w-8 place-items-center border-2 border-[var(--line)] ${item.key === supportActive ? "bg-[var(--accent)] text-white" : "bg-[var(--panel)]"}`}>
              <item.icon size={18} strokeWidth={2.5} />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={`mt-auto ${compact ? "p-2" : "p-3"}`}>
        <div className={`brutal-panel ${compact ? "p-3" : "p-4"}`}>
          <div className="grid h-10 w-10 place-items-center border-2 border-[var(--line)] bg-[var(--green)]">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <h2 className="mt-4 text-sm font-black text-[var(--foreground)]">Why ShipCheap?</h2>
          <p className={`${compact ? "mt-2 text-xs leading-5" : "mt-3 text-sm leading-6"} text-[var(--muted)]`}>
            We analyze pricing, limits, and upgrade paths so you can deploy without surprise bills.
          </p>
          <Link href="/guides/no-card-hosting" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[var(--accent)] underline-offset-4 hover:underline">
            Learn more <ArrowRight size={14} />
          </Link>
        </div>

        <p className="mt-8 text-xs font-bold leading-5 text-[var(--muted)]">
          © 2026 ShipCheap
          <br />
          All rights reserved.
        </p>
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between border-b-[3px] border-[var(--line)] bg-white/95 px-4 py-2 sm:px-8">
      <Link href="/" className="flex items-center gap-3 lg:hidden">
        <ShipCheapLogo compact />
      </Link>
      <div className="hidden text-sm font-black text-[var(--muted)] lg:block">ShipCheap Decision Board</div>
      <div className="flex items-center gap-3">
        <AuthControls />
      </div>
    </header>
  );
}
