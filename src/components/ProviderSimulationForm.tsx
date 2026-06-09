"use client";

import { useRouter } from "next/navigation";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import {
  dataLoadLabels,
  defaultSimulatorInput,
  jobLoadLabels,
  spendControlLabels,
  trafficLabels,
  type DataLoad,
  type JobLoad,
  type SimulatorInput,
  type SpendControl,
  type TrafficLevel,
} from "@/lib/billing-risk-simulation";
import { ProviderLogo } from "@/components/ProviderLogo";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ArrowRight, CreditCard, Gauge, HardDrive, ShieldAlert } from "lucide-react";
import { useState } from "react";

type SimulationFormState = Omit<SimulatorInput, "providerSlug">;

export function ProviderSimulationForm({ platform }: { platform: Platform }) {
  const router = useRouter();
  const [input, setInput] = useState<SimulationFormState>({
    hasCard: platform.creditCardRequired,
    trafficLevel: defaultSimulatorInput.trafficLevel,
    spendControl: defaultSimulatorInput.spendControl,
    dataLoad: platform.databases.length > 0 ? "small" : "none",
    bandwidthHeavy: defaultSimulatorInput.bandwidthHeavy,
    keepsLogs: defaultSimulatorInput.keepsLogs,
    jobLoad: defaultSimulatorInput.jobLoad,
    monthlyUsers: defaultSimulatorInput.monthlyUsers,
    requestsPerUser: defaultSimulatorInput.requestsPerUser,
    avgResponseKb: defaultSimulatorInput.avgResponseKb,
    storageGb: platform.databases.length > 0 ? defaultSimulatorInput.storageGb : 0,
    jobHours: defaultSimulatorInput.jobHours,
    budgetLimit: defaultSimulatorInput.budgetLimit,
  });

  function update<K extends keyof SimulationFormState>(key: K, value: SimulationFormState[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  function runSimulation() {
    const params = new URLSearchParams({
      provider: platform.slug,
      hasCard: String(input.hasCard),
      traffic: input.trafficLevel,
      spend: input.spendControl,
      data: input.dataLoad,
      bandwidth: String(input.bandwidthHeavy),
      logs: String(input.keepsLogs),
      jobs: input.jobLoad,
      users: String(input.monthlyUsers),
      rpu: String(input.requestsPerUser),
      responseKb: String(input.avgResponseKb),
      storageGb: String(input.storageGb),
      jobHours: String(input.jobHours),
      budget: String(input.budgetLimit),
    });

    router.push(`/billing-risk?${params.toString()}`);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        runSimulation();
      }}
      className="rounded-lg border border-white/10 bg-[#252525] p-5 shadow-2xl shadow-black/20"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <ProviderLogo name={platform.name} large />
          <div>
            <h1 className="text-[28px] font-semibold leading-tight text-white sm:text-[34px]">{platform.name} bill-risk setup</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Answer a few questions, then ShipCheap opens the full simulator with this provider and scenario prefilled.
            </p>
          </div>
        </div>
        <BillingRiskBadge risk={platform.billingRisk} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ToggleField
          label="Will a credit card be attached?"
          value={input.hasCard}
          onChange={(value) => update("hasCard", value)}
          yesLabel="Card attached"
          noLabel="No card"
          icon={CreditCard}
        />
        <SegmentedControl
          label="Spend control"
          value={input.spendControl}
          onChange={(value) => update("spendControl", value)}
          options={Object.entries(spendControlLabels) as [SpendControl, string][]}
        />
        <SegmentedControl
          label="Traffic expectation"
          value={input.trafficLevel}
          onChange={(value) => update("trafficLevel", value)}
          options={Object.entries(trafficLabels) as [TrafficLevel, string][]}
        />
        <SegmentedControl
          label="Database or storage"
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
        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField label="Bandwidth-heavy app" value={input.bandwidthHeavy} onChange={(value) => update("bandwidthHeavy", value)} icon={Gauge} />
          <ToggleField label="Retain logs or metrics" value={input.keepsLogs} onChange={(value) => update("keepsLogs", value)} icon={HardDrive} />
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.02] p-4">
        <h2 className="text-base font-semibold text-white">Put in your numbers</h2>
        <p className="mt-1 text-sm leading-6 text-slate-400">These become the baseline for the simulated months.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NumberField label="Monthly users" value={input.monthlyUsers} min={0} onChange={(value) => update("monthlyUsers", value)} />
          <NumberField label="Requests per user" value={input.requestsPerUser} min={1} onChange={(value) => update("requestsPerUser", value)} />
          <NumberField label="Avg response KB" value={input.avgResponseKb} min={1} onChange={(value) => update("avgResponseKb", value)} />
          <NumberField label="Storage GB" value={input.storageGb} min={0} onChange={(value) => update("storageGb", value)} />
          <NumberField label="Worker/job hours" value={input.jobHours} min={0} onChange={(value) => update("jobHours", value)} />
          <NumberField label="Budget limit $" value={input.budgetLimit} min={1} onChange={(value) => update("budgetLimit", value)} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#2442ed]/30 bg-[#2442ed]/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 shrink-0 text-[#aeb9ff]" size={18} />
          <p className="max-w-2xl text-sm leading-6 text-[#e6eaff]/80">
            Use this to test the uncomfortable case: what happens if the app works, users arrive, bots crawl it, or usage grows faster than expected.
          </p>
        </div>
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#2442ed] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3b57ff] sm:w-auto">
          Run simulation
          <ArrowRight size={15} />
        </button>
      </div>
    </form>
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
    <label className="block">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1.5 h-10 w-full rounded-md border border-white/10 bg-[#1f1f1f] px-3 text-sm text-white outline-none transition focus:border-[#2442ed]/70"
      />
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
