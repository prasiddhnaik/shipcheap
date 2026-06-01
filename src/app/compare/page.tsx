import { ComparisonTable } from "@/components/ComparisonTable";
import { SiteHeader } from "@/components/SiteHeader";
import { pricingDisclaimer } from "@/data/platforms";

export default function ComparePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-white">Backend hosting comparison</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            Compare common backend hosting options by free tier, card requirement, runtime support, database support,
            always-on fit, regions, billing risk, and best use cases.
          </p>
          <p className="mt-4 text-sm text-amber-100/80">{pricingDisclaimer}</p>
        </div>
        <ComparisonTable />
      </main>
    </>
  );
}
