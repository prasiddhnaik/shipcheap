import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { ComparisonTable } from "@/components/ComparisonTable";
import { getPlatformBySlug, pricingDisclaimer } from "@/data/platforms";
import { ArrowLeft, Filter, ShieldCheck } from "lucide-react";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const { platform } = await searchParams;
  const selectedPlatform = platform && getPlatformBySlug(platform) ? platform : undefined;

  return (
    <AppChrome active="compare">
      <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200">
          <ArrowLeft size={15} />
          Dashboard
        </Link>

        <section className="mt-4 rounded-lg border border-white/10 bg-[#111821]/85 p-5 shadow-2xl shadow-black/20">
          <div className="grid items-start gap-5 xl:grid-cols-[1fr_360px]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                <Filter size={13} />
                Full comparison
              </div>
              <h1 className="text-[28px] font-semibold leading-tight text-white sm:text-[34px]">Backend hosting comparison</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Compare common backend hosting options by free tier, card requirement, runtime support, database support,
                always-on fit, regions, billing risk, and best use cases.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-400/25 bg-emerald-400/10 p-4 text-sm text-emerald-100">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={17} />
                Billing-first view
              </div>
              <p className="mt-2 max-w-xs leading-6 text-emerald-100/75">{pricingDisclaimer}</p>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <ComparisonTable selectedPlatformSlug={selectedPlatform} />
        </section>
      </main>
    </AppChrome>
  );
}
