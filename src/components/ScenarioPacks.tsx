"use client";

import Link from "next/link";
import { scenarioPacks } from "@/lib/scenario-packs";
import type { CalculatorInput } from "@/lib/types";
import { ArrowRight, Sparkles } from "lucide-react";

export function ScenarioPacks({
  onApply,
}: {
  onApply: (input: CalculatorInput) => void;
}) {
  return (
    <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-4 shadow-[7px_7px_0_var(--line)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">
            <Sparkles size={13} />
            Scenario packs
          </div>
          <h2 className="text-base font-black text-[var(--foreground)]">Start from a real beginner situation</h2>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-[var(--muted)]">
            One click fills the calculator. Then rank providers or jump into bill risk.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {scenarioPacks.map((pack) => (
          <div key={pack.id} className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
            <h3 className="font-black text-[var(--foreground)]">{pack.title}</h3>
            <p className="mt-2 text-sm font-medium leading-5 text-[var(--muted)]">{pack.summary}</p>
            <p className="mt-2 text-xs font-medium leading-5 text-[var(--foreground)]">{pack.riskHint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onApply(pack.input)}
                className="inline-flex items-center gap-1 border-2 border-[var(--line)] bg-[#002fa7] px-2.5 py-1.5 text-xs font-black text-white"
              >
                Apply
                <ArrowRight size={12} />
              </button>
              <Link
                href={`/billing-risk?provider=koyeb&hasCard=${pack.input.hasCard}&traffic=${pack.input.alwaysOn ? "steady" : "small"}&budget=${pack.input.budget === "free" ? 10 : pack.input.budget === "under-5" ? 5 : pack.input.budget === "under-10" ? 10 : 25}`}
                className="inline-flex items-center gap-1 border-2 border-[var(--line)] bg-[var(--yellow)] px-2.5 py-1.5 text-xs font-black"
              >
                Bill risk
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
