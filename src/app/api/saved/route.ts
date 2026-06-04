import { NextResponse } from "next/server";
import { getPlatformBySlug } from "@/data/platforms";
import { prisma } from "@/lib/prisma";
import type { AppType, Budget, CalculatorInput, DatabaseNeed, RankedPlatform, Region, RiskLevel } from "@/lib/types";

const MAX_SAVE_BODY_BYTES = 20_000;
const MAX_SAVED_RESULTS = 10;

const appTypes = new Set<AppType>(["node", "fastapi", "docker", "static", "worker", "database"]);
const budgets = new Set<Budget>(["free", "under-5", "under-10", "under-25", "custom"]);
const databases = new Set<DatabaseNeed>(["none", "postgres", "redis", "mysql", "sqlite", "document"]);
const regions = new Set<Region>(["asia", "us", "europe", "any"]);
const risks = new Set<RiskLevel>(["low", "medium", "high"]);

type SaveRequest = {
  input?: Partial<CalculatorInput>;
  results?: unknown;
};

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_SAVE_BODY_BYTES) {
    return NextResponse.json({ error: "Saved comparison payload is too large." }, { status: 413 });
  }

  let body: SaveRequest;
  try {
    body = (await request.json()) as SaveRequest;
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
