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
      className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[7px_7px_0_var(--line)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-[3px] border-[var(--line)] bg-[var(--panel)] p-5">
        <div className="flex items-start gap-3">
          <ProviderLogo name={platform.name} large />
          <div>
            <h1 className="text-[28px] font-black leading-tight text-[var(--foreground)] sm:text-[34px]">{platform.name} bill-risk setup</h1>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[var(--foreground)]">
              Answer a few questions, then ShipCheap opens the full simulator with this provider and scenario prefilled.
            </p>
          </div>
        </div>
        <BillingRiskBadge risk={platform.billingRisk} />
      </div>

      <div className="p-5">
        <div className="grid gap-4 lg:grid-cols-2">
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

        <div className="mt-5 border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[5px_5px_0_var(--line)]">
          <div className="border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
            <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--foreground)]">Put in your numbers</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-[var(--foreground)]">These become the baseline for the simulated months.</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <NumberField label="Monthly users" value={input.monthlyUsers} min={0} onChange={(value) => update("monthlyUsers", value)} />
            <NumberField label="Requests per user" value={input.requestsPerUser} min={1} onChange={(value) => update("requestsPerUser", value)} />
            <NumberField label="Avg response KB" value={input.avgResponseKb} min={1} onChange={(value) => update("avgResponseKb", value)} />
            <NumberField label="Storage GB" value={input.storageGb} min={0} onChange={(value) => update("storageGb", value)} />
            <NumberField label="Worker/job hours" value={input.jobHours} min={0} onChange={(value) => update("jobHours", value)} />
            <NumberField label="Budget limit $" value={input.budgetLimit} min={1} onChange={(value) => update("budgetLimit", value)} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-[3px] border-[var(--line)] bg-[var(--yellow)] p-4 shadow-[5px_5px_0_var(--line)]">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border-[3px] border-[var(--line)] bg-[var(--panel)] text-[#002fa7]">
              <ShieldAlert size={18} />
            </span>
            <p className="max-w-2xl text-sm font-medium leading-6 text-[var(--foreground)]">
              Use this to test the uncomfortable case: what happens if the app works, users arrive, bots crawl it, or usage grows faster than expected.
            </p>
          </div>
          <button className="inline-flex w-full items-center justify-center gap-2 border-[3px] border-[var(--line)] bg-[#002fa7] px-4 py-2.5 text-sm font-black text-white shadow-[4px_4px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)] sm:w-auto">
            Run simulation
            <ArrowRight size={15} />
          </button>
        </div>
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
