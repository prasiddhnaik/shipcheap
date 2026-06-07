import { createHash } from "node:crypto";
import { platformSourceLinks } from "@/data/platforms";
import { prisma } from "@/lib/prisma";

const REQUEST_TIMEOUT_MS = 12_000;
const MAX_EXCERPT_LENGTH = 420;
const MAX_ERROR_LENGTH = 500;
const CONCURRENCY = 4;

export type SourceCheckStatus = "current" | "changed" | "failed" | "blocked";

export type PlatformSourceCheckResult = {
  platformSlug: string;
  sourceLabel: string;
  sourceUrl: string;
  status: SourceCheckStatus;
  httpStatus?: number;
  contentHash?: string;
  title?: string;
  excerpt?: string;
  changedSinceLastRun: boolean;
  error?: string;
};

type SourceTarget = {
  platformSlug: string;
  sourceLabel: string;
  sourceUrl: string;
};

export async function runPlatformSourceChecks() {
  const run = await prisma.freshnessCheckRun.create({
    data: { status: "running" },
  });

  try {
    const targets = getSourceTargets();
    const results = await mapWithConcurrency(targets, CONCURRENCY, checkSource);
    const checkedAt = new Date();

    for (const result of results) {
      await persistSourceCheck(result, checkedAt);
    }

    const failedSources = results.filter((result) => result.status === "failed").length;
    const blockedSources = results.filter((result) => result.status === "blocked").length;
    const changedSources = results.filter((result) => result.changedSinceLastRun).length;
    const status = failedSources === results.length ? "failed" : failedSources > 0 || blockedSources > 0 ? "partial" : "success";

    const finishedRun = await prisma.freshnessCheckRun.update({
      where: { id: run.id },
      data: {
        finishedAt: checkedAt,
        status,
        checkedSources: results.length,
        failedSources,
        blockedSources,
        changedSources,
        resultJson: summarizeResults(results),
      },
    });

    return { run: finishedRun, results };
  } catch (error) {
    const message = getErrorMessage(error);
    await prisma.freshnessCheckRun.update({
      where: { id: run.id },
      data: {
        finishedAt: new Date(),
        status: "failed",
        error: message.slice(0, MAX_ERROR_LENGTH),
      },
    });
    throw error;
  }
}

function getSourceTargets() {
  return Object.entries(platformSourceLinks).flatMap(([platformSlug, sources]) =>
    sources.map((source) => ({
      platformSlug,
      sourceLabel: source.label,
      sourceUrl: source.url,
    })),
  );
}

async function checkSource(target: SourceTarget): Promise<PlatformSourceCheckResult> {
  const existing = await prisma.platformSourceCheck.findUnique({
    where: {
      platformSlug_sourceUrl: {
        platformSlug: target.platformSlug,
        sourceUrl: target.sourceUrl,
      },
    },
    select: {
      contentHash: true,
      consecutiveFailures: true,
    },
  });

  try {
    const response = await fetch(target.sourceUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
        "user-agent": "ShipCheap freshness checker; https://shipcheap.app",
      },
    });

    const body = await response.text();
    const normalized = normalizePageText(body);
    const contentHash = createHash("sha256").update(normalized || body).digest("hex");
    const changedSinceLastRun = response.ok && Boolean(existing?.contentHash && existing.contentHash !== contentHash);

    const blocked = response.status === 401 || response.status === 403;

    return {
      ...target,
      status: response.ok ? (changedSinceLastRun ? "changed" : "current") : blocked ? "blocked" : "failed",
      httpStatus: response.status,
      contentHash,
      title: extractTitle(body),
      excerpt: normalized.slice(0, MAX_EXCERPT_LENGTH),
      changedSinceLastRun,
      error: response.ok ? undefined : blocked ? `Source blocked automated access with HTTP ${response.status}.` : `Source returned HTTP ${response.status}.`,
    };
  } catch (error) {
    return {
      ...target,
      status: "failed",
      changedSinceLastRun: false,
      error: getErrorMessage(error),
    };
  }
}

async function persistSourceCheck(result: PlatformSourceCheckResult, checkedAt: Date) {
  const existing = await prisma.platformSourceCheck.findUnique({
    where: {
      platformSlug_sourceUrl: {
        platformSlug: result.platformSlug,
        sourceUrl: result.sourceUrl,
      },
    },
    select: {
      consecutiveFailures: true,
      contentHash: true,
      lastChangedAt: true,
    },
  });

  const nextConsecutiveFailures = result.status === "failed" ? (existing?.consecutiveFailures ?? 0) + 1 : 0;
  const nextChangedAt = result.changedSinceLastRun ? checkedAt : existing?.lastChangedAt;
  const nextContentHash = result.status === "failed" ? existing?.contentHash : result.contentHash;

  await prisma.platformSourceCheck.upsert({
    where: {
      platformSlug_sourceUrl: {
        platformSlug: result.platformSlug,
        sourceUrl: result.sourceUrl,
      },
    },
    create: {
      platformSlug: result.platformSlug,
      sourceLabel: result.sourceLabel,
      sourceUrl: result.sourceUrl,
      lastCheckedAt: checkedAt,
      lastChangedAt: result.changedSinceLastRun ? checkedAt : undefined,
      status: result.status,
      httpStatus: result.httpStatus,
      contentHash: nextContentHash,
      title: result.title,
      excerpt: result.excerpt,
      changedSinceLastRun: result.changedSinceLastRun,
      error: result.error?.slice(0, MAX_ERROR_LENGTH),
      consecutiveFailures: nextConsecutiveFailures,
    },
    update: {
      sourceLabel: result.sourceLabel,
      lastCheckedAt: checkedAt,
      lastChangedAt: nextChangedAt,
      status: result.status,
      httpStatus: result.httpStatus,
      contentHash: nextContentHash,
      title: result.title,
      excerpt: result.excerpt,
      changedSinceLastRun: result.changedSinceLastRun,
      error: result.error?.slice(0, MAX_ERROR_LENGTH),
      consecutiveFailures: nextConsecutiveFailures,
    },
  });
}

function summarizeResults(results: PlatformSourceCheckResult[]) {
  return results.map((result) => ({
    platformSlug: result.platformSlug,
    sourceLabel: result.sourceLabel,
    sourceUrl: result.sourceUrl,
    status: result.status,
    httpStatus: result.httpStatus,
    contentHash: result.contentHash,
    changedSinceLastRun: result.changedSinceLastRun,
    error: result.error,
  }));
}

async function mapWithConcurrency<T, U>(items: T[], concurrency: number, mapper: (item: T) => Promise<U>) {
  const results: U[] = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return results;
}

function normalizePageText(html: string) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/i);
  return match ? normalizePageText(match[1]).slice(0, 180) : undefined;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown source check error.";
}
