import Link from "next/link";
import type { CSSProperties } from "react";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FeatureBadge } from "@/components/FeatureBadge";
import { getProviderTheme, ProviderLogo } from "@/components/ProviderLogo";
import { getPlatformCategory } from "@/data/platforms";
import type { RankedPlatform } from "@/lib/types";
import { categoryLabels } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function PlatformCard({ result }: { result: RankedPlatform }) {
  const { platform } = result;
  const category = getPlatformCategory(platform.slug);
  const theme = getProviderTheme(platform.name);
  const providerStyle = {
    color: theme.text,
  } as CSSProperties;

  return (
    <article className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]" style={providerStyle}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <ProviderLogo name={platform.name} large />
          <div>
            <p className="text-xs font-black uppercase text-[var(--muted)]">Rank #{result.rank} · Score {result.score}</p>
            <h3 className="mt-1 text-3xl font-black text-[var(--foreground)]">{platform.name}</h3>
            <p className="mt-1 text-xs font-black uppercase text-[var(--muted)]">{categoryLabels[category]}</p>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--muted)]">{platform.description}</p>
          </div>
        </div>
        <BillingRiskBadge risk={platform.billingRisk} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {platform.hasFreeTier && <FeatureBadge tone="good">Free tier</FeatureBadge>}
        {!platform.creditCardRequired && <FeatureBadge tone="good">No card</FeatureBadge>}
        {platform.supports.includes("docker") && <FeatureBadge>Docker</FeatureBadge>}
        {platform.databases.length > 0 && <FeatureBadge>Database</FeatureBadge>}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <p className="brutal-label">Estimated cost</p>
          <p className="mt-2 text-sm font-black text-[var(--foreground)]">{platform.costRange}</p>
        </div>
        <div>
          <p className="brutal-label">Best for</p>
          <p className="mt-2 text-sm font-black text-[var(--foreground)]">{platform.bestFor.join(", ")}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <List title="Why" items={result.matchedReasons.slice(0, 3)} />
        <List title="Pros" items={platform.pros.slice(0, 3)} />
        <List title="Cons" items={platform.cons.slice(0, 3)} />
      </div>

      <Link
        href={`/platforms/${platform.slug}`}
        className="brutal-button mt-5 px-3 py-2 text-sm"
      >
        View platform details
        <ArrowRight size={14} />
      </Link>
    </article>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="brutal-label">{title}</p>
      <ul className="mt-2 space-y-2 text-sm font-medium leading-5 text-[var(--muted)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
