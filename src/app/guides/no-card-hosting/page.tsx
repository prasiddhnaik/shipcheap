import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { ProviderLogo } from "@/components/ProviderLogo";
import { platforms, pricingDisclaimer } from "@/data/platforms";
import { ArrowRight } from "lucide-react";

export default function NoCardHostingGuidePage() {
  const noCardPlatforms = platforms.filter((platform) => !platform.creditCardRequired);

  return (
    <AppChrome active="dashboard">
      <main className="mx-auto max-w-[960px] px-4 py-5 sm:px-6 lg:px-10">
        <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
        <h1 className="text-[28px] font-semibold leading-tight text-[var(--foreground)] sm:text-[34px]">Best backend hosting without a credit card</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--foreground)]">
          No-card hosting is useful for students, first-time builders, and anyone who wants to avoid accidental billing while
          learning. The tradeoff is usually lower quotas, sleeping services, or database limits.
        </p>
        <p className="mt-4 text-sm text-amber-100/80">{pricingDisclaimer}</p>
        </section>
        <section className="mt-8 space-y-5 text-base leading-7 text-[var(--foreground)]">
          <p>
            Koyeb, Vercel, Supabase, Neon, and parts of Render are good starter candidates to verify first. Pairing a no-card app
            host with a no-card Postgres provider can be safer than choosing a single usage-metered platform with a required card.
          </p>
          <div className="grid gap-4">
            {noCardPlatforms.map((platform) => (
              <Link key={platform.slug} href={`/platforms/${platform.slug}`} className="flex gap-3 border border-[var(--line)] bg-[var(--panel)] p-5 hover:bg-[var(--paper)]">
                <ProviderLogo name={platform.name} large />
                <div>
                  <h2 className="text-xl font-semibold text-[var(--foreground)]">{platform.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{platform.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <Link className="mt-8 inline-flex items-center gap-2 bg-[#002fa7] px-4 py-3 text-sm font-bold text-white hover:bg-[#003399]" href="/compare">
          Compare all platforms
          <ArrowRight size={15} />
        </Link>
      </main>
    </AppChrome>
  );
}
