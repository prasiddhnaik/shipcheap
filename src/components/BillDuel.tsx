"use client";

import Link from "next/link";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { ProviderLogo } from "@/components/ProviderLogo";
import { platforms } from "@/data/platforms";
import {
  formatCurrency,
  formatProbability,
  simulateMonthlyBill,
  type BillSimulationResult,
  type SimulatorInput,
} from "@/lib/billing-risk-simulation";
import type { Platform, RiskLevel } from "@/lib/types";
import { cn, riskLabels } from "@/lib/utils";
import { ArrowRight, Swords, Zap } from "lucide-react";
import { useMemo, useState } from "react";

const MAX_DUELISTS = 3;

type DuelRow = {
  platform: Platform;
  simulation: BillSimulationResult;
  blowUpLabel: string;
};

export function BillDuel({ input }: { input: SimulatorInput }) {
  const defaultChallengers = useMemo(() => pickDefaultChallengers(input.providerSlug), [input.providerSlug]);
  const [challengerA, setChallengerA] = useState(defaultChallengers[0] ?? "");
  const [challengerB, setChallengerB] = useState(defaultChallengers[1] ?? "");

  const activeSlugs = useMemo(() => {
    return Array.from(
      new Set([input.providerSlug, challengerA, challengerB].filter((slug) => Boolean(slug) && slug !== "")),
    ).slice(0, MAX_DUELISTS);
  }, [challengerA, challengerB, input.providerSlug]);

  const challengerOptions = useMemo(
    () => platforms.filter((platform) => platform.slug !== input.providerSlug),
    [input.providerSlug],
  );

  const rows = useMemo(() => {
    return activeSlugs
      .map((slug) => {
        const platform = platforms.find((entry) => entry.slug === slug);
        if (!platform) return null;
        const simulation = simulateMonthlyBill({ ...input, providerSlug: platform.slug }, platform);
        return {
          platform,
          simulation,
          blowUpLabel: topCostCenter(simulation),
        } satisfies DuelRow;
      })
      .filter((row): row is DuelRow => row !== null)
      .sort((a, b) => b.simulation.p90 - a.simulation.p90 || b.simulation.overBudgetProbability - a.simulation.overBudgetProbability);
  }, [activeSlugs, input]);

  const firstToBlow = rows[0] ?? null;
  const safest = rows.length > 0 ? [...rows].sort((a, b) => a.simulation.p90 - b.simulation.p90 || a.simulation.overBudgetProbability - b.simulation.overBudgetProbability)[0] : null;
  const barMax = Math.max(...rows.map((row) => row.simulation.p90), 1);

  return (
    <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[7px_7px_0_var(--line)]">
      <div className="border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--foreground)]">
              <Swords size={14} />
              Bill duel
            </div>
            <h2 className="text-base font-black text-[var(--foreground)]">Same workload. Different providers. Who blows up first?</h2>
            <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-[var(--foreground)]">
              Keep the scenario fixed and pit up to {MAX_DUELISTS} providers against each other on P90 bill, over-budget odds, and the cost center that spikes first.
            </p>
          </div>
          {firstToBlow && safest && firstToBlow.platform.slug !== safest.platform.slug && (
            <div className="border-2 border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm font-black text-[var(--foreground)]">
              First to blow: {firstToBlow.platform.name}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Base provider</p>
            <p className="mt-2 text-sm font-black text-[var(--foreground)]">
              {platforms.find((platform) => platform.slug === input.providerSlug)?.name ?? input.providerSlug}
            </p>
          </div>
          <label className="block border-2 border-[var(--line)] bg-[var(--paper)] p-3">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Challenger A</span>
            <select
              value={challengerA}
              onChange={(event) => setChallengerA(event.target.value)}
              className="mt-2 h-10 w-full border-2 border-[var(--line)] bg-[var(--panel)] px-2 text-sm font-black text-[var(--foreground)] outline-none focus:bg-[var(--yellow)]"
            >
              <option value="">None</option>
              {challengerOptions.map((platform) => (
                <option key={platform.slug} value={platform.slug} disabled={platform.slug === challengerB}>
                  {platform.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block border-2 border-[var(--line)] bg-[var(--paper)] p-3">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Challenger B</span>
            <select
              value={challengerB}
              onChange={(event) => setChallengerB(event.target.value)}
              className="mt-2 h-10 w-full border-2 border-[var(--line)] bg-[var(--panel)] px-2 text-sm font-black text-[var(--foreground)] outline-none focus:bg-[var(--yellow)]"
            >
              <option value="">None</option>
              {challengerOptions.map((platform) => (
                <option key={platform.slug} value={platform.slug} disabled={platform.slug === challengerA}>
                  {platform.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {rows.length < 2 ? (
          <p className="border-2 border-[var(--line)] bg-[var(--paper)] p-3 text-sm font-medium text-[var(--foreground)]">
            Pick at least one challenger to run the duel.
          </p>
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-3">
              {rows.map((row) => {
                const isFirst = firstToBlow?.platform.slug === row.platform.slug;
                const isSafest = safest?.platform.slug === row.platform.slug;
                return (
                  <article
                    key={row.platform.slug}
                    className={cn(
                      "border-[3px] border-[var(--line)] bg-[var(--paper)] p-3 shadow-[4px_4px_0_var(--line)]",
                      isFirst && "bg-[var(--red)]",
                      isSafest && !isFirst && "bg-[var(--green)]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <ProviderLogo name={row.platform.name} large />
                        <div>
                          <h3 className="font-black text-[var(--foreground)]">{row.platform.name}</h3>
                          <p className="mt-1 text-xs font-medium text-[var(--foreground)]">
                            {isFirst ? "Blows up first" : isSafest ? "Safest in this duel" : "In the mix"}
                          </p>
                        </div>
                      </div>
                      <BillingRiskBadge risk={row.platform.billingRisk} />
                    </div>

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-black text-[var(--foreground)]">P90 bill</span>
                        <span className="font-black text-[var(--foreground)]">{formatCurrency(row.simulation.p90)}</span>
                      </div>
                      <div className="h-3 border-2 border-[var(--line)] bg-[var(--panel)]">
                        <div
                          className={riskBarTone(row.simulation.level)}
                          style={{ width: `${Math.max(6, Math.min(100, (row.simulation.p90 / barMax) * 100))}%`, height: "100%" }}
                        />
                      </div>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="border-2 border-[var(--line)] bg-[var(--panel)] p-2">
                        <dt className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Typical</dt>
                        <dd className="mt-1 font-black text-[var(--foreground)]">{formatCurrency(row.simulation.p50)}</dd>
                      </div>
                      <div className="border-2 border-[var(--line)] bg-[var(--panel)] p-2">
                        <dt className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Worst</dt>
                        <dd className="mt-1 font-black text-[var(--foreground)]">{formatCurrency(row.simulation.worst)}</dd>
                      </div>
                      <div className="border-2 border-[var(--line)] bg-[var(--panel)] p-2">
                        <dt className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Over budget</dt>
                        <dd className="mt-1 font-black text-[var(--foreground)]">{formatProbability(row.simulation.overBudgetProbability)}</dd>
                      </div>
                      <div className="border-2 border-[var(--line)] bg-[var(--panel)] p-2">
                        <dt className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--muted)]">Risk</dt>
                        <dd className="mt-1 font-black capitalize text-[var(--foreground)]">{riskLabels[row.simulation.level]}</dd>
                      </div>
                    </dl>

                    <div className="mt-3 flex items-start gap-2 border-2 border-[var(--line)] bg-[var(--panel)] p-2">
                      <Zap size={14} className="mt-0.5 shrink-0 text-[var(--foreground)]" />
                      <p className="text-xs font-medium leading-5 text-[var(--foreground)]">
                        First cost center to spike: <span className="font-black">{row.blowUpLabel}</span>
                      </p>
                    </div>

                    <Link
                      href={`/platforms/${row.platform.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-black text-[var(--accent)] underline-offset-4 hover:underline"
                    >
                      Provider details
                      <ArrowRight size={12} />
                    </Link>
                  </article>
                );
              })}
            </div>

            {firstToBlow && safest && (
              <p className="border-t-[3px] border-[var(--line)] pt-3 text-sm font-medium leading-6 text-[var(--foreground)]">
                Under this scenario, <span className="font-black">{firstToBlow.platform.name}</span> shows the highest P90 /
                over-budget pressure, while <span className="font-black">{safest.platform.name}</span> stays cheapest at the
                rough high-usage month. Verify live pricing before you trust the ranking.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function pickDefaultChallengers(primarySlug: string) {
  const preferred = ["railway", "render", "fly", "koyeb", "vercel", "digitalocean-app-platform"];
  const challengers = preferred.filter((slug) => slug !== primarySlug && platforms.some((platform) => platform.slug === slug));
  if (challengers.length >= 2) return challengers.slice(0, 2);

  return platforms
    .filter((platform) => platform.slug !== primarySlug)
    .slice(0, 2)
    .map((platform) => platform.slug);
}

function topCostCenter(simulation: BillSimulationResult) {
  const top = simulation.costCenters[0];
  if (!top) return "no major overage center";
  return `${top.label} (${formatCurrency(top.p90)})`;
}

function riskBarTone(level: RiskLevel) {
  if (level === "high") return "bg-[var(--red)]";
  if (level === "medium") return "bg-[var(--yellow)]";
  return "bg-[var(--green)]";
}
