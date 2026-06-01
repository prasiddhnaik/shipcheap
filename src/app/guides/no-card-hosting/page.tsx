import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { platforms, pricingDisclaimer } from "@/data/platforms";

export default function NoCardHostingGuidePage() {
  const noCardPlatforms = platforms.filter((platform) => !platform.creditCardRequired);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-semibold text-white">Best backend hosting without a credit card</h1>
        <p className="mt-5 text-lg leading-8 text-slate-300">
          No-card hosting is useful for students, first-time builders, and anyone who wants to avoid accidental billing while
          learning. The tradeoff is usually lower quotas, sleeping services, or database limits.
        </p>
        <p className="mt-4 text-sm text-amber-100/80">{pricingDisclaimer}</p>
        <section className="mt-8 space-y-5 text-base leading-7 text-slate-300">
          <p>
            Koyeb, Vercel, Supabase, Neon, and parts of Render are good starter candidates to verify first. Pairing a no-card app
            host with a no-card Postgres provider can be safer than choosing a single usage-metered platform with a required card.
          </p>
          <div className="grid gap-4">
            {noCardPlatforms.map((platform) => (
              <Link key={platform.slug} href={`/platforms/${platform.slug}`} className="rounded-lg border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.06]">
                <h2 className="text-xl font-semibold text-white">{platform.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{platform.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <Link className="mt-8 inline-flex rounded-md bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200" href="/compare">
          Compare all platforms
        </Link>
      </main>
    </>
  );
}
