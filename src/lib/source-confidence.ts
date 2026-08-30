import type { SourceLink } from "@/lib/types";

const FRESHNESS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type SourceConfidenceCheck = {
  sourceUrl: string;
  status: string;
  changedSinceLastRun: boolean;
  lastCheckedAt: Date;
};

export type ProviderSourceConfidence = {
  platformSlug: string;
  level: "verified" | "needs-review" | "unknown";
  checkedAt: string | null;
  sources: Array<{
    label: string;
    url: string;
    status: "current" | "changed" | "failed" | "blocked" | "missing" | "stale";
    checkedAt: string | null;
  }>;
};

export function summarizeSourceConfidence(
  platformSlug: string,
  requiredSources: SourceLink[],
  checks: SourceConfidenceCheck[],
  now = new Date(),
): ProviderSourceConfidence {
  const allowedUrls = new Set(requiredSources.map((source) => source.url));
  const checksByUrl = new Map(
    checks
      .filter((check) => allowedUrls.has(check.sourceUrl))
      .map((check) => [check.sourceUrl, check]),
  );

  const sources = requiredSources.map((source) => {
    const check = checksByUrl.get(source.url);
    if (!check) return { ...source, status: "missing" as const, checkedAt: null };

    const age = now.getTime() - check.lastCheckedAt.getTime();
    const status: ProviderSourceConfidence["sources"][number]["status"] = check.changedSinceLastRun || check.status === "changed"
      ? "changed"
      : check.status === "blocked"
        ? "blocked"
        : check.status !== "current"
          ? "failed"
          : age > FRESHNESS_WINDOW_MS
            ? "stale"
            : "current";

    return { ...source, status, checkedAt: check.lastCheckedAt.toISOString() };
  });

  const knownChecks = sources.filter((source) => source.checkedAt !== null);
  const checkedAt = knownChecks
    .map((source) => source.checkedAt)
    .filter((value): value is string => value !== null)
    .sort()
    .at(-1) ?? null;

  return {
    platformSlug,
    level: knownChecks.length === 0
      ? "unknown"
      : sources.every((source) => source.status === "current")
        ? "verified"
        : "needs-review",
    checkedAt,
    sources,
  };
}
