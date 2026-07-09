"use client";

import Link from "next/link";
import { BillDuel } from "@/components/BillDuel";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { ProviderLogo } from "@/components/ProviderLogo";
import { platforms } from "@/data/platforms";
import {
  dataLoadLabels,
  defaultSimulatorInput,
  formatCurrency,
  formatProbability,
  jobLoadLabels,
  simulateMonthlyBill,
  spendControlLabels,
  trafficLabels,
  type BillSimulationResult,
  type DataLoad,
  type JobLoad,
  type SimulatorInput,
  type SpendControl,
  type TrafficLevel,
} from "@/lib/billing-risk-simulation";
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
  headline: string;
  cause: string;
  source: string;
  href: string;
};

const billShockExamples: BillShockExample[] = [
  {
    service: "Vercel",
    headline: "Spend controls need explicit actions",
    cause:
      "Vercel's docs say spend amounts can trigger notifications, webhooks, or pausing, but project pausing must be enabled as an action.",
    source: "Vercel docs",
    href: "https://vercel.com/docs/spend-management",
  },
  {
    service: "Firebase/Gemini",
    headline: "Client keys can expose AI usage",
    cause:
      "Firebase docs warn against adding Gemini API access to app-exposed keys and recommend App Check for serious apps.",
    source: "Firebase docs",
    href: "https://firebase.google.com/docs/ai-logic/faq-and-troubleshooting",
  },
  {
    service: "Google/Gemini",
    headline: "$15.4k reported",
    cause: "TechRadar reported a case where an exposed Google API key was abused for Gemini requests before the owner could stop the spend.",
    source: "TechRadar",
    href: "https://www.techradar.com/pro/security/usd15k-bill-destroyed-a-solo-developers-startup-how-hackers-are-using-leaked-google-api-keys-to-go-wild-with-gemini-ai-for-free",
  },
  {
    service: "AWS",
    headline: "$45k reported",
    cause: "Tom's Hardware reported a compromised AWS account used for crypto-mining workloads that generated a large cloud bill.",
    source: "Tom's Hardware",
    href: "https://www.tomshardware.com/news/aws-45000-usd-bill-for-crypto-mining-hack",
  },
];

export function BillingRiskSimulator({ initialInput = defaultSimulatorInput }: { initialInput?: SimulatorInput } = {}) {
  const [input, setInput] = useState<SimulatorInput>(initialInput);
  const selectedProvider = platforms.find((platform) => platform.slug === input.providerSlug) ?? platforms[0];
  const riskChecklist = useMemo(() => calculateBillingRisk(input, selectedProvider), [input, selectedProvider]);
  const simulation = useMemo(() => simulateMonthlyBill(input, selectedProvider), [input, selectedProvider]);
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
      <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 border-2 border-[var(--line)] bg-[var(--yellow)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--foreground)]">
              <ShieldAlert size={13} />
              Billing risk simulator
            </div>
            <h1 className="max-w-4xl text-[28px] font-black leading-tight text-[var(--foreground)] sm:text-[36px]">
              Model the surprise-bill path before you deploy.
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[var(--foreground)]">
              Pick a provider and workload shape. ShipCheap estimates how user growth, bot traffic, bandwidth, API calls,
              and storage can turn a cheap deploy into real spend.
            </p>
          </div>
          <SimulationSummary simulation={simulation} />
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[440px_1fr]">
        <form className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[7px_7px_0_var(--line)]">
          <div className="border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--foreground)]">Scenario</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-[var(--foreground)]">Adjust the conditions that usually turn a cheap deploy into a risky one.</p>
          </div>

          <div className="space-y-5 p-4">
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
            <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[5px_5px_0_var(--line)]">
              <div className="border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-3 py-2">
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--foreground)]">Usage numbers</h3>
              </div>
              <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <NumberField label="Monthly users" value={input.monthlyUsers} min={0} onChange={(value) => update("monthlyUsers", value)} />
                <NumberField label="Requests/user" value={input.requestsPerUser} min={1} onChange={(value) => update("requestsPerUser", value)} />
                <NumberField label="Response KB" value={input.avgResponseKb} min={1} onChange={(value) => update("avgResponseKb", value)} />
                <NumberField label="Storage GB" value={input.storageGb} min={0} onChange={(value) => update("storageGb", value)} />
                <NumberField label="Job hours" value={input.jobHours} min={0} onChange={(value) => update("jobHours", value)} />
                <NumberField label="Budget $" value={input.budgetLimit} min={1} onChange={(value) => update("budgetLimit", value)} />
              </div>
            </div>
          </div>
        </form>

        <div className="grid gap-4">
          <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-4 shadow-[7px_7px_0_var(--line)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <ProviderLogo name={selectedProvider.name} large />
                <div>
                  <h2 className="text-xl font-black text-[var(--foreground)]">{selectedProvider.name}</h2>
                  <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-[var(--foreground)]">{selectedProvider.costRange}</p>
                </div>
              </div>
              <BillingRiskBadge risk={selectedProvider.billingRisk} />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric icon={Banknote} label="P90 simulated bill" value={formatCurrency(simulation.p90)} />
              <Metric icon={CreditCard} label="Card path" value={selectedProvider.creditCardRequired ? "Card likely" : "No-card path"} />
              <Metric icon={ServerCog} label="Always-on" value={selectedProvider.alwaysOn ? "Supported" : "Limited"} />
            </div>
          </section>

          <SimulationResults simulation={simulation} />

          <BillDuel key={input.providerSlug} input={input} />

          <section className="grid gap-4 lg:grid-cols-2">
            <ResultPanel title="Main risk drivers" icon={TrendingUp} items={riskChecklist.drivers} tone="warn" />
            <ResultPanel title="Controls to set first" icon={ListChecks} items={riskChecklist.mitigations} tone="good" />
          </section>

          <BillShockExamples />

          <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-4 shadow-[7px_7px_0_var(--line)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-[var(--foreground)]">Lower-risk alternatives</h2>
                <p className="mt-1 text-sm font-medium text-[var(--foreground)]">Providers with no-card paths or lower listed billing risk.</p>
              </div>
              <Link href="/compare" className="hidden items-center gap-2 border-2 border-[var(--line)] bg-[var(--yellow)] px-3 py-1.5 text-sm font-black text-[var(--foreground)] shadow-[3px_3px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)] sm:inline-flex">
                Compare all
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {saferProviders.map((platform) => (
                <Link
                  key={platform.slug}
                  href={`/platforms/${platform.slug}`}
                  className="border-2 border-[var(--line)] bg-[var(--paper)] p-3 transition hover:bg-[var(--yellow)]"
                >
                  <div className="flex items-start gap-3">
                    <ProviderLogo name={platform.name} large />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-[var(--foreground)]">{platform.name}</h3>
                        <BillingRiskBadge risk={platform.billingRisk} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-[var(--foreground)]">{platform.description}</p>
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
    <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[7px_7px_0_var(--line)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-[3px] border-[var(--line)] bg-[var(--red)] px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center border-2 border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)]">
              <ShieldAlert size={17} />
            </span>
            <h2 className="text-base font-black text-[var(--foreground)]">Billing incidents worth modeling</h2>
          </div>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[var(--foreground)]">
            Public docs and major reporting show the risk pattern: spend controls, exposed keys, compromised credentials,
            bots, or metered usage growing faster than the owner notices.
          </p>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2">
        {billShockExamples.map((example) => (
          <a
            key={`${example.service}-${example.headline}`}
            href={example.href}
            target="_blank"
            rel="noreferrer"
            className="border-2 border-[var(--line)] bg-[var(--paper)] p-3 transition hover:bg-[var(--yellow)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{example.service}</p>
                <h3 className="mt-1 text-lg font-black text-[var(--foreground)]">{example.headline}</h3>
              </div>
              <span className="inline-flex items-center gap-1 border-2 border-[var(--line)] bg-[var(--panel)] px-2 py-1 text-xs font-black text-[var(--foreground)]">
                {example.source}
                <ExternalLink size={12} />
              </span>
            </div>
            <p className="mt-3 text-sm font-medium leading-6 text-[var(--foreground)]">{example.cause}</p>
          </a>
        ))}
      </div>

      <p className="border-t-[3px] border-[var(--line)] px-4 py-3 text-xs font-medium leading-5 text-[var(--foreground)]">
        These examples are cautionary references from official docs or major reporting, not predictions or
        provider-specific price promises.
      </p>
    </section>
  );
}

function SimulationSummary({ simulation }: { simulation: BillSimulationResult }) {
  const styles: Record<RiskLevel, string> = {
    low: "bg-[var(--green)]",
    medium: "bg-[var(--yellow)]",
    high: "bg-[var(--red)]",
  };

  return (
    <div className={cn("border-[3px] border-[var(--line)] p-4 text-[var(--foreground)] shadow-[5px_5px_0_var(--line)]", styles[simulation.level])}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-black">
          {simulation.level === "low" ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
          {riskLabels[simulation.level]} simulated bill risk
        </div>
        <span className="border-2 border-[var(--line)] bg-[var(--panel)] px-3 py-1 text-sm font-black">{simulation.runs.toLocaleString("en-US")} runs</span>
      </div>
      <p className="mt-3 text-sm font-medium leading-6">{simulation.headline}</p>
    </div>
  );
}

function SimulationResults({ simulation }: { simulation: BillSimulationResult }) {
  const barMax = Math.max(simulation.worst, simulation.p90, 1);
  const bars = [
    { label: "Typical month", value: simulation.p50, tone: "bg-[var(--green)]" },
    { label: "Bad month", value: simulation.p90, tone: "bg-[var(--yellow)]" },
    { label: "Worst sampled", value: simulation.worst, tone: "bg-[var(--red)]" },
  ];

  return (
    <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[7px_7px_0_var(--line)]">
      <div className="border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[var(--foreground)]">Simulated monthly bill</h2>
          <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-[var(--foreground)]">
            ShipCheap sampled {simulation.runs.toLocaleString("en-US")} possible months from this scenario. The values are rough estimates for risk shape, not official pricing.
          </p>
        </div>
        {simulation.uncappedP90 > simulation.p90 + 1 && (
          <span className="border-2 border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-xs font-black text-[var(--foreground)]">
            uncapped P90 {formatCurrency(simulation.uncappedP90)}
          </span>
        )}
      </div>
      </div>

      <div className="space-y-3 p-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-black text-[var(--foreground)]">{bar.label}</span>
              <span className="font-black text-[var(--foreground)]">{formatCurrency(bar.value)}</span>
            </div>
            <div className="h-4 border-2 border-[var(--line)] bg-[var(--paper)]">
              <div className={`h-full ${bar.tone}`} style={{ width: `${Math.max(4, Math.min(100, bar.value / barMax * 100))}%` }} />
            </div>
          </div>
        ))}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ProbabilityCard label={`Chance over your budget (${inputBudgetLabel(simulation)})`} value={formatProbability(simulation.overBudgetProbability)} />
        <ProbabilityCard label="Chance over $25" value={formatProbability(simulation.over25Probability)} />
        <ProbabilityCard label="Chance over $100" value={formatProbability(simulation.over100Probability)} />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
        <div className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
          <h3 className="text-sm font-black text-[var(--foreground)]">Modeled high-usage month</h3>
          <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">
            Around {Math.round(simulation.sampleUsersP90).toLocaleString("en-US")} users and{" "}
            {Math.round(simulation.sampleRequestsP90).toLocaleString("en-US")} requests in the rough P90 usage sample.
          </p>
        </div>
        <div className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
          <h3 className="text-sm font-black text-[var(--foreground)]">Largest cost centers</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {simulation.costCenters.length > 0 ? (
              simulation.costCenters.map((center) => (
                <span key={center.label} className="border-2 border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-xs font-black text-[var(--foreground)]">
                  {center.label}: {formatCurrency(center.p90)}
                </span>
              ))
            ) : (
              <span className="text-sm font-medium text-[var(--foreground)]">No major overage center in this scenario.</span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-3 border-t-[3px] border-[var(--line)] pt-3 text-xs font-medium leading-5 text-[var(--foreground)]">{simulation.caveat}</p>
      </div>
    </section>
  );
}

function inputBudgetLabel(simulation: BillSimulationResult) {
  return formatCurrency(simulation.budgetLimit);
}

function ProbabilityCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-lg font-black text-[var(--foreground)]">{value}</p>
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
    <label className="block border-[3px] border-[var(--line)] bg-[var(--paper)] p-3 shadow-[4px_4px_0_var(--line)]">
      <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full border-[3px] border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-black text-[var(--foreground)] outline-none transition focus:bg-[var(--yellow)]"
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
    <div className="border-[3px] border-[var(--line)] bg-[var(--paper)] p-3 shadow-[4px_4px_0_var(--line)]">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{label}</p>
      <div className="mt-2 grid gap-2">
        {options.map(([optionValue, optionLabel]) => (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={cn(
              "border-2 border-[var(--line)] px-3 py-2 text-left text-sm font-black transition",
              value === optionValue
                ? "bg-[#002fa7] text-white shadow-[3px_3px_0_var(--line)]"
                : "bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--yellow)]",
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
    <div className="border-[3px] border-[var(--line)] bg-[var(--paper)] p-3 shadow-[4px_4px_0_var(--line)]">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{label}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[false, true].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex min-h-11 items-center justify-center gap-2 border-2 border-[var(--line)] px-3 text-sm font-black transition",
              value === option
                ? "bg-[#002fa7] text-white shadow-[3px_3px_0_var(--line)]"
                : "bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--yellow)]",
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

function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block border-2 border-[var(--line)] bg-[var(--paper)] p-3">
      <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 h-11 w-full border-[3px] border-[var(--line)] bg-[var(--panel)] px-3 text-sm font-black text-[var(--foreground)] outline-none transition focus:bg-[var(--yellow)]"
      />
    </label>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: string }) {
  return (
    <div className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">
        <Icon size={15} />
        {label}
      </div>
      <p className="mt-2 text-lg font-black text-[var(--foreground)]">{value}</p>
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
  const iconClass = tone === "good" ? "bg-[var(--green)] text-[var(--foreground)]" : "bg-[var(--yellow)] text-[var(--foreground)]";

  return (
    <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-4 shadow-[7px_7px_0_var(--line)]">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-8 w-8 items-center justify-center border-2 border-[var(--line)]", iconClass)}>
          <Icon size={17} />
        </span>
        <h2 className="text-base font-black text-[var(--foreground)]">{title}</h2>
      </div>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm font-medium leading-6 text-[var(--foreground)]">
            {tone === "good" ? <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--green)]" size={16} /> : <Bell className="mt-0.5 shrink-0 text-[#002fa7]" size={16} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
