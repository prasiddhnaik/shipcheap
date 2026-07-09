"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { ProviderLogo } from "@/components/ProviderLogo";
import { platforms } from "@/data/platforms";
import { buildLaunchChecklist } from "@/lib/launch-checklist";
import { ArrowRight, CheckCircle2, ClipboardCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const severityStyles = {
  required: "bg-[var(--red)]",
  recommended: "bg-[var(--yellow)]",
  verify: "bg-[var(--green)]",
} as const;

const severityLabels = {
  required: "Required",
  recommended: "Recommended",
  verify: "Verify",
} as const;

export function LaunchChecksClient({ initialSlug }: { initialSlug?: string }) {
  const initial = platforms.find((platform) => platform.slug === initialSlug) ?? platforms[0];
  const [slug, setSlug] = useState(initial.slug);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const platform = platforms.find((entry) => entry.slug === slug) ?? platforms[0];
  const items = useMemo(() => buildLaunchChecklist(platform), [platform]);
  const doneCount = items.filter((item) => checked[`${platform.slug}:${item.id}`]).length;

  function toggle(itemId: string) {
    const key = `${platform.slug}:${itemId}`;
    setChecked((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
      <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
        <div className="inline-flex items-center gap-2 border-2 border-[var(--line)] bg-[var(--yellow)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em]">
          <ClipboardCheck size={13} />
          Launch checks
        </div>
        <h1 className="mt-4 max-w-4xl text-[28px] font-black leading-tight text-[var(--foreground)] sm:text-[36px]">
          Turn a hosting pick into a pre-deploy checklist.
        </h1>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[var(--muted)]">
          No account needed. Pick a provider and walk the traps that usually create surprise bills or broken free tiers.
        </p>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[320px_1fr]">
        <aside className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-4 shadow-[7px_7px_0_var(--line)]">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Provider</span>
            <select
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="mt-2 h-11 w-full border-[3px] border-[var(--line)] bg-[var(--paper)] px-3 text-sm font-black outline-none focus:bg-[var(--yellow)]"
            >
              {platforms.map((entry) => (
                <option key={entry.slug} value={entry.slug}>
                  {entry.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 flex items-start gap-3 border-2 border-[var(--line)] bg-[var(--paper)] p-3">
            <ProviderLogo name={platform.name} large />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-black text-[var(--foreground)]">{platform.name}</h2>
                <BillingRiskBadge risk={platform.billingRisk} />
              </div>
              <p className="mt-2 text-sm font-medium leading-5 text-[var(--muted)]">{platform.costRange}</p>
            </div>
          </div>

          <p className="mt-4 text-sm font-black text-[var(--foreground)]">
            {doneCount}/{items.length} checks marked
          </p>

          <div className="mt-4 grid gap-2">
            <Link
              href={`/platforms/${platform.slug}`}
              className="inline-flex items-center justify-center gap-2 border-2 border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-black hover:bg-[var(--yellow)]"
            >
              Provider details
              <ArrowRight size={14} />
            </Link>
            <Link
              href={`/billing-risk?provider=${platform.slug}`}
              className="inline-flex items-center justify-center gap-2 border-2 border-[var(--line)] bg-[#002fa7] px-3 py-2 text-sm font-black text-white"
            >
              Run bill risk
              <ArrowRight size={14} />
            </Link>
          </div>
        </aside>

        <div className="space-y-3">
          {items.map((item) => {
            const key = `${platform.slug}:${item.id}`;
            const isDone = Boolean(checked[key]);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={cn(
                  "w-full border-[3px] border-[var(--line)] p-4 text-left shadow-[5px_5px_0_var(--line)] transition",
                  isDone ? "bg-[var(--green)]" : "bg-[var(--panel)] hover:bg-[var(--paper)]",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 place-items-center border-2 border-[var(--line)] bg-[var(--panel)]">
                      {isDone ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                    </span>
                    <div>
                      <h3 className="font-black text-[var(--foreground)]">{item.title}</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">{item.detail}</p>
                    </div>
                  </div>
                  <span className={cn("border-2 border-[var(--line)] px-2.5 py-1 text-xs font-black", severityStyles[item.severity])}>
                    {severityLabels[item.severity]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
