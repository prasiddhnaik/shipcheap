import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FeatureBadge } from "@/components/FeatureBadge";
import { getProviderTheme, ProviderLogo } from "@/components/ProviderLogo";
import { getPlatformBySlug, getPlatformCategory, getPlatformCommunityInfo, getPlatformSourceLinks, platforms, pricingDisclaimer } from "@/data/platforms";
import type { CommunityInfo, DatabaseNeed, Platform, PlatformCategory } from "@/lib/types";
import { appTypeLabels, budgetLabels, categoryLabels, databaseLabels, regionLabels } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, CreditCard, Database, ExternalLink, MessageCircle, Server, ShieldAlert, Sparkles, Tags, Users, X } from "lucide-react";

type Tone = "good" | "warn" | "bad";

const toneBoxClasses: Record<Tone, string> = {
  bad: "bg-[var(--red)]",
  good: "bg-[var(--green)]",
  warn: "bg-[var(--yellow)]",
};

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
  const providerTheme = getProviderTheme(platform.name);
  const providerPanelStyle = {
    borderColor: providerTheme.border,
    background: `linear-gradient(135deg, ${providerTheme.softBackground}, var(--panel) 38%)`,
  } as CSSProperties;

  const stats = [
    { label: "Starter cost", value: platform.hasFreeTier ? "$0 entry" : "Paid entry", tone: platform.hasFreeTier ? "good" : "warn" },
    { label: "Card required", value: platform.creditCardRequired ? "Yes" : "No", tone: platform.creditCardRequired ? "warn" : "good" },
    { label: "Always-on", value: platform.alwaysOn ? "Supported" : "Limited", tone: platform.alwaysOn ? "good" : "warn" },
    { label: "Billing risk", value: platform.billingRisk, tone: platform.billingRisk === "low" ? "good" : platform.billingRisk === "medium" ? "warn" : "bad" },
  ] as const satisfies ReadonlyArray<{ label: string; tone: Tone; value: string }>;

  return (
    <AppChrome active="providers">
      <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
        <Link href="/compare" className="inline-flex items-center gap-2 text-sm font-medium text-[#002fa7] transition hover:text-[#002fa7]">
          <ArrowLeft size={15} />
          Back to comparison
        </Link>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]" style={providerPanelStyle}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <ProviderLogo name={platform.name} large />
                  <div>
                    <h1 className="text-[30px] font-semibold leading-tight text-[var(--foreground)] sm:text-[38px]">{platform.name}</h1>
                    <p className="mt-1 text-sm font-medium" style={{ color: providerTheme.text }}>{categoryLabels[category]}</p>
                  </div>
                </div>
                <p className="max-w-3xl text-base font-medium leading-7 text-[var(--foreground)]">{platform.description}</p>
              </div>
              <BillingRiskBadge risk={platform.billingRisk} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className={`border-[3px] border-[var(--line)] p-3 shadow-[3px_3px_0_var(--line)] ${toneBoxClasses[stat.tone]}`}>
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[var(--foreground)]">{stat.label}</p>
                  <p className="mt-2 text-base font-black capitalize leading-tight text-[var(--foreground)]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[7px_7px_0_var(--line)]">
            <div className="border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-5 py-3">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-[var(--foreground)]">
                <ShieldAlert size={18} />
                Billing note
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm font-medium leading-6 text-[var(--foreground)]">{pricingDisclaimer}</p>
              <Link
                href={`/compare?platform=${platform.slug}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 border-[3px] border-[var(--line)] px-4 py-2.5 text-sm font-black shadow-[4px_4px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)]"
                style={{ backgroundColor: providerTheme.accent, color: providerTheme.onAccent }}
              >
                Compare this provider
                <ArrowRight size={15} />
              </Link>
              {sourceLinks.length > 0 && (
                <div className="mt-5 border-t-[3px] border-[var(--line)] pt-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--foreground)]">Official sources</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sourceLinks.map((link) => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 border-2 border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-xs font-black text-[var(--foreground)] transition hover:bg-[var(--yellow)]"
                      >
                        {link.label}
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
          <InfoPanel icon={Tags} title="Category" value={categoryLabels[category]} />
          <InfoPanel icon={CreditCard} title="Cost range" value={platform.costRange} />
          <InfoPanel icon={Server} title="Free tier details" value={platform.freeTierDetails} />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <DatabaseFitPanel platform={platform} category={category} />
          {communityInfo && <CommunityPanel communityInfo={communityInfo} />}
        </section>

        <section className="mt-5 border-[3px] border-[var(--line)] bg-[var(--yellow)] p-4 shadow-[6px_6px_0_var(--line)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border-[3px] border-[var(--line)] bg-[var(--panel)] text-[var(--accent)]">
                <ShieldAlert size={18} />
              </span>
              <div>
                <h2 className="text-base font-black text-[var(--foreground)]">Stress-test {platform.name} before you pick it</h2>
                <p className="mt-1 max-w-3xl text-sm font-medium leading-6 text-[var(--foreground)]">
                  Answer a short provider-specific form, then run the full bill-risk simulator with your scenario prefilled.
                </p>
              </div>
            </div>
            <Link
              href={`/platforms/${platform.slug}/simulation`}
              className="inline-flex w-full items-center justify-center gap-2 border-[3px] border-[var(--line)] bg-[#002fa7] px-4 py-2.5 text-sm font-black text-white shadow-[4px_4px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)] sm:w-auto"
            >
              Simulate this provider
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[6px_6px_0_var(--line)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#002fa7]" />
                  <h2 className="text-lg font-black text-[var(--foreground)]">Fit summary</h2>
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{fitInsights.summary}</p>
              </div>
              <span className="border-2 border-[var(--line)] bg-[var(--yellow)] px-2.5 py-1 text-xs font-black text-[var(--foreground)]">
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

          <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[6px_6px_0_var(--line)]">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={18} className="text-[#002fa7]" />
              <h2 className="text-lg font-black text-[var(--foreground)]">Decision checks</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Use these notes as a launch checklist, not a final pricing promise. Verify live provider limits before moving real users.
            </p>

            <div className="mt-4 grid gap-3">
              <DecisionList title="Strengths" tone="good" items={platform.pros} />
              <DecisionList title="Watch outs" tone="warn" items={[...platform.cons, ...platform.warningNotes]} />
              <DecisionList title="Before launch" tone="neutral" items={getLaunchChecks(platform, category)} />
            </div>
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
    <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[5px_5px_0_var(--line)]">
      <div className="flex items-center gap-3 border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--line)] bg-[var(--panel)] text-[#002fa7]">
          <Icon size={17} />
        </span>
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--foreground)]">{title}</p>
      </div>
      <p className="p-4 text-sm font-medium leading-6 text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function DatabaseFitPanel({ platform, category }: { platform: Platform; category: PlatformCategory }) {
  const details = getDatabaseFitDetails(platform, category);

  return (
    <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[5px_5px_0_var(--line)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--line)] bg-[var(--panel)] text-[#002fa7]">
            <Database size={17} />
          </span>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--foreground)]">Database fit</p>
        </div>
        <span className="border-2 border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-xs font-black text-[var(--foreground)]">
          {details.role}
        </span>
      </div>

      <div className="p-4">
        <p className="text-sm font-medium leading-6 text-[var(--foreground)]">{details.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {details.databases.map((database) => (
            <span key={database} className="border-2 border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-xs font-black text-[var(--foreground)]">
              {databaseLabels[database]}
            </span>
          ))}
        </div>

        <dl className="mt-4 grid gap-3 border-t-[3px] border-[var(--line)] pt-4 sm:grid-cols-2">
          <div className="bg-[var(--paper)] p-3">
            <dt className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Best database use</dt>
            <dd className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">{details.bestUse}</dd>
          </div>
          <div className="bg-[var(--paper)] p-3">
            <dt className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Check before launch</dt>
            <dd className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">{details.launchCheck}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function getDatabaseFitDetails(platform: Platform, category: PlatformCategory) {
  const usableDatabases = platform.databases.filter((database): database is Exclude<DatabaseNeed, "none"> => database !== "none");

  if (usableDatabases.length === 0) {
    return {
      role: "External DB",
      databases: [] as DatabaseNeed[],
      summary: `${platform.name} is not listed with a bundled database fit in ShipCheap yet. Plan to connect a separate database provider for persistent data.`,
      bestUse: "Static sites, workers, APIs, or deployments where persistence is handled somewhere else.",
      launchCheck: "Confirm connection strings, private networking, backups, and billing on the external database provider.",
    };
  }

  const databaseList = usableDatabases.map((database) => databaseLabels[database]).join(", ");
  const role =
    category === "database"
      ? "Primary DB"
      : category === "frontend" || category === "serverless"
        ? "External DB fit"
        : "App + DB fit";

  const appHostingSummary =
    category === "app-hosting"
      ? `${platform.name} can host the app while supporting ${databaseList} workloads, but database limits and add-on details should be verified separately.`
      : `${platform.name} fits ${databaseList} workloads, with the exact storage, compute, and quota story depending on the current plan.`;

  return {
    role,
    databases: usableDatabases,
    summary: appHostingSummary,
    bestUse: platform.bestFor.slice(0, 3).join(", "),
    launchCheck:
      platform.cons.find((item) => item.toLowerCase().includes("database")) ||
      platform.warningNotes.find((item) => item.toLowerCase().includes("database")) ||
      "Verify backups, storage quotas, connection limits, regions, and whether a separate database provider is needed.",
  };
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">{value}</p>
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
    <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] shadow-[5px_5px_0_var(--line)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[var(--line)] bg-[var(--yellow)] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[var(--line)] bg-[var(--panel)] text-[#002fa7]">
            <Users size={17} />
          </span>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--foreground)]">Users & community</p>
        </div>
        <span className="border-2 border-[var(--line)] bg-[var(--panel)] px-2.5 py-1 text-xs font-black text-[var(--foreground)]">
          {strengthLabel[communityInfo.strength]}
        </span>
      </div>

      <div className="p-4">
        <div className="border-2 border-[var(--line)] bg-[var(--paper)] p-3">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">How many users?</p>
          <p className="mt-2 text-sm font-medium leading-6 text-[var(--foreground)]">{communityInfo.userCount}</p>
        </div>

        <p className="mt-3 text-sm font-medium leading-6 text-[var(--foreground)]">{communityInfo.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {communityInfo.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 border-2 border-[var(--line)] bg-[var(--paper)] px-2.5 py-1.5 text-xs font-black text-[var(--foreground)] transition hover:bg-[var(--yellow)]"
            >
              <MessageCircle size={12} />
              {link.label}
              <ExternalLink size={12} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Guidance({ title, tone, items }: { title: string; tone: "good" | "warn"; items: string[] }) {
  return (
    <div className={`border-2 border-[var(--line)] p-3 ${tone === "good" ? "bg-[var(--green)]/20" : "bg-[var(--yellow)]/35"}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-5 text-[var(--foreground)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            {tone === "good" ? <Check className="mt-0.5 shrink-0 text-[var(--green)]" size={14} /> : <X className="mt-0.5 shrink-0 text-[var(--accent)]" size={14} />}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DecisionList({ title, tone, items }: { title: string; tone: "good" | "warn" | "neutral"; items: string[] }) {
  const styles = {
    good: {
      background: "bg-[var(--green)]/20",
      marker: "text-[var(--green)]",
      title: "text-[var(--foreground)]",
      icon: Check,
    },
    warn: {
      background: "bg-[var(--yellow)]/35",
      marker: "text-[var(--accent)]",
      title: "text-[var(--foreground)]",
      icon: X,
    },
    neutral: {
      background: "bg-[var(--paper)]",
      marker: "text-[#002fa7]",
      title: "text-[var(--foreground)]",
      icon: ClipboardCheck,
    },
  }[tone];
  const Icon = styles.icon;

  return (
    <div className={`border-2 border-[var(--line)] p-4 ${styles.background}`}>
      <h3 className={`text-sm font-black ${styles.title}`}>{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--foreground)]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Icon className={`mt-1 shrink-0 ${styles.marker}`} size={14} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getLaunchChecks(platform: Platform, category: PlatformCategory) {
  const checks = [
    platform.creditCardRequired
      ? "Set budget alerts and spend notifications before attaching production traffic."
      : "Confirm the no-card starter path still exists before relying on it.",
    platform.hasFreeTier
      ? "Check the current free-tier quotas, sleep behavior, and upgrade trigger."
      : "Confirm the minimum paid plan covers your expected app, database, and bandwidth usage.",
    platform.databases.length > 0
      ? "Verify database storage, backups, connection limits, and whether the database is bundled or external."
      : "Pick and price the external database separately before launch.",
  ];

  if (platform.alwaysOn) {
    checks.push("Confirm always-on services, workers, and cron jobs are included in the plan you choose.");
  } else {
    checks.push("Test cold starts, sleep behavior, and any serverless duration limits with your real app shape.");
  }

  if (category === "serverless" || category === "frontend") {
    checks.push("Review function invocation, bandwidth, image optimization, and edge/runtime limits.");
  }

  return checks.slice(0, 4);
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
