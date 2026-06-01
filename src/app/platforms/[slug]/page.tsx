import Link from "next/link";
import { notFound } from "next/navigation";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FeatureBadge } from "@/components/FeatureBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { getPlatformBySlug, platforms, pricingDisclaimer } from "@/data/platforms";
import { appTypeLabels, databaseLabels, regionLabels } from "@/lib/utils";

export function generateStaticParams() {
  return platforms.map((platform) => ({ slug: platform.slug }));
}

export default async function PlatformDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);

  if (!platform) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href="/compare">
          Back to comparison
        </Link>
        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold text-white">{platform.name}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">{platform.description}</p>
            </div>
            <BillingRiskBadge risk={platform.billingRisk} />
          </div>
          <p className="mt-5 text-sm text-amber-100/80">{pricingDisclaimer}</p>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <Detail title="Cost range" value={platform.costRange} />
          <Detail title="Free tier details" value={platform.freeTierDetails} />
          <Detail title="Credit card requirement" value={platform.creditCardRequired ? "Credit card required" : "No card required for starter path"} />
          <Detail title="Always-on support" value={platform.alwaysOn ? "Supports always-on services" : "Best for non always-on/serverless workloads"} />
          <Detail title="Supported app types" value={platform.supports.map((support) => appTypeLabels[support]).join(", ")} />
          <Detail title="Supported databases" value={platform.databases.map((database) => databaseLabels[database]).join(", ") || "None"} />
          <Detail title="Regions" value={platform.regions.map((region) => regionLabels[region]).join(", ")} />
          <Detail title="Best use cases" value={platform.bestFor.join(", ")} />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <List title="Pros" items={platform.pros} />
          <List title="Cons" items={platform.cons} />
          <List title="Warning notes" items={platform.warningNotes} />
        </section>

        <div className="mt-6 flex flex-wrap gap-2">
          {platform.hasFreeTier && <FeatureBadge tone="good">Free tier</FeatureBadge>}
          {!platform.creditCardRequired && <FeatureBadge tone="good">No card</FeatureBadge>}
          {platform.supports.includes("docker") && <FeatureBadge>Docker</FeatureBadge>}
          {platform.databases.length > 0 && <FeatureBadge>Database</FeatureBadge>}
          <FeatureBadge>{platform.alwaysOn ? "Always-on" : "Serverless fit"}</FeatureBadge>
        </div>
      </main>
    </>
  );
}

function Detail({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/70 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
