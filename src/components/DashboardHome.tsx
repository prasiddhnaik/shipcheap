"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AuthControls } from "@/components/AuthControls";
import { SaveComparisonButton } from "@/components/SaveComparisonButton";
import { platforms } from "@/data/platforms";
import { defaultCalculatorInput, recommendPlatforms } from "@/lib/recommend-platform";
import type { AppType, Budget, CalculatorInput, DatabaseNeed, Region, RiskLevel } from "@/lib/types";
import { appTypeLabels, budgetLabels, databaseLabels, regionLabels, riskLabels } from "@/lib/utils";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  Check,
  CircleHelp,
  Cloud,
  Code2,
  Database,
  GitBranch,
  Grid2X2,
  Info,
  MessageSquare,
  Moon,
  Package,
  Search,
  Settings2,
  Shield,
  ShieldCheck,
  Star,
  Sun,
} from "lucide-react";

const appTypes = Object.entries(appTypeLabels) as [AppType, string][];
const budgets = Object.entries(budgetLabels) as [Budget, string][];
const databases = Object.entries(databaseLabels) as [DatabaseNeed, string][];
const regions = Object.entries(regionLabels) as [Region, string][];
const risks = Object.entries(riskLabels) as [RiskLevel, string][];

const navItems = [
  { label: "Dashboard", href: "/", icon: Grid2X2, active: true },
  { label: "Recommendations", href: "#recommendations", icon: Settings2 },
  { label: "Compare", href: "/compare", icon: BadgeDollarSign },
  { label: "Providers", href: "/compare", icon: Package },
  { label: "Saved Filters", href: "#recommendations", icon: Boxes },
  { label: "Favorites", href: "#recommendations", icon: Star },
];

const supportItems = [
  { label: "Billing Risk Guide", href: "/guides/no-card-hosting", icon: Shield },
  { label: "How It Works", href: "#calculator", icon: CircleHelp },
];

export function DashboardHome() {
  const [input, setInput] = useState<CalculatorInput>(defaultCalculatorInput);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlatformSlug, setSelectedPlatformSlug] = useState<string | null>(null);
  const results = useMemo(() => recommendPlatforms(input), [input]);
  const topResults = useMemo(() => results.slice(0, 3), [results]);
  const selectedResult = topResults.find((result) => result.platform.slug === selectedPlatformSlug) ?? topResults[0];
  const activePlatformSlug = selectedResult?.platform.slug;
  const previewRows = useMemo(() => {
    if (!activePlatformSlug) return platforms.slice(0, 5);
    const selectedPlatform = platforms.find((platform) => platform.slug === activePlatformSlug);
    const remainingPlatforms = platforms.filter((platform) => platform.slug !== activePlatformSlug);
    return selectedPlatform ? [selectedPlatform, ...remainingPlatforms].slice(0, 5) : platforms.slice(0, 5);
  }, [activePlatformSlug]);

  function update<K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-[#070b10] text-slate-100">
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Topbar />

          <div className="mx-auto max-w-[1260px] px-4 py-4 sm:px-6 lg:px-10">
            <section className="grid gap-5 pb-4 xl:grid-cols-[1fr_360px]">
              <div>
                <h1 className="max-w-3xl text-[26px] font-semibold leading-tight tracking-normal text-white sm:text-[30px]">
                  Backend hosting without billing jumpscares.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  ShipCheap compares backend hosting platforms and highlights options that fit your needs without risky billing
                  or surprise costs. Set your preferences and get ranked recommendations you can trust.
                </p>
              </div>
              <HeroGraphic />
            </section>

            <section id="calculator">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
                className="relative rounded-lg border border-white/10 bg-[#111821]/85 p-4 shadow-2xl shadow-black/20"
              >
                <h2 className="text-base font-semibold text-white">Your Preferences</h2>
                <div className="mt-3 grid gap-x-8 gap-y-3 lg:grid-cols-3">
                  <Select label="App type" value={input.appType} onChange={(value) => update("appType", value as AppType)} options={appTypes} />
                  <BudgetInput value={input.budget} onChange={(value) => update("budget", value)} />
                  <Select label="Database" value={input.database} onChange={(value) => update("database", value as DatabaseNeed)} options={databases} />
                  <Toggle label="Always-on required" value={input.alwaysOn} onChange={(value) => update("alwaysOn", value)} />
                  <Toggle label="Credit card required?" value={input.hasCard} onChange={(value) => update("hasCard", value)} yesLabel="Yes" noLabel="No" />
                  <Select label="Region" value={input.region} onChange={(value) => update("region", value as Region)} options={regions} />
                  <div className="lg:col-span-1">
                    <RiskControl value={input.riskLevel} onChange={(value) => update("riskLevel", value)} />
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-xs font-medium text-slate-300">Additional needs (optional)</p>
                    <div className="mt-1.5 flex flex-wrap gap-3">
                      <NeedPill checked>Docker</NeedPill>
                      <NeedPill>Serverless</NeedPill>
                      <NeedPill>Custom Domain</NeedPill>
                      <NeedPill>Daily Backups</NeedPill>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end lg:absolute lg:bottom-4 lg:right-4 lg:mt-0">
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-400 sm:w-auto">
                    <Search size={15} />
                    Find Best Options
                  </button>
                </div>
              </form>
            </section>

            <section id="recommendations" className="pt-3">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-white">Top Recommendations</h2>
                    <Info size={15} className="text-slate-500" />
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedResult
                      ? `${selectedResult.platform.name} selected. Choose another card to update the preview.`
                      : submitted
                        ? "Ranked from your latest preferences."
                        : "Ranked by affordability, transparency, and low billing risk."}
                  </p>
                </div>
                <SaveComparisonButton input={input} results={results} />
              </div>
              <div className="grid items-start gap-4 xl:grid-cols-3">
                {topResults.map((result, index) => (
                  <RecommendationCard
                    key={result.platform.slug}
                    result={result}
                    index={index}
                    selected={result.platform.slug === activePlatformSlug}
                    onSelect={() => setSelectedPlatformSlug(result.platform.slug)}
                  />
                ))}
              </div>
            </section>

            <section className="pt-3">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Comparison Preview</h2>
                  <p className="mt-1 text-sm text-slate-400">Side-by-side snapshot of key platform details. See full comparison for more.</p>
                </div>
                <Link
                  href={activePlatformSlug ? `/compare?platform=${activePlatformSlug}` : "/compare"}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
                >
                  View full comparison
                  <ArrowRight size={15} />
                </Link>
              </div>
              <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111821]/85">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                    <thead className="bg-white/[0.04] text-xs font-semibold text-slate-300">
                      <tr>
                        <Th>Platform</Th>
                        <Th>Free Tier</Th>
                        <Th>Monthly Cost (est.)</Th>
                        <Th>Always-On</Th>
                        <Th>Database</Th>
                        <Th>Docker</Th>
                        <Th>Credit Card</Th>
                        <Th>Billing Risk</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {previewRows.map((platform) => (
                        <tr key={platform.slug} className="text-slate-300">
                          <Td>
                            <Link href={`/platforms/${platform.slug}`} className="flex items-center gap-3 font-medium text-white hover:text-violet-200">
                              <ProviderIcon name={platform.name} />
                              {platform.name}
                            </Link>
                          </Td>
                          <Td>
                            {platform.hasFreeTier ? (
                              <span>Yes<br /><span className="text-xs text-slate-500">starter limits</span></span>
                            ) : (
                              "No"
                            )}
                          </Td>
                          <Td>{platform.hasFreeTier ? "$0 - $7" : "$5 - $20"}</Td>
                          <Td>{platform.alwaysOn ? "Yes" : "No"}</Td>
                          <Td>{platform.databases.includes("postgres") ? "PostgreSQL" : platform.databases.map((database) => databaseLabels[database]).join(", ")}</Td>
                          <Td>
                            {platform.supports.includes("docker") ? (
                              <span className="inline-flex items-center gap-1 text-emerald-300"><Check size={13} /> Yes</span>
                            ) : (
                              "No"
                            )}
                          </Td>
                          <Td>{platform.creditCardRequired ? "Yes" : "No"}</Td>
                          <Td>
                            <RiskBadge risk={platform.billingRisk} />
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-60 shrink-0 border-r border-white/10 bg-[#080d14] lg:sticky lg:top-0 lg:flex lg:flex-col">
      <Link href="/" className="flex h-13 items-center gap-3 px-5 py-3">
        <Boxes className="text-violet-400" size={28} />
        <span className="text-lg font-semibold text-white">ShipCheap</span>
      </Link>

      <nav className="space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
              item.active
                ? "border border-violet-400/25 bg-violet-500/15 text-violet-200"
                : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
            }`}
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mx-3 my-5 border-t border-white/10" />

      <nav className="space-y-1 px-3">
        {supportItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
          >
            <item.icon size={17} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-500/20 text-violet-200">
            <ShieldCheck size={18} />
          </div>
          <h2 className="mt-4 text-sm font-semibold text-white">Why ShipCheap?</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
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

function HeroGraphic() {
  return (
    <div className="hidden items-center justify-end gap-4 xl:flex" aria-hidden="true">
      <div className="rounded-lg border border-violet-300/30 bg-slate-950/70 p-3 shadow-2xl shadow-violet-950/20">
        <div className="mb-3 flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
        </div>
        <div className="space-y-2">
          <span className="block h-1 w-24 rounded-full bg-violet-400" />
          <span className="block h-1 w-16 rounded-full bg-cyan-300" />
          <span className="block h-1 w-28 rounded-full bg-emerald-300" />
          <span className="block h-1 w-20 rounded-full bg-rose-300" />
          <span className="block h-1 w-32 rounded-full bg-violet-300" />
        </div>
      </div>
      <ArrowRight className="text-violet-400" size={22} />
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-1 rounded-full bg-violet-500/15 blur-xl" />
        <ShieldCheck className="relative text-violet-300" size={66} strokeWidth={1.8} />
      </div>
      <div className="rounded-lg border border-dashed border-violet-300/30 p-5 text-slate-500">
        <Cloud size={34} />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-8 w-full rounded-md border border-white/10 bg-[#080d14] px-3 text-sm text-white outline-none transition focus:border-violet-300/60"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function BudgetInput({ value, onChange }: { value: Budget; onChange: (value: Budget) => void }) {
  return (
    <div>
      <Select label="Monthly budget (USD)" value={value} onChange={(next) => onChange(next as Budget)} options={budgets} />
      <p className="mt-1 text-xs text-slate-500">0 = free only</p>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-300">{label}</p>
      <div className="mt-1.5 inline-grid grid-cols-2 overflow-hidden rounded-md border border-white/10 bg-[#080d14]">
        {[false, true].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={`h-7 min-w-16 px-4 text-sm font-medium transition ${
              value === option
                ? "bg-violet-500 text-white shadow-inner shadow-white/10"
                : "text-slate-300 hover:bg-white/[0.04]"
            }`}
          >
            {option ? yesLabel : noLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function RiskControl({ value, onChange }: { value: RiskLevel; onChange: (value: RiskLevel) => void }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-300">Billing risk tolerance</p>
      <div className="mt-1.5 grid overflow-hidden rounded-md border border-white/10 bg-[#080d14] sm:grid-cols-3">
        {risks.map(([risk, label]) => (
          <button
            key={risk}
            type="button"
            onClick={() => onChange(risk)}
            className={`h-7 border-white/10 px-4 text-sm font-medium transition sm:border-r sm:last:border-r-0 ${
              value === risk
                ? risk === "low"
                  ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-inset ring-emerald-400/70"
                  : "bg-violet-500/25 text-white ring-1 ring-inset ring-violet-300/60"
                : "text-slate-300 hover:bg-white/[0.04]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">Lower risk = more conservative recommendations</p>
    </div>
  );
}

function NeedPill({ children, checked = false }: { children: React.ReactNode; checked?: boolean }) {
  return (
    <span className="inline-flex h-7 items-center gap-2 rounded-md border border-white/10 bg-[#080d14] px-3 text-sm text-slate-300">
      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${checked ? "border-violet-300 bg-violet-500" : "border-white/15"}`}>
        {checked && <Check size={10} />}
      </span>
      {children}
    </span>
  );
}

function RecommendationCard({
  result,
  index,
  selected,
  onSelect,
}: {
  result: ReturnType<typeof recommendPlatforms>[number];
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const accents = [
    {
      border: "border-emerald-400/70",
      rank: "bg-emerald-400 text-slate-950",
      link: "text-emerald-300 hover:text-emerald-200",
      tag: "Best Overall",
    },
    {
      border: "border-violet-400/70",
      rank: "bg-violet-400 text-slate-950",
      link: "text-violet-300 hover:text-violet-200",
      tag: "Developer Friendly",
    },
    {
      border: "border-orange-500/70",
      rank: "bg-orange-500 text-slate-950",
      link: "text-orange-400 hover:text-orange-300",
      tag: "Great for Scale",
    },
  ];
  const accent = accents[index] ?? accents[0];
  const platform = result.platform;

  return (
    <article
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`cursor-pointer rounded-lg border ${accent.border} bg-[#111821]/90 p-3.5 shadow-2xl shadow-black/20 outline-none transition hover:-translate-y-0.5 hover:bg-[#131d28] focus-visible:ring-2 focus-visible:ring-violet-300/70 ${
        selected ? "ring-2 ring-violet-300/70 ring-offset-2 ring-offset-[#070b10]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${accent.rank}`}>
            {result.rank}
          </span>
          <ProviderMark name={platform.name} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-white">{platform.name}</h3>
              <span className="whitespace-nowrap rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[11px] font-medium text-violet-200">{accent.tag}</span>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {platform.hasFreeTier && <MiniBadge>Free tier</MiniBadge>}
              {!platform.creditCardRequired && <MiniBadge>No card</MiniBadge>}
              {platform.supports.includes("docker") && <MiniBadge>Docker</MiniBadge>}
              <MiniBadge>{platform.billingRisk === "low" ? "Low risk" : `${riskLabels[platform.billingRisk]} risk`}</MiniBadge>
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          {selected && (
            <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-violet-300/30 bg-violet-500/20 px-2 py-0.5 text-[11px] font-semibold text-violet-100">
              <Check size={11} />
              Selected
            </span>
          )}
          <p className="text-lg font-semibold text-white">{platform.hasFreeTier ? "$0" : "$5"}<span className="text-xs font-normal text-slate-400"> /mo</span></p>
          <p className="text-xs text-slate-500">est. monthly</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{result.matchedReasons[0] ?? platform.description}</p>
      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2.5">
        <Link
          href={`/platforms/${platform.slug}`}
          onClick={(event) => event.stopPropagation()}
          className={`inline-flex items-center gap-2 text-sm font-semibold ${accent.link}`}
        >
          View details <ArrowRight size={14} />
        </Link>
        <Link
          href={`/compare?platform=${platform.slug}`}
          onClick={(event) => event.stopPropagation()}
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
        >
          Compare
        </Link>
      </div>
    </article>
  );
}

function ProviderMark({ name }: { name: string }) {
  if (name === "Fly.io") {
    return <Code2 className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white" />;
  }
  if (name === "Neon" || name === "Supabase") {
    return <Database className="h-10 w-10 rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-cyan-200" />;
  }
  return <ProviderIcon name={name} large />;
}

function ProviderIcon({ name, large = false }: { name: string; large?: boolean }) {
  const size = large ? "h-10 w-10 text-base" : "h-6 w-6 text-xs";
  const colors = name === "Railway" ? "bg-purple-500 text-white" : name === "Fly.io" ? "bg-slate-800 text-white" : "bg-white text-slate-950";
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-md font-black ${size} ${colors}`}>{name.slice(0, 1)}</span>;
}

function MiniBadge({ children }: { children: React.ReactNode }) {
  return <span className="whitespace-nowrap rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-slate-200">{children}</span>;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    high: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  };
  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[risk]}`}>{riskLabels[risk]}</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 leading-5">{children}</td>;
}
