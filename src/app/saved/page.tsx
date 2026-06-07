import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { prisma } from "@/lib/prisma";
import { appTypeLabels, budgetLabels, databaseLabels, regionLabels, riskLabels } from "@/lib/utils";
import { ArrowRight, Boxes } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const savedComparisons = await prisma.savedComparison.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <AppChrome active="saved">
      <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="rounded-lg border border-white/10 bg-[#252525] p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2442ed]/35 bg-[#2442ed]/10 text-[#aeb9ff]">
              <Boxes size={20} />
            </span>
            <div>
              <h1 className="text-[28px] font-semibold leading-tight text-white sm:text-[34px]">Saved filters</h1>
              <p className="mt-1 text-sm text-slate-400">Open comparison snapshots created from the dashboard.</p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3">
          {savedComparisons.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-[#252525] p-5">
              <h2 className="text-lg font-semibold text-white">No saved filters yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Use “Save share link” from the dashboard recommendations to create one.</p>
              <Link href="/#recommendations" className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#2442ed] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3b57ff]">
                Go to recommendations
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            savedComparisons.map((saved) => (
              <Link
                key={saved.id}
                href={`/saved/${saved.id}`}
                className="rounded-lg border border-white/10 bg-[#252525] p-4 transition hover:border-[#2442ed]/50 hover:bg-[#2b2b2b]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">{appTypeLabels[saved.appType as keyof typeof appTypeLabels] ?? saved.appType}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {budgetLabels[saved.budget as keyof typeof budgetLabels] ?? saved.budget} · {databaseLabels[saved.database as keyof typeof databaseLabels] ?? saved.database} ·{" "}
                      {regionLabels[saved.region as keyof typeof regionLabels] ?? saved.region}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{saved.createdAt.toLocaleString()}</p>
                    <p className="mt-1">{riskLabels[saved.riskLevel as keyof typeof riskLabels] ?? saved.riskLevel} risk tolerance</p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      </main>
    </AppChrome>
  );
}
