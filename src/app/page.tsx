import Link from "next/link";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ComparisonTable } from "@/components/ComparisonTable";
import { SiteHeader } from "@/components/SiteHeader";
import { pricingDisclaimer } from "@/data/platforms";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_34rem),linear-gradient(180deg,#020617,#0f172a)]">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
            <div className="self-center">
              <h1 className="text-5xl font-semibold tracking-normal text-white sm:text-6xl">ShipCheap</h1>
              <p className="mt-5 text-2xl font-medium text-cyan-100">Backend hosting without billing jumpscares.</p>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Compare Render, Railway, Fly.io, Koyeb, Vercel, Supabase, Neon, and DigitalOcean App Platform by
                deployment fit, beginner billing risk, card requirements, database support, and region.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="rounded-md bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200" href="#calculator">
                  Start calculator
                </a>
                <Link className="rounded-md border border-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/[0.06]" href="/compare">
                  Compare all platforms
                </Link>
              </div>
              <p className="mt-6 max-w-xl text-sm leading-6 text-amber-100/80">{pricingDisclaimer}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
              <div className="grid gap-3">
                {["No card beginner path", "Always-on backend fit", "Database add-ons", "Billing risk warning"].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-md border border-white/10 bg-slate-950/70 px-4 py-4">
                    <span className="text-sm font-medium text-slate-200">{item}</span>
                    <span className="font-mono text-sm text-cyan-200">{index === 0 ? "Koyeb" : index === 1 ? "Fly.io" : index === 2 ? "Neon" : "Low"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
          <CalculatorForm />
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Comparison preview</h2>
                <p className="mt-2 text-sm text-slate-400">Filter the starter platform data by the beginner constraints that matter most.</p>
              </div>
              <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href="/compare">
                Open full comparison
              </Link>
            </div>
            <ComparisonTable />
          </section>
        </div>
      </main>
    </>
  );
}
