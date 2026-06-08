import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPlatformBySlug } from "@/data/platforms";
import { prisma } from "@/lib/prisma";
import type { AppType, Budget, CalculatorInput, DatabaseNeed, RankedPlatform, Region, RiskLevel } from "@/lib/types";

const MAX_SAVE_BODY_BYTES = 20_000;
const MAX_SAVED_RESULTS = 10;
const SAVE_RATE_LIMIT_ROUTE = "api:saved";
const SAVE_RATE_LIMIT_WINDOW_MS = 60_000;
const SAVE_RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_CLEANUP_AFTER_MS = 24 * 60 * 60 * 1000;

const appTypes = new Set<AppType>(["node", "fastapi", "docker", "static", "worker", "database"]);
const budgets = new Set<Budget>(["free", "under-5", "under-10", "under-25", "custom"]);
const databases = new Set<DatabaseNeed>(["none", "postgres", "redis", "mysql", "sqlite", "document"]);
const regions = new Set<Region>(["asia", "us", "europe", "any"]);
const risks = new Set<RiskLevel>(["low", "medium", "high"]);

type SaveRequest = {
  input?: Partial<CalculatorInput>;
  results?: unknown;
};

class RequestBodyTooLargeError extends Error {}

export async function POST(request: Request) {
  const { userId } = await auth();
  const rateLimit = await checkSaveRateLimit(userId ? `user:${userId}` : `ip:${getClientIp(request)}`);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many save attempts. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  if (!userId) {
    return NextResponse.json({ error: "Sign in to save comparisons." }, { status: 401 });
  }

  let rawBody: string;
  let body: SaveRequest;
  try {
    rawBody = await readLimitedBody(request, MAX_SAVE_BODY_BYTES);
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Saved comparison payload is too large." }, { status: 413 });
    }

    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    body = JSON.parse(rawBody) as SaveRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const input = parseCalculatorInput(body.input);
  const results = parseRankedResults(body.results);
  if (!input || results.length === 0) {
    return NextResponse.json({ error: "Invalid saved comparison payload." }, { status: 400 });
  }

  const saved = await prisma.savedComparison.create({
    data: {
      userId,
      appType: input.appType,
      budget: input.budget,
      database: input.database,
      alwaysOn: input.alwaysOn,
      hasCard: input.hasCard,
      region: input.region,
      riskLevel: input.riskLevel,
      resultJson: results,
    },
  });

  return NextResponse.json({ id: saved.id });
}

async function checkSaveRateLimit(identifier: string) {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / SAVE_RATE_LIMIT_WINDOW_MS) * SAVE_RATE_LIMIT_WINDOW_MS);
  const bucket = await prisma.apiRateLimitBucket.upsert({
    where: {
      route_identifier_windowStart: {
        route: SAVE_RATE_LIMIT_ROUTE,
        identifier,
        windowStart,
      },
    },
    create: {
      route: SAVE_RATE_LIMIT_ROUTE,
      identifier,
      windowStart,
      count: 1,
    },
    update: {
      count: { increment: 1 },
    },
  });

  if (bucket.count === 1) {
    await prisma.apiRateLimitBucket.deleteMany({
      where: {
        route: SAVE_RATE_LIMIT_ROUTE,
        updatedAt: { lt: new Date(now.getTime() - RATE_LIMIT_CLEANUP_AFTER_MS) },
      },
    });
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((windowStart.getTime() + SAVE_RATE_LIMIT_WINDOW_MS - now.getTime()) / 1000));
  return {
    limited: bucket.count > SAVE_RATE_LIMIT_MAX_REQUESTS,
    retryAfterSeconds,
  };
}

async function readLimitedBody(request: Request, maxBytes: number) {
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      throw new RequestBodyTooLargeError();
    }
    chunks.push(value);
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(bodyBytes);
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function parseCalculatorInput(input: SaveRequest["input"]): CalculatorInput | null {
  if (!input) return null;
  if (
    !appTypes.has(input.appType as AppType) ||
    !budgets.has(input.budget as Budget) ||
    !databases.has(input.database as DatabaseNeed) ||
    !regions.has(input.region as Region) ||
    !risks.has(input.riskLevel as RiskLevel) ||
    typeof input.alwaysOn !== "boolean" ||
    typeof input.hasCard !== "boolean"
  ) {
    return null;
  }

  return {
    appType: input.appType as AppType,
    budget: input.budget as Budget,
    database: input.database as DatabaseNeed,
    alwaysOn: input.alwaysOn,
    hasCard: input.hasCard,
    region: input.region as Region,
    riskLevel: input.riskLevel as RiskLevel,
  };
}

function parseRankedResults(results: unknown): RankedPlatform[] {
  if (!Array.isArray(results)) return [];

  const seenSlugs = new Set<string>();
  const parsed: RankedPlatform[] = [];

  for (const item of results) {
    if (parsed.length >= MAX_SAVED_RESULTS || !isRecord(item)) continue;

    const platformRecord = isRecord(item.platform) ? item.platform : null;
    const slug = typeof platformRecord?.slug === "string" ? platformRecord.slug : null;
    const platform = slug ? getPlatformBySlug(slug) : undefined;
    if (!platform || seenSlugs.has(platform.slug)) continue;

    seenSlugs.add(platform.slug);
    parsed.push({
      platform,
      score: Number.isFinite(item.score) ? Number(item.score) : 0,
      matchedReasons: parseStringArray(item.matchedReasons, 5),
      warnings: parseStringArray(item.warnings, 8),
      rank: parsed.length + 1,
    });
  }

  return parsed;
}

function parseStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.slice(0, 240)).slice(0, limit);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
