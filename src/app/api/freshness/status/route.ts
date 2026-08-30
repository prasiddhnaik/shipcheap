import { NextResponse } from "next/server";
import { getPlatformBySlug, getPlatformSourceLinks } from "@/data/platforms";
import { prisma } from "@/lib/prisma";
import { summarizeSourceConfidence } from "@/lib/source-confidence";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("providers") ?? "";
  const providerSlugs = [...new Set(requested.split(",").map((slug) => slug.trim()).filter(Boolean))];

  if (providerSlugs.length === 0) {
    return NextResponse.json({ error: "Provide one to three provider slugs." }, { status: 400 });
  }
  if (providerSlugs.length > 3) {
    return NextResponse.json({ error: "At most three providers can be checked at once." }, { status: 400 });
  }
  const unknown = providerSlugs.find((slug) => !getPlatformBySlug(slug));
  if (unknown) {
    return NextResponse.json({ error: `Unknown provider: ${unknown}.` }, { status: 400 });
  }

  const checks = await prisma.platformSourceCheck.findMany({
    where: { platformSlug: { in: providerSlugs } },
    select: {
      platformSlug: true,
      sourceUrl: true,
      status: true,
      changedSinceLastRun: true,
      lastCheckedAt: true,
    },
  });

  const providers = Object.fromEntries(
    providerSlugs.map((slug) => [
      slug,
      summarizeSourceConfidence(
        slug,
        getPlatformSourceLinks(slug),
        checks.filter((check) => check.platformSlug === slug),
      ),
    ]),
  );

  return NextResponse.json(
    { providers },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
