import Link from "next/link";
import { AppChrome } from "@/components/AppChrome";
import { ProviderLogo } from "@/components/ProviderLogo";
import { platforms, pricingDisclaimer } from "@/data/platforms";
import { ArrowRight } from "lucide-react";

export default function NodeBackendGuidePage() {
  const nodePlatforms = platforms.filter((platform) => platform.supports.includes("node"));

  return (
    <AppChrome active="dashboard">
      <GuideShell
        title="Best hosting for Node.js backends"
        intro="Node.js APIs usually need Git deploys, environment variables, logs, predictable scaling, and sometimes always-on processes. The safest choice depends on whether the app is a small API, a serverless endpoint, or a Dockerized service."
      >
        <p>
          For beginner Node.js APIs, start with platforms that make deployment and billing limits visible. Koyeb and Render are
          strong simple-backend options, Fly.io is excellent when Docker and global regions matter, and Vercel is best when the
          backend is part of a Next.js or serverless frontend project.
        </p>
        <PlatformList platforms={nodePlatforms} />
      </GuideShell>
    </AppChrome>
  );
}

function GuideShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-[960px] px-4 py-5 sm:px-6 lg:px-10">
      <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5 shadow-[7px_7px_0_var(--line)]">
        <h1 className="text-[28px] font-semibold leading-tight text-[var(--foreground)] sm:text-[34px]">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-[var(--foreground)]">{intro}</p>
        <p className="mt-4 text-sm text-amber-100/80">{pricingDisclaimer}</p>
      </section>
      <article className="prose prose-invert prose-slate mt-8 max-w-none text-[var(--foreground)]">{children}</article>
      <Link className="mt-8 inline-flex items-center gap-2 bg-[#002fa7] px-4 py-3 text-sm font-bold text-white hover:bg-[#003399]" href="/compare">
        Compare all platforms
        <ArrowRight size={15} />
      </Link>
    </main>
  );
}

function PlatformList({ platforms: guidePlatforms }: { platforms: typeof platforms }) {
  return (
    <div className="not-prose mt-6 grid gap-4">
      {guidePlatforms.map((platform) => (
        <Link key={platform.slug} href={`/platforms/${platform.slug}`} className="flex gap-3 border border-[var(--line)] bg-[var(--panel)] p-5 no-underline hover:bg-[var(--paper)]">
          <ProviderLogo name={platform.name} large />
          <div>
            <h2 className="text-xl font-semibold text-[var(--foreground)]">{platform.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{platform.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
