import Link from "next/link";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FeatureBadge } from "@/components/FeatureBadge";
import type { RankedPlatform } from "@/lib/types";

export function PlatformCard({ result }: { result: RankedPlatform }) {
  const { platform } = result;

  return (
    <article className="rounded-lg border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-cyan-200">Rank #{result.rank} · Score {result.score}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{platform.name}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{platform.description}</p>
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Estimated cost</p>
          <p className="mt-2 text-sm text-slate-200">{platform.costRange}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best for</p>
          <p className="mt-2 text-sm text-slate-200">{platform.bestFor.join(", ")}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <List title="Why" items={result.matchedReasons.slice(0, 3)} />
        <List title="Pros" items={platform.pros.slice(0, 3)} />
        <List title="Cons" items={platform.cons.slice(0, 3)} />
      </div>

      <Link
        href={`/platforms/${platform.slug}`}
        className="mt-5 inline-flex rounded-md bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
      >
        View platform details
      </Link>
    </article>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
      <ul className="mt-2 space-y-2 text-sm leading-5 text-slate-300">
        {items.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
    </div>
  );
}
