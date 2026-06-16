import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AppChrome } from "@/components/AppChrome";
import { prisma } from "@/lib/prisma";
import { appTypeLabels, budgetLabels, databaseLabels, regionLabels, riskLabels } from "@/lib/utils";
import { ArrowRight, Boxes, LockKeyhole } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <AppChrome active="saved">
        <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
          <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center border border-[#002fa7]/35 bg-[#002fa7]/10 text-[#002fa7]">
                <LockKeyhole size={20} />
              </span>
              <div>
                <h1 className="text-[28px] font-semibold leading-tight text-[var(--foreground)] sm:text-[34px]">Saved filters</h1>
                <p className="mt-1 text-sm text-[var(--muted)]">Sign in to view your saved comparison snapshots.</p>
              </div>
            </div>
            <Link href="/sign-in" className="mt-5 inline-flex items-center gap-2 bg-[#002fa7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003399]">
              Sign in
              <ArrowRight size={15} />
            </Link>
          </section>
        </main>
      </AppChrome>
    );
  }

  const savedComparisons = await prisma.savedComparison.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <AppChrome active="saved">
      <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border border-[#002fa7]/35 bg-[#002fa7]/10 text-[#002fa7]">
              <Boxes size={20} />
            </span>
            <div>
              <h1 className="text-[28px] font-semibold leading-tight text-[var(--foreground)] sm:text-[34px]">Saved filters</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">Open comparison snapshots created from the dashboard.</p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-3">
          {savedComparisons.length === 0 ? (
            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">No saved filters yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Use “Save share link” from the dashboard recommendations to create one.</p>
              <Link href="/#recommendations" className="mt-4 inline-flex items-center gap-2 bg-[#002fa7] px-4 py-2 text-sm font-semibold text-white hover:bg-[#003399]">
                Go to recommendations
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            savedComparisons.map((saved) => (
              <Link
                key={saved.id}
                href={`/saved/${saved.id}`}
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-4 transition hover:border-[#002fa7]/50 hover:bg-[var(--paper)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--foreground)]">{appTypeLabels[saved.appType as keyof typeof appTypeLabels] ?? saved.appType}</h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {budgetLabels[saved.budget as keyof typeof budgetLabels] ?? saved.budget} · {databaseLabels[saved.database as keyof typeof databaseLabels] ?? saved.database} ·{" "}
                      {regionLabels[saved.region as keyof typeof regionLabels] ?? saved.region}
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--muted)]">
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
