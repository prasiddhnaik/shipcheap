import Link from "next/link";
import { notFound } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FeatureBadge } from "@/components/FeatureBadge";
import { ProviderLogo } from "@/components/ProviderLogo";
import { getPlatformBySlug, getPlatformCategory, getPlatformCommunityInfo, getPlatformSourceLinks, platforms, pricingDisclaimer } from "@/data/platforms";
import type { CommunityInfo, Platform, PlatformCategory } from "@/lib/types";
import { appTypeLabels, budgetLabels, categoryLabels, databaseLabels, regionLabels } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, CreditCard, Database, ExternalLink, MessageCircle, Server, ShieldAlert, Sparkles, Tags, Users, X } from "lucide-react";

export function generateStaticParams() {
  return platforms.map((platform) => ({ slug: platform.slug }));
}

export default async function PlatformDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);

  if (!platform) {
    notFound();
  }
  const category = getPlatformCategory(platform.slug);
  const sourceLinks = getPlatformSourceLinks(platform.slug);
  const communityInfo = getPlatformCommunityInfo(platform.slug);
  const fitInsights = getFitInsights(platform, category);

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
                  <ProviderLogo name={platform.name} large />
                  <div>
                    <h1 className="text-[30px] font-semibold leading-tight text-white sm:text-[38px]">{platform.name}</h1>
                    <p className="mt-1 text-sm text-slate-500">{categoryLabels[category]}</p>
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
            {sourceLinks.length > 0 && (
              <div className="mt-4 border-t border-violet-300/15 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-100/55">Official sources</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sourceLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-violet-300/20 px-2.5 py-1.5 text-xs font-semibold text-violet-100 transition hover:bg-violet-400/10"
                    >
                      {link.label}
                      <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <InfoPanel icon={Tags} title="Category" value={categoryLabels[category]} />
          <InfoPanel icon={CreditCard} title="Cost range" value={platform.costRange} />
          <InfoPanel icon={Server} title="Free tier details" value={platform.freeTierDetails} />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <InfoPanel
            icon={Database}
            title="Database fit"
            value={platform.databases.map((database) => databaseLabels[database]).join(", ") || "No bundled database support"}
          />
          {communityInfo && <CommunityPanel communityInfo={communityInfo} />}
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-white/10 bg-[#111821]/85 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-violet-300" />
                  <h2 className="text-lg font-semibold text-white">Fit summary</h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{fitInsights.summary}</p>
              </div>
              <span className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                {categoryLabels[category]}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Detail label="Best fit" value={platform.bestFor.join(", ")} />
              <Detail label="Deployment model" value={fitInsights.deploymentModel} />
              <Detail label="Operations owner" value={fitInsights.operationsOwner} />
              <Detail label="Billing model" value={fitInsights.billingModel} />
              <Detail label="Runtime fit" value={platform.supports.map((support) => appTypeLabels[support]).join(", ")} />
              <Detail label="Data fit" value={platform.databases.map((database) => databaseLabels[database]).join(", ") || "Bring your own external database"} />
              <Detail label="Budget fit" value={platform.budgetFit.map((budget) => budgetLabels[budget]).join(", ")} />
              <Detail label="Region strategy" value={fitInsights.regionStrategy} />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Guidance title="Choose this if" tone="good" items={fitInsights.chooseIf} />
              <Guidance title="Think twice if" tone="warn" items={fitInsights.thinkTwiceIf} />
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

function CommunityPanel({ communityInfo }: { communityInfo: CommunityInfo }) {
  const strengthLabel: Record<CommunityInfo["strength"], string> = {
    small: "Small",
    medium: "Medium",
    large: "Large",
    "very-large": "Very large",
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#111821]/85 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Users size={17} className="text-violet-300" />
          Users & community
        </div>
        <span className="rounded-md border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-xs font-semibold text-cyan-100">
          {strengthLabel[communityInfo.strength]}
        </span>
      </div>

      <div className="mt-3 rounded-lg border border-white/10 bg-[#080d14] p-3">
        <p className="text-xs font-medium text-slate-500">How many users?</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{communityInfo.userCount}</p>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-400">{communityInfo.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {communityInfo.links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
          >
            <MessageCircle size={12} />
            {link.label}
            <ExternalLink size={12} />
          </a>
        ))}
      </div>
    </div>
  );
}

function Guidance({ title, tone, items }: { title: string; tone: "good" | "warn"; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#080d14] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-5 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            {tone === "good" ? <Check className="mt-0.5 shrink-0 text-emerald-300" size={14} /> : <X className="mt-0.5 shrink-0 text-amber-300" size={14} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
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

function getFitInsights(platform: Platform, category: PlatformCategory) {
  const isSelfHosted = category === "self-hosted";
  const isCloudVm = category === "cloud-vm";
  const isServerless = category === "serverless" || !platform.alwaysOn;
  const isDatabase = category === "database";
  const noCard = platform.creditCardRequired ? "requires a billing account/card" : "has a no-card starter path";

  const deploymentModel = isSelfHosted
    ? "Self-hosted control plane running on your own server or cloud account."
    : isCloudVm
      ? "Infrastructure-first VM hosting where you install and operate the app stack."
      : isServerless
        ? "Managed serverless deployment with scaling and runtime limits handled by the provider."
        : isDatabase
          ? "Managed backend/data service that pairs with a separate frontend or app host."
          : "Managed app platform for deploying services without running the control plane yourself.";

  const operationsOwner = isSelfHosted || isCloudVm
    ? "You own server updates, backups, monitoring, incident response, and capacity planning."
    : isDatabase
      ? "The provider operates the data layer; you still own app integration, quotas, and access control."
      : "The provider handles most platform operations; you still own usage monitoring and plan limits.";

  const billingModel = isSelfHosted
    ? `The platform software can start at $0, but the real bill is the server, storage, backups, domains, and bandwidth; it ${noCard}.`
    : isCloudVm
      ? "Predictable VM-style pricing, but backups, storage, IPs, load balancers, and transfer can add cost."
      : platform.hasFreeTier
        ? `Free entry is possible, but production cost depends on quotas, usage, and upgrade path; it ${noCard}.`
        : `Paid entry from the start with costs tied to selected resources and connected services; it ${noCard}.`;

  const regionStrategy = platform.regions.includes("any")
    ? "Runs wherever your chosen server or cloud provider is located."
    : platform.regions.length >= 3
      ? "Broad regional coverage across US, Europe, and Asia."
      : `Best suited to ${platform.regions.map((region) => regionLabels[region]).join(" and ")} workloads.`;

  const summary = isSelfHosted
    ? `${platform.name} is strongest when you want PaaS-like deploys but still want to control the server and total hosting bill. It is not hands-off: operations quality depends on how well you manage the underlying machine.`
    : isCloudVm
      ? `${platform.name} is strongest when low-cost always-on infrastructure matters more than a managed app workflow. It gives control, but pushes operations work back to you.`
      : isDatabase
        ? `${platform.name} is strongest as the data/backend layer for an app, not necessarily as the only place your app runs. Pair it with an app host when you need general web services.`
        : `${platform.name} is strongest when you want a managed deployment path with less infrastructure work. The main tradeoff is understanding limits, billing rules, and whether the runtime fits your app.`;

  const chooseIf = [
    platform.bestFor[0],
    platform.pros[0],
    platform.creditCardRequired ? "You are comfortable setting budgets and alerts before deploying." : "You want a beginner path that can start without adding a card.",
  ].filter(Boolean);

  const thinkTwiceIf = [
    platform.cons[0],
    platform.warningNotes[0],
    isSelfHosted || isCloudVm ? "You need a provider to handle patching, backups, and incidents for you." : "You need long-running processes or infrastructure behavior outside this provider's runtime model.",
  ].filter(Boolean);

  return {
    billingModel,
    chooseIf,
    deploymentModel,
    operationsOwner,
    regionStrategy,
    summary,
    thinkTwiceIf,
  };
}
