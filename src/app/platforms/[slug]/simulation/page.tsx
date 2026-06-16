import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppChrome } from "@/components/AppChrome";
import { ProviderSimulationForm } from "@/components/ProviderSimulationForm";
import { getPlatformBySlug, platforms } from "@/data/platforms";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return platforms.map((platform) => ({ slug: platform.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);

  return {
    title: platform ? `${platform.name} Bill Risk Simulation | ShipCheap` : "Bill Risk Simulation | ShipCheap",
    description: platform ? `Set up a bill-risk scenario for ${platform.name}.` : "Set up a provider bill-risk scenario.",
  };
}

export default async function PlatformSimulationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const platform = getPlatformBySlug(slug);

  if (!platform) {
    notFound();
  }

  return (
    <AppChrome active="providers" compactSidebar>
      <main className="mx-auto max-w-[1120px] px-4 py-5 sm:px-6 lg:px-10">
        <Link href={`/platforms/${platform.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-[#002fa7] transition hover:text-[#002fa7]">
          <ArrowLeft size={15} />
          Back to {platform.name}
        </Link>

        <section className="mt-4">
          <ProviderSimulationForm platform={platform} />
        </section>
      </main>
    </AppChrome>
  );
}
