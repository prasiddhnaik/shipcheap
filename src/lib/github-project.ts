import type { CalculatorInput, RankedPlatform } from "@/lib/types";
import { recommendPlatforms } from "@/lib/recommend-platform";

export type RepositoryAnalysis = {
  stack: string[];
  signals: string[];
  input: CalculatorInput;
};

export type StoredRecommendation = Pick<RankedPlatform, "score" | "matchedReasons" | "warnings" | "rank"> & {
  platformSlug: string;
  platformName: string;
};

export function parseGitHubRepositoryUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") return null;
    const [owner, rawName, extra] = url.pathname.split("/").filter(Boolean);
    if (!owner || !rawName || extra) return null;
    const name = rawName.replace(/\.git$/i, "");
    if (!/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(name)) return null;
    return { owner, name };
  } catch {
    return null;
  }
}

export function analyzeRepositoryFiles({ paths, files }: { paths: string[]; files: Record<string, string> }): RepositoryAnalysis {
  const lowerPaths = new Set(paths.map((path) => path.toLowerCase()));
  const packageJson = files["package.json"]?.toLowerCase() ?? "";
  const python = `${files["requirements.txt"] ?? ""}\n${files["pyproject.toml"] ?? ""}`.toLowerCase();
  const allText = `${packageJson}\n${python}\n${files["go.mod"] ?? ""}\n${files["cargo.toml"] ?? ""}`.toLowerCase();
  const stack: string[] = [];
  const signals: string[] = [];

  if (lowerPaths.has("package.json")) stack.push("Node.js");
  if (packageJson.includes('"next"')) stack.push("Next.js");
  if (packageJson.includes('"express"')) stack.push("Express");
  if (lowerPaths.has("requirements.txt") || lowerPaths.has("pyproject.toml")) stack.push("Python");
  if (python.includes("fastapi")) stack.push("FastAPI");
  if (lowerPaths.has("go.mod")) stack.push("Go");
  if (lowerPaths.has("cargo.toml")) stack.push("Rust");
  if (lowerPaths.has("dockerfile") || [...lowerPaths].some((path) => path.endsWith("/dockerfile"))) stack.push("Docker");
  if (lowerPaths.has("wrangler.toml") || lowerPaths.has("wrangler.jsonc")) stack.push("Cloudflare Workers");

  let database: CalculatorInput["database"] = "none";
  if (/postgres|postgresql|psycopg|\bpg\b|@prisma\/adapter-pg/.test(allText)) database = "postgres";
  else if (/mysql|mariadb/.test(allText)) database = "mysql";
  else if (/redis|ioredis/.test(allText)) database = "redis";
  else if (/mongodb|mongoose/.test(allText)) database = "document";
  else if (/sqlite|better-sqlite3/.test(allText)) database = "sqlite";
  if (database !== "none") stack.push(database === "document" ? "Document DB" : database[0].toUpperCase() + database.slice(1));

  let appType: CalculatorInput["appType"] = "node";
  if (python.includes("fastapi")) appType = "fastapi";
  else if (stack.includes("Cloudflare Workers")) appType = "worker";
  else if (stack.includes("Docker") && !stack.includes("Next.js")) appType = "docker";
  else if (!lowerPaths.has("package.json") && paths.some((path) => /(^|\/)index\.html$/i.test(path))) appType = "static";

  if (stack.length > 0) signals.push(`Detected ${stack.join(", ")}.`);
  if (database !== "none") signals.push(`Detected ${database} database usage from dependency files.`);
  if (stack.includes("Docker")) signals.push("Docker support is a strong provider requirement.");

  return {
    stack,
    signals,
    input: {
      appType,
      budget: "under-10",
      database,
      alwaysOn: appType === "fastapi" || appType === "docker",
      hasCard: false,
      region: "any",
      riskLevel: "low",
    },
  };
}

export function recommendForRepository(analysis: RepositoryAnalysis): StoredRecommendation[] {
  return recommendPlatforms(analysis.input).slice(0, 3).map((result) => ({
    platformSlug: result.platform.slug,
    platformName: result.platform.name,
    score: result.score,
    matchedReasons: result.matchedReasons,
    warnings: result.warnings,
    rank: result.rank,
  }));
}
