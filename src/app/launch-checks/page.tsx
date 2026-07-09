import type { Metadata } from "next";
import { AppChrome } from "@/components/AppChrome";
import { LaunchChecksClient } from "@/components/LaunchChecksClient";

export const metadata: Metadata = {
  title: "Launch Checks | ShipCheap",
  description: "Provider-specific pre-deploy checklist for backend hosting without surprise bills.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LaunchChecksPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.provider;
  const provider = Array.isArray(raw) ? raw[0] : raw;

  return (
    <AppChrome active="launch-checks">
      <LaunchChecksClient initialSlug={provider} />
    </AppChrome>
  );
}
