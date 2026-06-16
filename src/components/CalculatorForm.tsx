"use client";

import { useMemo, useState } from "react";
import { PlatformCard } from "@/components/PlatformCard";
import { SaveComparisonButton } from "@/components/SaveComparisonButton";
import { defaultCalculatorInput, recommendPlatforms } from "@/lib/recommend-platform";
import type { AppType, Budget, CalculatorInput, DatabaseNeed, Region, RiskLevel } from "@/lib/types";
import { appTypeLabels, budgetLabels, databaseLabels, regionLabels, riskLabels } from "@/lib/utils";

const appTypes = Object.entries(appTypeLabels) as [AppType, string][];
const budgets = Object.entries(budgetLabels) as [Budget, string][];
const databases = Object.entries(databaseLabels) as [DatabaseNeed, string][];
const regions = Object.entries(regionLabels) as [Region, string][];
const risks = Object.entries(riskLabels) as [RiskLevel, string][];

export function CalculatorForm() {
  const [input, setInput] = useState<CalculatorInput>(defaultCalculatorInput);
  const [submitted, setSubmitted] = useState(false);
  const results = useMemo(() => recommendPlatforms(input), [input]);

  function update<K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  return (
    <section id="calculator" className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
        className="rounded-lg border border-[var(--line)] bg-[var(--paper)] p-5 shadow-[7px_7px_0_var(--line)]"
      >
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Hosting calculator</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Tell ShipCheap what you are deploying and it will rank beginner-safe hosting options.
          </p>
        </div>

        <div className="mt-6 space-y-5">
          <Select label="App type" value={input.appType} onChange={(value) => update("appType", value as AppType)} options={appTypes} />
          <Select label="Monthly budget" value={input.budget} onChange={(value) => update("budget", value as Budget)} options={budgets} />
          <Select label="Needs database" value={input.database} onChange={(value) => update("database", value as DatabaseNeed)} options={databases} />
          <Toggle label="Needs always-on hosting" value={input.alwaysOn} onChange={(value) => update("alwaysOn", value)} />
          <Toggle label="Has credit card available" value={input.hasCard} onChange={(value) => update("hasCard", value)} />
          <Select label="Preferred region" value={input.region} onChange={(value) => update("region", value as Region)} options={regions} />
          <Select label="Billing risk tolerance" value={input.riskLevel} onChange={(value) => update("riskLevel", value as RiskLevel)} options={risks} />
        </div>

        <button className="mt-6 w-full bg-[#002fa7] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#003399]">
          Rank hosting platforms
        </button>
      </form>

      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)]/70 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {submitted ? "Recommended platforms" : "Live recommendation preview"}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Ranked by app fit, budget fit, card requirement, database support, always-on support, region, and billing risk.
              </p>
            </div>
            <SaveComparisonButton input={input} results={results} />
          </div>
        </div>

        {results.slice(0, 3).map((result) => (
          <PlatformCard key={result.platform.slug} result={result} />
        ))}
      </div>
    </section>
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
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[var(--line)] bg-[var(--panel)] px-3 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[#002fa7]/70"
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

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">{label}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[true, false].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-md border px-3 py-3 text-sm font-semibold transition ${
              value === option
                ? "border-[#002fa7]/70 bg-[#002fa7]/15 text-[var(--accent)]"
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--foreground)] hover:bg-[var(--paper)]"
            }`}
          >
            {option ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}
