import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { ComparisonTable } from "@/components/ComparisonTable";
import { getPlatformBySlug, pricingDisclaimer } from "@/data/platforms";
import { ArrowLeft, Filter, ShieldCheck } from "lucide-react";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ platform?: string }> }) {
  const { platform } = await searchParams;
  const selectedPlatform = platform && getPlatformBySlug(platform) ? platform : undefined;

  return (
    <AppChrome active="compare" compactSidebar>
      <main className="mx-auto max-w-[1360px] px-4 py-6 sm:px-5 lg:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-[var(--accent)] underline-offset-4 transition hover:underline">
          <ArrowLeft size={15} />
          Dashboard
        </Link>

        <section className="brutal-panel mt-4 p-5">
          <div className="grid items-start gap-5 xl:grid-cols-[1fr_360px]">
            <div>
              <div className="brutal-badge mb-3 gap-2 bg-[var(--yellow)] px-3 py-1 text-xs uppercase">
                <Filter size={13} />
                Full comparison
              </div>
              <h1 className="text-[42px] font-black leading-[0.95] text-[var(--foreground)] sm:text-[60px]">Backend hosting comparison</h1>
              <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[var(--muted)]">
                Compare common backend hosting options by free tier, card requirement, runtime support, database support,
                always-on fit, regions, billing risk, and best use cases.
              </p>
            </div>
            <div className="border-[3px] border-[var(--line)] bg-[var(--green)] p-4 text-sm text-[var(--foreground)]">
              <div className="flex items-center gap-2 font-black">
                <ShieldCheck size={17} />
                Billing-first view
              </div>
              <p className="mt-2 max-w-xs font-bold leading-6">{pricingDisclaimer}</p>
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
