"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import { AuthControls } from "@/components/AuthControls";
import { getProviderTheme, ProviderLogo } from "@/components/ProviderLogo";
import { SaveComparisonButton } from "@/components/SaveComparisonButton";
import { ShipCheapLogo } from "@/components/ShipCheapLogo";
import { getPlatformCategory, platforms } from "@/data/platforms";
import { defaultCalculatorInput, recommendPlatforms } from "@/lib/recommend-platform";
import type { AppType, Budget, CalculatorInput, DatabaseNeed, Region, RiskLevel } from "@/lib/types";
import { appTypeLabels, budgetLabels, categoryLabels, databaseLabels, regionLabels, riskLabels } from "@/lib/utils";
import {
  ArrowRight,
  BadgeDollarSign,
  Boxes,
  Check,
  CircleHelp,
  CreditCard,
  Grid2X2,
  Info,
  Package,
  Search,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
} from "lucide-react";

const appTypes = Object.entries(appTypeLabels) as [AppType, string][];
const budgets = Object.entries(budgetLabels) as [Budget, string][];
const databases = Object.entries(databaseLabels) as [DatabaseNeed, string][];
const regions = Object.entries(regionLabels) as [Region, string][];
const risks = Object.entries(riskLabels) as [RiskLevel, string][];
type AdditionalNeed = "docker" | "serverless" | "customDomain" | "dailyBackups";
type RecommendedResult = ReturnType<typeof recommendPlatforms>[number];

const additionalNeedLabels: Record<AdditionalNeed, string> = {
  docker: "Docker",
  serverless: "Serverless",
  customDomain: "Custom Domain",
  dailyBackups: "Daily Backups",
};

const navItems = [
  { label: "Dashboard", href: "/", icon: Grid2X2, active: true },
  { label: "Compare", href: "/compare", icon: BadgeDollarSign },
  { label: "Risk Simulator", href: "/billing-risk", icon: ShieldAlert },
  { label: "Providers", href: "/compare", icon: Package },
  { label: "Saved Filters", href: "/saved", icon: Boxes },
  { label: "Favorites", href: "/favorites", icon: Star },
];

const supportItems = [
  { label: "Billing Risk Guide", href: "/guides/no-card-hosting", icon: Shield },
  { label: "How It Works", href: "/how-it-works", icon: CircleHelp },
];

function applyAdditionalNeeds(results: RecommendedResult[], additionalNeeds: Record<AdditionalNeed, boolean>) {
  const activeNeeds = Object.entries(additionalNeeds).filter(([, active]) => active).map(([need]) => need as AdditionalNeed);
  if (activeNeeds.length === 0) return results;

  return results
    .map((result) => {
      let scoreAdjustment = 0;
      const matchedReasons = [...result.matchedReasons];
      const platform = result.platform;

      if (additionalNeeds.docker) {
        if (platform.supports.includes("docker")) {
          scoreAdjustment += 16;
          matchedReasons.unshift("Matches your Docker preference.");
        } else {
          scoreAdjustment -= 20;
        }
      }

      if (additionalNeeds.serverless) {
        const category = getPlatformCategory(platform.slug);
        if (category === "serverless" || category === "frontend" || !platform.alwaysOn) {
          scoreAdjustment += 22;
          matchedReasons.unshift("Fits serverless-style workloads.");
        } else {
          scoreAdjustment -= 12;
        }
      }

      if (additionalNeeds.customDomain) {
        if (platform.supports.some((support) => support !== "database")) {
          scoreAdjustment += 6;
          matchedReasons.unshift("Good fit for app deployments with custom domains.");
        }
      }

      if (additionalNeeds.dailyBackups) {
        if (platform.databases.includes("postgres") || platform.databases.includes("mysql")) {
          scoreAdjustment += 10;
          matchedReasons.unshift("Pairs well with database backup workflows.");
        } else {
          scoreAdjustment -= 8;
        }
      }

      return { ...result, score: result.score + scoreAdjustment, matchedReasons };
    })
    .sort((a, b) => b.score - a.score || a.platform.name.localeCompare(b.platform.name))
    .map((result, index) => ({ ...result, rank: index + 1 }));
}

export function DashboardHome() {
  const [input, setInput] = useState<CalculatorInput>(defaultCalculatorInput);
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlatformSlug, setSelectedPlatformSlug] = useState<string | null>(null);
  const [additionalNeeds, setAdditionalNeeds] = useState<Record<AdditionalNeed, boolean>>({
    docker: true,
    serverless: false,
    customDomain: false,
    dailyBackups: false,
  });
  const baseResults = useMemo(() => recommendPlatforms(input), [input]);
  const results = useMemo(() => applyAdditionalNeeds(baseResults, additionalNeeds), [baseResults, additionalNeeds]);
  const topResults = useMemo(() => results.slice(0, 3), [results]);
  const selectedResult = topResults.find((result) => result.platform.slug === selectedPlatformSlug) ?? topResults[0];
  const activePlatformSlug = selectedResult?.platform.slug;
  const noCardCount = useMemo(() => platforms.filter((platform) => !platform.creditCardRequired).length, []);
  const lowRiskCount = useMemo(() => platforms.filter((platform) => platform.billingRisk === "low").length, []);
  const previewRows = useMemo(() => {
    if (!activePlatformSlug) return platforms.slice(0, 5);
    const selectedPlatform = platforms.find((platform) => platform.slug === activePlatformSlug);
    const remainingPlatforms = platforms.filter((platform) => platform.slug !== activePlatformSlug);
    return selectedPlatform ? [selectedPlatform, ...remainingPlatforms].slice(0, 5) : platforms.slice(0, 5);
  }, [activePlatformSlug]);

  function update<K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) {
    setSelectedPlatformSlug(null);
    setInput((current) => ({ ...current, [key]: value }));
  }

  function toggleAdditionalNeed(need: AdditionalNeed) {
    setSelectedPlatformSlug(null);
    setAdditionalNeeds((current) => ({ ...current, [need]: !current[need] }));
  }

  function applyPreferences() {
    setSelectedPlatformSlug(null);
    setSubmitted(true);
    window.requestAnimationFrame(() => {
      document.getElementById("recommendations")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Topbar />

          <div className="mx-auto max-w-[1260px] px-4 py-6 sm:px-6 lg:px-10">
            <section className="grid gap-5 pb-5 xl:grid-cols-[1fr_390px]">
              <div className="brutal-panel p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="brutal-badge bg-[var(--yellow)] px-3 py-1 text-xs uppercase">Backend hosting decision board</span>
                    <h1 className="mt-4 max-w-3xl text-[44px] font-black leading-[0.92] tracking-normal text-[var(--foreground)] sm:text-[64px]">
                      Pick a backend host before the bill picks you.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
                      Rank backend platforms by cost, card requirements, database fit, and billing risk before you deploy.
                    </p>
                  </div>
                  {selectedResult && (
                    <Link
                      href={`/platforms/${selectedResult.platform.slug}`}
                      className="brutal-button brutal-button-yellow px-3 py-2 text-sm"
                    >
                      Current pick: {selectedResult.platform.name}
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <HeroStat icon={ShieldCheck} label="Low-risk options" value={`${lowRiskCount} providers`} />
                  <HeroStat icon={CreditCard} label="No-card paths" value={`${noCardCount} providers`} />
                  <HeroStat icon={Server} label="Active filter" value={appTypeLabels[input.appType]} />
                </div>
              </div>
              <HeroSummary selectedResult={selectedResult} />
            </section>

            <section id="calculator">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  applyPreferences();
                }}
                className="brutal-panel relative p-4"
              >
                <h2 className="text-2xl font-black text-[var(--foreground)]">Your Preferences</h2>
                <div className="mt-3 grid gap-x-8 gap-y-3 lg:grid-cols-3">
                  <Select label="App type" value={input.appType} onChange={(value) => update("appType", value as AppType)} options={appTypes} />
                  <BudgetInput value={input.budget} onChange={(value) => update("budget", value)} />
                  <Select label="Database" value={input.database} onChange={(value) => update("database", value as DatabaseNeed)} options={databases} />
                  <Toggle label="Always-on required" value={input.alwaysOn} onChange={(value) => update("alwaysOn", value)} />
                  <Toggle label="Can use credit card?" value={input.hasCard} onChange={(value) => update("hasCard", value)} yesLabel="Yes" noLabel="No" />
                  <Select label="Region" value={input.region} onChange={(value) => update("region", value as Region)} options={regions} />
                  <div className="lg:col-span-1">
                    <RiskControl value={input.riskLevel} onChange={(value) => update("riskLevel", value)} />
                  </div>
                  <div className="lg:col-span-2 lg:pr-48">
                    <p className="brutal-label">Additional needs (optional)</p>
                    <div className="mt-1.5 flex flex-wrap gap-3">
                      {(Object.keys(additionalNeedLabels) as AdditionalNeed[]).map((need) => (
                        <NeedPill key={need} checked={additionalNeeds[need]} onClick={() => toggleAdditionalNeed(need)}>
                          {additionalNeedLabels[need]}
                        </NeedPill>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-end lg:absolute lg:bottom-4 lg:right-4 lg:mt-0">
                  <button className="brutal-button brutal-button-primary w-full px-5 py-2.5 text-sm sm:w-auto">
                    <Search size={15} />
                    Show Best Options
                  </button>
                </div>
              </form>
            </section>

            <section id="recommendations" className="pt-3">
              <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-[var(--foreground)]">Top Recommendations</h2>
                    <Info size={15} className="text-[var(--muted)]" />
                  </div>
                  <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                    {selectedResult
                        ? `${selectedResult.platform.name} selected. Choose another card to update the preview.`
                        : submitted
                          ? "Ranked live from your preferences and additional needs."
                          : "Updates instantly as you change preferences."}
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
                  <h2 className="text-2xl font-black text-[var(--foreground)]">Comparison Preview</h2>
                  <p className="mt-1 text-sm font-medium text-[var(--muted)]">Side-by-side snapshot of key platform details. See full comparison for more.</p>
                </div>
                <Link
                  href={activePlatformSlug ? `/compare?platform=${activePlatformSlug}` : "/compare"}
                  className="brutal-button px-4 py-2 text-sm"
                >
                  View full comparison
                  <ArrowRight size={15} />
                </Link>
              </div>
              <div className="brutal-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                    <thead className="bg-[var(--yellow)] text-xs font-black uppercase text-[var(--foreground)]">
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
                    <tbody className="divide-y-2 divide-[var(--line)]">
                      {previewRows.map((platform) => (
                        <tr key={platform.slug} className="text-[var(--foreground)]">
                          <Td>
                            <Link href={`/platforms/${platform.slug}`} className="flex items-center gap-3 font-black text-[var(--foreground)] hover:text-[var(--accent)]">
                              <ProviderLogo name={platform.name} />
                              {platform.name}
                            </Link>
                          </Td>
                          <Td>
                            {platform.hasFreeTier ? (
                              <span>Yes<br /><span className="text-xs font-bold text-[var(--muted)]">starter limits</span></span>
                            ) : (
                              "No"
                            )}
                          </Td>
                          <Td>{platform.hasFreeTier ? "$0 - $7" : "$5 - $20"}</Td>
                          <Td>{platform.alwaysOn ? "Yes" : "No"}</Td>
                          <Td>{platform.databases.includes("postgres") ? "PostgreSQL" : platform.databases.map((database) => databaseLabels[database]).join(", ")}</Td>
                          <Td>
                            {platform.supports.includes("docker") ? (
                              <span className="inline-flex items-center gap-1 font-black text-[var(--foreground)]"><Check size={13} /> Yes</span>
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
    <aside className="hidden min-h-screen w-64 shrink-0 border-r-[3px] border-[var(--line)] bg-[var(--yellow)] lg:sticky lg:top-0 lg:flex lg:flex-col">
      <Link href="/" className="flex items-center gap-3 px-5 py-4">
        <ShipCheapLogo />
      </Link>

      <nav className="space-y-2 px-4 py-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex min-h-11 items-center gap-3 px-3 text-sm font-black transition ${
              item.active
                ? "border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[4px_4px_0_var(--line)]"
                : "text-[var(--foreground)] hover:bg-[var(--panel)]"
            }`}
          >
            <span className={`grid h-8 w-8 place-items-center border-2 border-[var(--line)] ${item.active ? "bg-[var(--accent)] text-white" : "bg-[var(--panel)]"}`}>
              <item.icon size={18} strokeWidth={2.5} />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mx-4 my-5 border-t-[3px] border-[var(--line)]" />

      <nav className="space-y-2 px-4">
        {supportItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex min-h-11 items-center gap-3 px-3 text-sm font-black text-[var(--foreground)] transition hover:bg-[var(--panel)]"
          >
            <span className="grid h-8 w-8 place-items-center border-2 border-[var(--line)] bg-[var(--panel)]">
              <item.icon size={18} strokeWidth={2.5} />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto p-3">
        <div className="brutal-panel p-4">
          <div className="grid h-10 w-10 place-items-center border-2 border-[var(--line)] bg-[var(--green)]">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <h2 className="mt-4 text-sm font-black text-[var(--foreground)]">Why ShipCheap?</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
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

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="brutal-panel-soft p-3">
      <div className="flex items-center gap-2 text-xs font-black text-[var(--muted)]">
        <Icon size={14} className="text-[var(--accent)]" />
        {label}
      </div>
      <p className="mt-2 truncate text-xl font-black text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function HeroSummary({ selectedResult }: { selectedResult?: RecommendedResult }) {
  return (
    <aside className="brutal-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center border-[3px] border-[var(--line)] bg-[var(--green)]">
            <ShieldCheck size={21} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-black text-[var(--foreground)]">Recommendation ready</h2>
            <p className="mt-1 text-xs font-bold text-[var(--muted)]">Updates as preferences change</p>
          </div>
        </div>
        <span className="brutal-badge bg-[var(--green)] px-2 py-1 text-xs">
          Live
        </span>
      </div>

      <div className="mt-4 border-[3px] border-[var(--line)] bg-[var(--paper)] p-4">
        <p className="brutal-label">Top match</p>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-3xl font-black text-[var(--foreground)]">{selectedResult?.platform.name ?? "Run preferences"}</p>
            <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-[var(--muted)]">
              {selectedResult?.matchedReasons[0] ?? "Apply your preferences to generate recommendations."}
            </p>
          </div>
          <p className="shrink-0 text-right text-2xl font-black text-[var(--foreground)]">
            {selectedResult?.platform.hasFreeTier ? "$0" : "$5"}
            <span className="text-xs font-bold text-[var(--muted)]"> /mo</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href="#calculator" className="brutal-button px-3 py-2 text-sm">
          Edit filters
        </Link>
        <Link href={selectedResult ? `/compare?platform=${selectedResult.platform.slug}` : "/compare"} className="brutal-button brutal-button-primary px-3 py-2 text-sm">
          Compare
          <ArrowRight size={14} />
        </Link>
      </div>
    </aside>
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
      <span className="brutal-label">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="brutal-input mt-1.5 w-full px-3 text-sm"
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
      <p className="mt-1 text-xs font-bold text-[var(--muted)]">0 = free only</p>
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
      <p className="brutal-label">{label}</p>
      <div className="mt-1.5 inline-grid grid-cols-2 border-2 border-[var(--line)] bg-[var(--panel)]">
        {[false, true].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={`min-h-10 min-w-16 border-r-2 border-[var(--line)] px-4 text-sm font-black transition last:border-r-0 ${
              value === option
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--foreground)] hover:bg-[var(--paper)]"
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
      <p className="brutal-label">Billing risk tolerance</p>
      <div className="mt-1.5 grid border-2 border-[var(--line)] bg-[var(--panel)] sm:grid-cols-3">
        {risks.map(([risk, label]) => (
          <button
            key={risk}
            type="button"
            onClick={() => onChange(risk)}
            className={`min-h-10 border-[var(--line)] px-4 text-sm font-black transition sm:border-r-2 sm:last:border-r-0 ${
              value === risk
                ? risk === "low"
                  ? "bg-[var(--green)] text-[var(--foreground)]"
                  : "bg-[var(--accent)] text-white"
                : "text-[var(--foreground)] hover:bg-[var(--paper)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs font-bold text-[var(--muted)]">Lower risk = more conservative recommendations</p>
    </div>
  );
}

function NeedPill({
  children,
  checked = false,
  onClick,
}: {
  children: React.ReactNode;
  checked?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 border-2 border-[var(--line)] px-3 text-sm font-black transition ${
        checked
          ? "bg-[var(--accent)] text-white"
          : "bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--paper)]"
      }`}
    >
      <span className={`flex h-4 w-4 items-center justify-center border-2 ${checked ? "border-white bg-white text-[var(--accent)]" : "border-[var(--line)]"}`}>
        {checked && <Check size={10} />}
      </span>
      {children}
    </button>
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
      tag: "Best Overall",
    },
    {
      tag: "Developer Friendly",
    },
    {
      tag: "Great for Scale",
    },
  ];
  const accent = accents[index] ?? accents[0];
  const platform = result.platform;
  const category = getPlatformCategory(platform.slug);
  const providerTheme = getProviderTheme(platform.name);
  const cardStyle = {
    color: providerTheme.text,
  } as CSSProperties;

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
      className={`cursor-pointer border-[3px] border-[var(--line)] bg-[var(--panel)] p-4 shadow-[7px_7px_0_var(--line)] outline-none transition hover:-translate-y-0.5 hover:bg-white focus-visible:ring-4 focus-visible:ring-[var(--accent)] ${
        selected ? "translate-x-[-2px] translate-y-[-2px] shadow-[9px_9px_0_var(--accent)]" : ""
      }`}
      style={cardStyle}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--line)] text-sm font-black"
            style={{ backgroundColor: index === 0 ? "var(--green)" : index === 1 ? "var(--yellow)" : "var(--paper)", color: "var(--foreground)" }}
          >
            {result.rank}
          </span>
          <ProviderLogo name={platform.name} large />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="truncate text-2xl font-black text-[var(--foreground)]">{platform.name}</h3>
              <span className="whitespace-nowrap border-2 border-[var(--line)] bg-[var(--paper)] px-1.5 py-0.5 text-[11px] font-black text-[var(--foreground)]">
                {accent.tag}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-black uppercase text-[var(--muted)]">{categoryLabels[category]}</p>
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
            <span className="mb-1 inline-flex items-center gap-1 border-2 border-[var(--line)] bg-[var(--green)] px-2 py-0.5 text-[11px] font-black text-[var(--foreground)]">
              <Check size={11} />
              Selected
            </span>
          )}
          <p className="text-2xl font-black text-[var(--foreground)]">{platform.hasFreeTier ? "$0" : "$5"}<span className="text-xs font-bold text-[var(--muted)]"> /mo</span></p>
          <p className="text-xs font-bold text-[var(--muted)]">est. monthly</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-medium leading-5 text-[var(--muted)]">{result.matchedReasons[0] ?? platform.description}</p>
      <div className="mt-3 flex items-center justify-between border-t-[3px] border-[var(--line)] pt-3">
        <Link
          href={`/platforms/${platform.slug}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex items-center gap-2 text-sm font-black text-[var(--accent)] underline-offset-4 hover:underline"
        >
          View details <ArrowRight size={14} />
        </Link>
        <Link
          href={`/compare?platform=${platform.slug}`}
          onClick={(event) => event.stopPropagation()}
          className="border-2 border-[var(--line)] bg-[var(--paper)] px-3 py-1.5 text-xs font-black text-[var(--foreground)] transition hover:bg-[var(--yellow)]"
        >
          Compare
        </Link>
      </div>
    </article>
  );
}

function MiniBadge({ children }: { children: React.ReactNode }) {
  return <span className="whitespace-nowrap border-2 border-[var(--line)] bg-[var(--paper)] px-1.5 py-0.5 text-[11px] font-black text-[var(--foreground)]">{children}</span>;
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    low: "bg-[var(--green)] text-[var(--foreground)]",
    medium: "bg-[var(--yellow)] text-[var(--foreground)]",
    high: "bg-[var(--red)] text-[var(--foreground)]",
  };
  return <span className={`border-2 border-[var(--line)] px-3 py-1 text-xs font-black ${styles[risk]}`}>{riskLabels[risk]}</span>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 leading-5">{children}</td>;
}
