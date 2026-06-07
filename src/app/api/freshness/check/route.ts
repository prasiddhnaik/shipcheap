import { NextResponse } from "next/server";
import { runPlatformSourceChecks } from "@/lib/platform-source-checker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const isAuthorized = cronSecret
    ? authorization === `Bearer ${cronSecret}`
    : process.env.NODE_ENV !== "production";

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized freshness check." }, { status: 401 });
  }

  try {
    const { run, results } = await runPlatformSourceChecks();
    return NextResponse.json({
      runId: run.id,
      status: run.status,
      checkedSources: run.checkedSources,
      failedSources: run.failedSources,
      blockedSources: run.blockedSources,
      changedSources: run.changedSources,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Freshness check failed.",
      },
      { status: 500 },
    );
  }
}
