import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AppChrome } from "@/components/AppChrome";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ProviderLogo } from "@/components/ProviderLogo";
import { getPlatformBySlug } from "@/data/platforms";
import { prisma } from "@/lib/prisma";
import { ArrowRight, LockKeyhole, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <AppChrome active="favorites">
        <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
          <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center border-2 border-[var(--line)] bg-[var(--yellow)] text-[var(--foreground)]">
                <LockKeyhole size={20} />
              </span>
              <div>
                <h1 className="text-[28px] font-black leading-tight text-[var(--foreground)] sm:text-[34px]">Favorites</h1>
                <p className="mt-1 text-sm font-medium text-[var(--muted)]">Sign in to keep a shortlist with notes on why each provider is still in play.</p>
              </div>
            </div>
            <Link
              href="/sign-in"
              className="mt-5 inline-flex items-center gap-2 border-[3px] border-[var(--line)] bg-[#002fa7] px-4 py-2 text-sm font-black text-white shadow-[4px_4px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)]"
            >
              Sign in
              <ArrowRight size={15} />
            </Link>
          </section>
        </main>
      </AppChrome>
    );
  }

  const favorites = await prisma.favoritePlatform.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const rows = favorites
    .map((favorite) => {
      const platform = getPlatformBySlug(favorite.platformSlug);
      if (!platform) return null;
      return { favorite, platform };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  return (
    <AppChrome active="favorites">
      <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center border-2 border-[var(--line)] bg-[var(--yellow)] text-[var(--foreground)]">
              <Star size={20} />
            </span>
            <div>
              <h1 className="text-[28px] font-black leading-tight text-[var(--foreground)] sm:text-[34px]">Favorites</h1>
              <p className="mt-1 text-sm font-medium text-[var(--muted)]">
                Your shortlist of providers, with notes on why you&apos;re still watching each one.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4">
          {rows.length === 0 ? (
            <div className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
              <h2 className="text-lg font-black text-[var(--foreground)]">No favorites yet</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--muted)]">
                Open a provider page and hit Favorite. Add a short note so future-you remembers the tradeoff.
              </p>
              <Link
                href="/compare"
                className="mt-4 inline-flex items-center gap-2 border-[3px] border-[var(--line)] bg-[#002fa7] px-4 py-2 text-sm font-black text-white shadow-[4px_4px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--line)]"
              >
                Browse providers
                <ArrowRight size={15} />
              </Link>
            </div>
          ) : (
            rows.map(({ favorite, platform }) => (
              <article
                key={favorite.id}
                className="border-[3px] border-[var(--line)] bg-[var(--panel)] p-4 shadow-[6px_6px_0_var(--line)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <ProviderLogo name={platform.name} large />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/platforms/${platform.slug}`} className="text-lg font-black text-[var(--foreground)] hover:text-[var(--accent)]">
                          {platform.name}
                        </Link>
                        <BillingRiskBadge risk={platform.billingRisk} />
                      </div>
                      <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--muted)]">{platform.description}</p>
                      {favorite.note ? (
                        <p className="mt-3 border-l-[3px] border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm font-medium leading-6 text-[var(--foreground)]">
                          {favorite.note}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm font-medium text-[var(--muted)]">No note yet — add why this one stayed on the shortlist.</p>
                      )}
                      <p className="mt-2 text-xs font-medium text-[var(--muted)]">Updated {favorite.updatedAt.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
                    <FavoriteButton
                      key={`${favorite.id}-${favorite.updatedAt.toISOString()}`}
                      platformSlug={platform.slug}
                      platformName={platform.name}
                      initialFavorited
                      initialNote={favorite.note}
                    />
                    <Link
                      href={`/billing-risk?provider=${platform.slug}`}
                      className="inline-flex items-center justify-center gap-2 border-2 border-[var(--line)] bg-[var(--yellow)] px-3 py-2 text-sm font-black text-[var(--foreground)] shadow-[3px_3px_0_var(--line)] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--line)]"
                    >
                      Run bill risk
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </AppChrome>
  );
}
