"use client";

import Link from "next/link";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { ProviderLogo } from "@/components/ProviderLogo";
import { platforms } from "@/data/platforms";
import type { Platform, RiskLevel } from "@/lib/types";
import { cn, riskLabels } from "@/lib/utils";
import {
  ArrowRight,
  Banknote,
  Bell,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Gauge,
  HardDrive,
  ListChecks,
  ServerCog,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

type TrafficLevel = "small" | "steady" | "spike";
type SpendControl = "none" | "alerts" | "hard-cap";
type DataLoad = "none" | "small" | "growing" | "heavy";
type JobLoad = "none" | "scheduled" | "always-on";

type SimulatorInput = {
  hasCard: boolean;
  providerSlug: string;
  trafficLevel: TrafficLevel;
  spendControl: SpendControl;
  dataLoad: DataLoad;
  bandwidthHeavy: boolean;
  keepsLogs: boolean;
  jobLoad: JobLoad;
};

type RiskResult = {
  score: number;
  level: RiskLevel;
  label: string;
  summary: string;
  drivers: string[];
  mitigations: string[];
};

type BillShockExample = {
  service: string;
  amount: string;
  cause: string;
  source: string;
  href: string;
};

const defaultInput: SimulatorInput = {
  hasCard: false,
  providerSlug: "koyeb",
  trafficLevel: "small",
  spendControl: "alerts",
  dataLoad: "small",
  bandwidthHeavy: false,
  keepsLogs: false,
  jobLoad: "none",
};

const trafficLabels: Record<TrafficLevel, string> = {
  small: "Small prototype",
  steady: "Steady users",
  spike: "User or bot spike possible",
};

const billShockExamples: BillShockExample[] = [
  {
    service: "Vercel",
    amount: "$96k reported",
    cause: "A viral user surge reportedly drove huge function usage for Cara.",
    source: "Deshittify",
    href: "https://deshittify.io/products/vercel",
  },
  {
    service: "Firebase/Gemini",
    amount: "€54k reported",
    cause: "An unrestricted browser key was reportedly abused for API calls.",
    source: "Agent Wars",
    href: "https://agent-wars.com/news/2026-04-16-54k-firebase-browser-key-gemini-api-exploit",
  },
  {
    service: "Firebase",
    amount: "£13k reported",
    cause: "A user reported a large past-due bill and budget alerts that did not stop usage.",
    source: "Reddit",
    href: "https://www.reddit.com/r/Firebase/comments/1b3s81w",
  },
  {
    service: "AWS",
    amount: "$45k reported",
    cause: "Compromised keys were reportedly used for crypto-mining workloads.",
    source: "Reddit",
    href: "https://www.reddit.com/r/CryptoCurrency/comments/rhh81f",
  },
];

const spendControlLabels: Record<SpendControl, string> = {
  none: "No alerts or cap",
  alerts: "Budget alerts",
  "hard-cap": "Hard cap or no-card path",
};

const dataLoadLabels: Record<DataLoad, string> = {
  none: "No persistent data",
  small: "Small database",
  growing: "Growing database",
  heavy: "Heavy storage/data",
};

const jobLoadLabels: Record<JobLoad, string> = {
  none: "No jobs",
  scheduled: "Cron or queues",
  "always-on": "Always-on workers",
};

export function BillingRiskSimulator() {
  const [input, setInput] = useState<SimulatorInput>(defaultInput);
  const selectedProvider = platforms.find((platform) => platform.slug === input.providerSlug) ?? platforms[0];
  const result = useMemo(() => calculateBillingRisk(input, selectedProvider), [input, selectedProvider]);
  const saferProviders = useMemo(() => {
    return platforms
      .filter((platform) => platform.slug !== selectedProvider.slug)
      .filter((platform) => platform.billingRisk === "low" || !platform.creditCardRequired)
      .slice(0, 4);
  }, [selectedProvider.slug]);

  function update<K extends keyof SimulatorInput>(key: K, value: SimulatorInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  return (
    <main className="mx-auto max-w-[1360px] px-4 py-5 sm:px-5 lg:px-6">
      <section className="rounded-lg border border-white/10 bg-[#252525] p-5 shadow-2xl shadow-black/20">
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2442ed]/35 bg-[#2442ed]/10 px-3 py-1 text-xs font-medium text-[#aeb9ff]">
              <ShieldAlert size={13} />
              Billing risk simulator
            </div>
            <h1 className="max-w-4xl text-[28px] font-semibold leading-tight text-white sm:text-[36px]">
              Model the surprise-bill path before you deploy.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Pick a provider and workload shape. ShipCheap estimates how user growth, bot traffic, bandwidth, API calls,
              and storage can turn a cheap deploy into real spend.
            </p>
          </div>
          <RiskSummary result={result} />
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[440px_1fr]">
        <form className="rounded-lg border border-white/10 bg-[#252525] p-4 shadow-2xl shadow-black/20">
          <h2 className="text-base font-semibold text-white">Scenario</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">Adjust the conditions that usually turn a cheap deploy into a risky one.</p>

          <div className="mt-4 space-y-5">
            <SelectField
              label="Provider"
              value={input.providerSlug}
              onChange={(value) => update("providerSlug", value)}
              options={platforms.map((platform) => [platform.slug, platform.name])}
            />
            <ToggleField
              label="Credit card attached"
              value={input.hasCard}
              onChange={(value) => update("hasCard", value)}
              icon={CreditCard}
              yesLabel="Card attached"
              noLabel="No card"
            />
            <SegmentedControl
              label="Spend control"
              value={input.spendControl}
              onChange={(value) => update("spendControl", value)}
              options={Object.entries(spendControlLabels) as [SpendControl, string][]}
            />
            <SegmentedControl
              label="Traffic profile"
              value={input.trafficLevel}
              onChange={(value) => update("trafficLevel", value)}
              options={Object.entries(trafficLabels) as [TrafficLevel, string][]}
            />
            <SegmentedControl
              label="Database/storage"
              value={input.dataLoad}
              onChange={(value) => update("dataLoad", value)}
              options={Object.entries(dataLoadLabels) as [DataLoad, string][]}
            />
            <SegmentedControl
              label="Background work"
              value={input.jobLoad}
              onChange={(value) => update("jobLoad", value)}
              options={Object.entries(jobLoadLabels) as [JobLoad, string][]}
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <ToggleField label="Bandwidth-heavy app" value={input.bandwidthHeavy} onChange={(value) => update("bandwidthHeavy", value)} icon={Gauge} />
              <ToggleField label="Retain logs/metrics" value={input.keepsLogs} onChange={(value) => update("keepsLogs", value)} icon={HardDrive} />
            </div>
          </div>
        </form>

        <div className="grid gap-4">
          <section className="rounded-lg border border-white/10 bg-[#252525] p-4 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <ProviderLogo name={selectedProvider.name} large />
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedProvider.name}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">{selectedProvider.costRange}</p>
                </div>
              </div>
              <BillingRiskBadge risk={selectedProvider.billingRisk} />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric icon={Banknote} label="Risk score" value={`${result.score}/100`} />
              <Metric icon={CreditCard} label="Card path" value={selectedProvider.creditCardRequired ? "Card likely" : "No-card path"} />
              <Metric icon={ServerCog} label="Always-on" value={selectedProvider.alwaysOn ? "Supported" : "Limited"} />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ResultPanel title="Main risk drivers" icon={TrendingUp} items={result.drivers} tone="warn" />
            <ResultPanel title="Controls to set first" icon={ListChecks} items={result.mitigations} tone="good" />
          </section>

          <BillShockExamples />

          <section className="rounded-lg border border-white/10 bg-[#252525] p-4 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">Lower-risk alternatives</h2>
                <p className="mt-1 text-sm text-slate-400">Providers with no-card paths or lower listed billing risk.</p>
              </div>
              <Link href="/compare" className="hidden items-center gap-2 text-sm font-semibold text-[#7f91ff] hover:text-[#aeb9ff] sm:inline-flex">
                Compare all
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {saferProviders.map((platform) => (
                <Link
                  key={platform.slug}
                  href={`/platforms/${platform.slug}`}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-3 transition hover:border-[#2442ed]/45 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start gap-3">
                    <ProviderLogo name={platform.name} large />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-white">{platform.name}</h3>
                        <BillingRiskBadge risk={platform.billingRisk} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">{platform.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function calculateBillingRisk(input: SimulatorInput, provider: Platform): RiskResult {
  let score = 12;
  const drivers: string[] = [];
  const mitigations = new Set<string>();

  const add = (points: number, driver: string, mitigation: string) => {
    score += points;
    drivers.push(driver);
    mitigations.add(mitigation);
  };

  if (provider.billingRisk === "medium") add(12, `${provider.name} has medium listed billing risk.`, "Read plan limits and create a budget alert before launch.");
  if (provider.billingRisk === "high") add(25, `${provider.name} has high listed billing risk.`, "Use a test project and confirm every metered service before adding production traffic.");
  if (provider.creditCardRequired) add(14, `${provider.name} likely requires a billing account or card.`, "Prefer a no-card path while prototyping, or set strict cloud budget alerts.");

  if (input.hasCard) add(12, "A payment card is attached, so usage can convert into real spend.", "Set budget alerts before deployment and review upgrade triggers.");
  if (input.spendControl === "none") add(22, "No budget alert or cap is planned.", "Add budget alerts, project quotas, or a provider-level spending cap.");
  if (input.spendControl === "hard-cap") {
    score -= 12;
    mitigations.add("Keep the hard cap enabled until the app has predictable usage.");
  }

  if (input.trafficLevel === "steady") add(9, "Steady users can exhaust free quotas over time.", "Check monthly request, compute, and bandwidth allowances.");
  if (input.trafficLevel === "spike") add(24, "A fast user-base jump, bot wave, or crawler spike can trigger metered compute, bandwidth, API, or function charges.", "Add rate limits, caching, bot protection, and deployment alerts before sharing publicly.");
  if (input.dataLoad === "growing") add(12, "Growing data can move databases, backups, and storage out of free tiers.", "Track database size, backup retention, and connection limits.");
  if (input.dataLoad === "heavy") add(22, "Heavy storage/data makes database and backup costs a primary risk.", "Model storage, backup, and egress costs separately from app hosting.");
  if (input.bandwidthHeavy) add(13, "Bandwidth-heavy responses can create egress or CDN overage exposure.", "Cache static assets and review egress/CDN limits.");
  if (input.keepsLogs) add(8, "Long log or metrics retention can add observability costs.", "Set short retention while testing and sample noisy logs.");
  if (input.jobLoad === "scheduled") add(8, "Cron or queue work can run even when users are not active.", "Set retry limits and alert on job duration.");
  if (input.jobLoad === "always-on") add(16, "Always-on workers can create constant compute spend.", "Use sleep-friendly services or cap worker replicas during early usage.");

  score = Math.max(0, Math.min(100, score));
  const level: RiskLevel = score >= 66 ? "high" : score >= 36 ? "medium" : "low";

  if (drivers.length === 0) {
    drivers.push("This scenario has a conservative no-card or capped path.");
  }
  if (mitigations.size === 0) {
    mitigations.add("Keep checking provider limits before adding production traffic.");
  }

  return {
    score,
    level,
    label: `${riskLabels[level]} risk`,
    summary:
      level === "low"
        ? "This looks reasonable for a prototype if the listed limits still match the provider's current docs."
        : level === "medium"
          ? "This can work, but a sudden user or bot spike could still create spend. Set controls before launch."
          : "This scenario has multiple paths to accidental spend if traffic blows up. Tighten controls or choose a safer starter provider first.",
    drivers: drivers.slice(0, 5),
    mitigations: Array.from(mitigations).slice(0, 5),
  };
}

function BillShockExamples() {
  return (
    <section className="rounded-lg border border-rose-400/20 bg-rose-400/[0.04] p-4 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-400/10 text-rose-300">
              <ShieldAlert size={17} />
            </span>
            <h2 className="text-base font-semibold text-white">It has happened before</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            Reported cloud bill shocks usually come from the same pattern: sudden users, bots, exposed keys, or metered
            bandwidth/API usage growing faster than the owner notices.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {billShockExamples.map((example) => (
          <a
            key={`${example.service}-${example.amount}`}
            href={example.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 bg-[#252525] p-3 transition hover:border-rose-300/40 hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-rose-200/70">{example.service}</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{example.amount}</h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1 text-xs font-medium text-slate-300">
                {example.source}
                <ExternalLink size={12} />
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{example.cause}</p>
          </a>
        ))}
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        These are external reports, not ShipCheap claims about your exact bill. Use them as warning signs for what to
        simulate and guard against.
      </p>
    </section>
  );
}

function RiskSummary({ result }: { result: RiskResult }) {
  const styles: Record<RiskLevel, string> = {
    low: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
    medium: "border-amber-400/25 bg-amber-400/10 text-amber-100",
    high: "border-rose-400/25 bg-rose-400/10 text-rose-100",
  };

  return (
    <div className={cn("rounded-lg border p-4", styles[result.level])}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          {result.level === "low" ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
          {result.label}
        </div>
        <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-semibold">{result.score}/100</span>
      </div>
      <p className="mt-3 text-sm leading-6 opacity-80">{result.summary}</p>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-[#1f1f1f] px-3 text-sm text-white outline-none transition focus:border-[#2442ed]/70"
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

function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-300">{label}</p>
      <div className="mt-1.5 grid overflow-hidden rounded-md border border-white/10 bg-[#1f1f1f]">
        {options.map(([optionValue, optionLabel]) => (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={cn(
              "border-b border-white/10 px-3 py-2 text-left text-sm transition last:border-b-0",
              value === optionValue ? "bg-[#2442ed]/25 text-white ring-1 ring-inset ring-[#2442ed]/60" : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  value,
  onChange,
  icon: Icon,
  yesLabel = "Yes",
  noLabel = "No",
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon: typeof CreditCard;
  yesLabel?: string;
  noLabel?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-300">{label}</p>
      <div className="mt-1.5 grid grid-cols-2 overflow-hidden rounded-md border border-white/10 bg-[#1f1f1f]">
        {[false, true].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex min-h-10 items-center justify-center gap-2 px-3 text-sm font-medium transition",
              value === option ? "bg-[#2442ed] text-white" : "text-slate-300 hover:bg-white/[0.04] hover:text-white",
            )}
          >
            <Icon size={15} />
            {option ? yesLabel : noLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Icon size={15} />
        {label}
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function ResultPanel({
  title,
  icon: Icon,
  items,
  tone,
}: {
  title: string;
  icon: typeof TrendingUp;
  items: string[];
  tone: "warn" | "good";
}) {
  const iconClass = tone === "good" ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300";

  return (
    <section className="rounded-lg border border-white/10 bg-[#252525] p-4 shadow-2xl shadow-black/20">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-md", iconClass)}>
          <Icon size={17} />
        </span>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
            {tone === "good" ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={16} /> : <Bell className="mt-0.5 shrink-0 text-amber-300" size={16} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
