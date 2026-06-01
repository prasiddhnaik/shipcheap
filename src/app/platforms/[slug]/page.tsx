import Link from "next/link";
import { notFound } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FeatureBadge } from "@/components/FeatureBadge";
import { getPlatformBySlug, platforms, pricingDisclaimer } from "@/data/platforms";
import { appTypeLabels, budgetLabels, databaseLabels, regionLabels } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, CreditCard, Database, Server, ShieldAlert, Sparkles, X } from "lucide-react";

export function generateStaticParams() {
  return platforms.map((platform) => ({ slug: platform.slug }));
}

export default async function PlatformDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);

  if (!platform) {
    notFound();
  }

  const stats = [
    { label: "Starter cost", value: platform.hasFreeTier ? "$0 entry" : "Paid entry", tone: platform.hasFreeTier ? "good" : "warn" },
    { label: "Card required", value: platform.creditCardRequired ? "Yes" : "No", tone: platform.creditCardRequired ? "warn" : "good" },
    { label: "Always-on", value: platform.alwaysOn ? "Supported" : "Limited", tone: platform.alwaysOn ? "good" : "warn" },
    { label: "Billing risk", value: platform.billingRisk, tone: platform.billingRisk === "low" ? "good" : platform.billingRisk === "medium" ? "warn" : "bad" },
  ] as const;

  return (
    <AppChrome active="providers">
      <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
        <Link href="/compare" className="inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200">
          <ArrowLeft size={15} />
          Back to comparison
        </Link>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-white/10 bg-[#111821]/85 p-5 shadow-2xl shadow-black/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <ProviderIcon name={platform.name} />
                  <div>
                    <h1 className="text-[30px] font-semibold leading-tight text-white sm:text-[38px]">{platform.name}</h1>
                    <p className="mt-1 text-sm text-slate-500">Provider details</p>
                  </div>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-slate-400">{platform.description}</p>
              </div>
              <BillingRiskBadge risk={platform.billingRisk} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-white/10 bg-[#080d14] p-3">
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <p
                    className={`mt-2 text-sm font-semibold capitalize ${
                      stat.tone === "good" ? "text-emerald-300" : stat.tone === "warn" ? "text-amber-300" : "text-rose-300"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-violet-300/20 bg-violet-500/10 p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-violet-100">
              <ShieldAlert size={18} />
              Billing note
            </div>
            <p className="mt-3 text-sm leading-6 text-violet-100/75">{pricingDisclaimer}</p>
            <Link
              href={`/compare?platform=${platform.slug}`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              Compare this provider
              <ArrowRight size={15} />
            </Link>
          </aside>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <InfoPanel icon={CreditCard} title="Cost range" value={platform.costRange} />
          <InfoPanel icon={Server} title="Free tier details" value={platform.freeTierDetails} />
          <InfoPanel
            icon={Database}
            title="Database fit"
            value={platform.databases.map((database) => databaseLabels[database]).join(", ") || "No bundled database support"}
          />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-white/10 bg-[#111821]/85 p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-violet-300" />
              <h2 className="text-lg font-semibold text-white">Fit summary</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail label="Best for" value={platform.bestFor.join(", ")} />
              <Detail label="Supported app types" value={platform.supports.map((support) => appTypeLabels[support]).join(", ")} />
              <Detail label="Budget fit" value={platform.budgetFit.map((budget) => budgetLabels[budget]).join(", ")} />
              <Detail label="Regions" value={platform.regions.map((region) => regionLabels[region]).join(", ")} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {platform.hasFreeTier && <FeatureBadge tone="good">Free tier</FeatureBadge>}
              {!platform.creditCardRequired && <FeatureBadge tone="good">No card</FeatureBadge>}
              {platform.supports.includes("docker") && <FeatureBadge>Docker</FeatureBadge>}
              {platform.databases.length > 0 && <FeatureBadge>Database</FeatureBadge>}
              <FeatureBadge>{platform.alwaysOn ? "Always-on" : "Serverless fit"}</FeatureBadge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <List title="Pros" tone="good" items={platform.pros} />
            <List title="Watch outs" tone="warn" items={[...platform.cons, ...platform.warningNotes]} />
          </div>
        </section>
      </main>
    </AppChrome>
  );
}

function InfoPanel({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111821]/85 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Icon size={17} className="text-violet-300" />
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-400">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#080d14] p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function List({ title, tone, items }: { title: string; tone: "good" | "warn"; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#111821]/85 p-5">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            {tone === "good" ? <Check className="mt-1 shrink-0 text-emerald-300" size={14} /> : <X className="mt-1 shrink-0 text-amber-300" size={14} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProviderIcon({ name }: { name: string }) {
  const colors = name === "Railway" ? "bg-purple-500 text-white" : name === "Fly.io" ? "bg-slate-800 text-white" : "bg-white text-slate-950";
  return <span className={`inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-lg text-xl font-black ${colors}`}>{name.slice(0, 1)}</span>;
}
