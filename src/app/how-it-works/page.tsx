import Link from "next/link";
import type { Metadata } from "next";
import { AppChrome } from "@/components/AppChrome";
import { ArrowRight, BadgeDollarSign, CheckCircle2, ClipboardCheck, Database, Gauge, Search, ShieldAlert, SlidersHorizontal } from "lucide-react";

export const metadata: Metadata = {
  title: "How ShipCheap Works | ShipCheap",
  description: "How ShipCheap ranks backend hosting options and checks billing risk before you deploy.",
};

const steps = [
  {
    title: "Describe the backend",
    body: "Choose runtime, budget, database, region, card availability, and risk tolerance. ShipCheap keeps the questions narrow because backend hosting decisions fail on concrete constraints.",
    icon: SlidersHorizontal,
  },
  {
    title: "Match provider fit",
    body: "The recommendation engine compares your requirements against provider traits: free tier, card requirement, always-on support, runtime fit, data fit, region coverage, and billing risk.",
    icon: Search,
  },
  {
    title: "Stress-test the bill",
    body: "The simulator models traffic, storage, jobs, bandwidth, logs, and spend controls so a cheap first deploy is checked against the uncomfortable growth case.",
    icon: Gauge,
  },
  {
    title: "Verify before launch",
    body: "Provider pages keep official sources and launch checks close to the decision, because pricing, quotas, and account rules change faster than most comparison tables.",
    icon: ClipboardCheck,
  },
];

const signals = [
  { label: "Budget fit", value: "Free, under $5, under $10, under $25, or custom", icon: BadgeDollarSign },
  { label: "Data fit", value: "Postgres, Redis, MySQL, document stores, SQLite, or external DB", icon: Database },
  { label: "Risk fit", value: "Card requirement, free-tier safety, spend controls, and usage exposure", icon: ShieldAlert },
];

const checks = [
  "Can the provider run this backend shape without forcing a different architecture?",
  "Can a beginner start safely, especially if they do not want to attach a card?",
  "What costs appear when the app gets users, bots, storage, logs, or background jobs?",
  "Which provider docs should be checked before trusting a recommendation?",
];

export default function HowItWorksPage() {
  return (
    <AppChrome active="none" supportActive="how-it-works">
      <main className="mx-auto max-w-[1180px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
          <div className="inline-flex items-center gap-2 border-2 border-[var(--line)] bg-[var(--yellow)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--foreground)]">
            <CheckCircle2 size={14} />
            How it works
          </div>
          <h1 className="mt-5 max-w-4xl text-[34px] font-black leading-tight text-[var(--foreground)] sm:text-[52px]">
            Pick a backend host by constraints, not vibes.
          </h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-[var(--foreground)]">
            ShipCheap turns backend requirements into ranked hosting options, then checks the billing paths that usually surprise people after launch.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/#calculator"
              className="inline-flex items-center gap-2 border-[3px] border-[var(--line)] bg-[#002fa7] px-4 py-2.5 text-sm font-black text-white shadow-[4px_4px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)]"
            >
              Start with requirements
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/billing-risk"
              className="inline-flex items-center gap-2 border-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-2.5 text-sm font-black text-[var(--foreground)] shadow-[4px_4px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)]"
            >
              Open risk simulator
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[5px_5px_0_var(--line)]">
              <div className="flex items-center justify-between gap-3 border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
                <span className="grid h-9 w-9 place-items-center border-2 border-[var(--line)] bg-[var(--panel)] text-[#002fa7]">
                  <step.icon size={18} />
                </span>
                <span className="border-2 border-[var(--line)] bg-[var(--panel)] px-2 py-1 text-xs font-black">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-black text-[var(--foreground)]">{step.title}</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-[var(--foreground)]">{step.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[6px_6px_0_var(--line)]">
            <div className="border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
              <h2 className="text-sm font-black uppercase tracking-[0.12em] text-[var(--foreground)]">Signals ShipCheap weighs</h2>
            </div>
            <div className="grid gap-3 p-4">
              {signals.map((signal) => (
                <div key={signal.label} className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
                  <div className="flex items-center gap-2 text-sm font-black text-[var(--foreground)]">
                    <signal.icon size={16} className="text-[#002fa7]" />
                    {signal.label}
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">{signal.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[6px_6px_0_var(--line)]">
            <h2 className="text-2xl font-black text-[var(--foreground)]">What “best” means here</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-[var(--foreground)]">
              ShipCheap is not trying to name the most powerful cloud. It is trying to find the provider that best fits the backend you are actually deploying, with the fewest surprise-bill paths.
            </p>
            <ul className="mt-4 grid gap-3">
              {checks.map((check) => (
                <li key={check} className="flex gap-3 border-2 border-[var(--line)] bg-[var(--paper)] p-3 text-sm font-medium leading-6 text-[var(--foreground)]">
                  <CheckCircle2 className="mt-1 shrink-0 text-[var(--green)]" size={16} />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-5 border-[3px] border-[var(--line)] bg-[var(--yellow)] p-5 shadow-[6px_6px_0_var(--line)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-[var(--foreground)]">The final answer still needs a live check.</h2>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[var(--foreground)]">
                ShipCheap narrows the field and exposes risk. Before production, use each provider page’s official sources to verify current quotas, card rules, regions, and pricing.
              </p>
            </div>
            <Link
              href="/compare"
              className="inline-flex w-full items-center justify-center gap-2 border-[3px] border-[var(--line)] bg-[#002fa7] px-4 py-2.5 text-sm font-black text-white shadow-[4px_4px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)] sm:w-auto"
            >
              Compare providers
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </main>
    </AppChrome>
  );
}
