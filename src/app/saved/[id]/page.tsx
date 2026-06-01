import Link from "next/link";
import { notFound } from "next/navigation";
import { PlatformCard } from "@/components/PlatformCard";
import { SiteHeader } from "@/components/SiteHeader";
import { prisma } from "@/lib/prisma";
import type { RankedPlatform } from "@/lib/types";
import { appTypeLabels, budgetLabels, databaseLabels, regionLabels, riskLabels } from "@/lib/utils";

export default async function SavedComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const saved = await prisma.savedComparison.findUnique({ where: { id } });

  if (!saved) {
    notFound();
  }

  const results = saved.resultJson as unknown as RankedPlatform[];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
          <p className="font-mono text-xs text-cyan-200">Saved {saved.createdAt.toLocaleString()}</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Saved hosting comparison</h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="App type" value={appTypeLabels[saved.appType as keyof typeof appTypeLabels] ?? saved.appType} />
            <Meta label="Budget" value={budgetLabels[saved.budget as keyof typeof budgetLabels] ?? saved.budget} />
            <Meta label="Database" value={databaseLabels[saved.database as keyof typeof databaseLabels] ?? saved.database} />
            <Meta label="Region" value={regionLabels[saved.region as keyof typeof regionLabels] ?? saved.region} />
            <Meta label="Always-on" value={saved.alwaysOn ? "Yes" : "No"} />
            <Meta label="Has card" value={saved.hasCard ? "Yes" : "No"} />
            <Meta label="Risk tolerance" value={riskLabels[saved.riskLevel as keyof typeof riskLabels] ?? saved.riskLevel} />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {results.map((result) => (
            <PlatformCard key={result.platform.slug} result={result} />
          ))}
        </div>

        <Link className="mt-8 inline-flex rounded-md bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200" href="/">
          Run another comparison
        </Link>
      </main>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-slate-950/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}
