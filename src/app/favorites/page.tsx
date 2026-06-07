import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { ProviderLogo } from "@/components/ProviderLogo";
import { platforms } from "@/data/platforms";
import { ArrowRight, Star } from "lucide-react";

export default function FavoritesPage() {
  const favorites = platforms.filter((platform) => !platform.creditCardRequired || platform.billingRisk === "low");

  return (
    <AppChrome active="favorites">
      <main className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="rounded-lg border border-white/10 bg-[#252525] p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2442ed]/35 bg-[#2442ed]/10 text-[#aeb9ff]">
              <Star size={20} />
            </span>
            <div>
              <h1 className="text-[28px] font-semibold leading-tight text-white sm:text-[34px]">Favorites</h1>
              <p className="mt-1 text-sm text-slate-400">A quick shortlist of lower-friction providers to inspect first.</p>
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favorites.map((platform) => (
            <Link
              key={platform.slug}
              href={`/platforms/${platform.slug}`}
              className="rounded-lg border border-white/10 bg-[#252525] p-4 transition hover:border-[#2442ed]/50 hover:bg-[#2b2b2b]"
            >
              <div className="flex items-start gap-3">
                <ProviderLogo name={platform.name} large />
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">{platform.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">{platform.description}</p>
                </div>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7f91ff]">
                View details
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </section>
      </main>
    </AppChrome>
  );
}
