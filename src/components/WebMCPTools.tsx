"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlatformMcpIntegration, platforms } from "@/data/platforms";
import { defaultSimulatorInput, formatCurrency, formatProbability, simulateMonthlyBill, type SimulatorInput } from "@/lib/billing-risk-simulation";
import { recommendPlatforms } from "@/lib/recommend-platform";
import type { CalculatorInput } from "@/lib/types";

type ToolDefinition = {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
  execute(input: unknown): unknown | Promise<unknown>;
};
type ModelContext = { registerTool(tool: ToolDefinition, options?: { signal?: AbortSignal }): void | Promise<void> };

declare global {
  interface Document { readonly modelContext?: ModelContext }
}

const appTypes = ["node", "fastapi", "docker", "static", "worker", "database"] as const;
const budgets = ["free", "under-5", "under-10", "under-25", "custom"] as const;
const databases = ["none", "postgres", "redis", "mysql", "sqlite", "document"] as const;
const regions = ["asia", "us", "europe", "any"] as const;
const risks = ["low", "medium", "high"] as const;
const providerSlugs = platforms.map((platform) => platform.slug);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function enumValue<T extends string>(input: Record<string, unknown>, key: string, values: readonly T[]): T {
  const value = input[key];
  if (typeof value !== "string" || !values.includes(value as T)) throw new Error(`${key} must be one of: ${values.join(", ")}.`);
  return value as T;
}

function booleanValue(input: Record<string, unknown>, key: string) {
  if (typeof input[key] !== "boolean") throw new Error(`${key} must be true or false.`);
  return input[key] as boolean;
}

function numberValue(input: Record<string, unknown>, key: string, fallback: number, min: number, max: number) {
  const value = input[key] ?? fallback;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new Error(`${key} must be a number from ${min} to ${max}.`);
  return value;
}

function stringValue(input: Record<string, unknown>, key: string) {
  const value = input[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`${key} must be a non-empty string.`);
  return value.trim();
}

async function jsonResponse(response: Response) {
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (response.status === 401) {
    return { authenticated: false as const, data: { status: "authentication_required", signInUrl: "/sign-in?redirect_url=/projects" } };
  }
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : `ShipCheap request failed (${response.status}).`);
  return { authenticated: true as const, data };
}

function recommendationInput(value: unknown): CalculatorInput {
  if (!isRecord(value)) throw new Error("Expected a hosting requirements object.");
  return {
    appType: enumValue(value, "appType", appTypes), budget: enumValue(value, "budget", budgets),
    database: enumValue(value, "database", databases), region: enumValue(value, "region", regions),
    riskLevel: enumValue(value, "riskLevel", risks), alwaysOn: booleanValue(value, "alwaysOn"), hasCard: booleanValue(value, "hasCard"),
  };
}

function simulatorInput(value: unknown): SimulatorInput {
  if (!isRecord(value)) throw new Error("Expected a billing-risk scenario object.");
  return {
    providerSlug: enumValue(value, "providerSlug", providerSlugs), hasCard: booleanValue(value, "hasCard"),
    trafficLevel: enumValue(value, "trafficLevel", ["small", "steady", "spike"]),
    spendControl: enumValue(value, "spendControl", ["none", "alerts", "hard-cap"]),
    dataLoad: enumValue(value, "dataLoad", ["none", "small", "growing", "heavy"]),
    bandwidthHeavy: booleanValue(value, "bandwidthHeavy"), keepsLogs: booleanValue(value, "keepsLogs"),
    jobLoad: enumValue(value, "jobLoad", ["none", "scheduled", "always-on"]),
    monthlyUsers: numberValue(value, "monthlyUsers", defaultSimulatorInput.monthlyUsers, 0, 10_000_000),
    requestsPerUser: numberValue(value, "requestsPerUser", defaultSimulatorInput.requestsPerUser, 1, 10_000),
    avgResponseKb: numberValue(value, "avgResponseKb", defaultSimulatorInput.avgResponseKb, 1, 100_000),
    storageGb: numberValue(value, "storageGb", defaultSimulatorInput.storageGb, 0, 1_000_000),
    jobHours: numberValue(value, "jobHours", defaultSimulatorInput.jobHours, 0, 100_000),
    budgetLimit: numberValue(value, "budgetLimit", defaultSimulatorInput.budgetLimit, 1, 1_000_000),
  };
}

const recommendationSchema = {
  type: "object", properties: {
    appType: { type: "string", enum: appTypes, description: "Backend runtime or deployment shape." },
    budget: { type: "string", enum: budgets, description: "Maximum comfortable monthly budget band." },
    database: { type: "string", enum: databases, description: "Required database." },
    alwaysOn: { type: "boolean", description: "Whether the backend must stay awake continuously." },
    hasCard: { type: "boolean", description: "Whether the person can add a payment card." },
    region: { type: "string", enum: regions, description: "Preferred hosting region." },
    riskLevel: { type: "string", enum: risks, description: "Maximum acceptable surprise-billing risk." },
  }, required: ["appType", "budget", "database", "alwaysOn", "hasCard", "region", "riskLevel"], additionalProperties: false,
};

const simulationSchema = {
  type: "object", properties: {
    providerSlug: { type: "string", enum: providerSlugs, description: "ShipCheap provider slug to simulate." },
    hasCard: { type: "boolean" }, trafficLevel: { type: "string", enum: ["small", "steady", "spike"] },
    spendControl: { type: "string", enum: ["none", "alerts", "hard-cap"] },
    dataLoad: { type: "string", enum: ["none", "small", "growing", "heavy"] },
    bandwidthHeavy: { type: "boolean" }, keepsLogs: { type: "boolean" },
    jobLoad: { type: "string", enum: ["none", "scheduled", "always-on"] },
    monthlyUsers: { type: "number", minimum: 0, maximum: 10_000_000 }, requestsPerUser: { type: "number", minimum: 1, maximum: 10_000 },
    avgResponseKb: { type: "number", minimum: 1, maximum: 100_000 }, storageGb: { type: "number", minimum: 0, maximum: 1_000_000 },
    jobHours: { type: "number", minimum: 0, maximum: 100_000 }, budgetLimit: { type: "number", minimum: 1, maximum: 1_000_000 },
  }, required: ["providerSlug", "hasCard", "trafficLevel", "spendControl", "dataLoad", "bandwidthHeavy", "keepsLogs", "jobLoad"], additionalProperties: false,
};

export function WebMCPTools() {
  const router = useRouter();
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: ToolDefinition) => {
      try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch((error) => console.error(`WebMCP registration failed: ${tool.name}`, error)); }
      catch (error) { console.error(`WebMCP registration failed: ${tool.name}`, error); }
    };

    register({
      name: "open_project_workspace", title: "Open project workspace",
      description: "Open ShipCheap's authenticated project workspace. If the person is signed out, ShipCheap opens its sign-in flow first.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute() {
        router.push("/projects");
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        return { status: "project_workspace_opened", path: "/projects" };
      },
    });

    register({
      name: "list_linked_projects", title: "List linked projects",
      description: "List the signed-in person's ShipCheap projects and their repository-specific hosting analyses.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute() {
        const result = await jsonResponse(await fetch("/api/projects", { cache: "no-store" }));
        if (!result.authenticated) return result.data;
        const projects = Array.isArray(result.data.projects) ? result.data.projects : [];
        return { status: "ok", count: projects.length, projects };
      },
    });

    register({
      name: "list_available_github_repositories", title: "List available GitHub repositories",
      description: "List repositories available through GitHub App installations already connected to the signed-in ShipCheap account.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute() {
        const result = await jsonResponse(await fetch("/api/github/repositories", { cache: "no-store" }));
        if (!result.authenticated) return result.data;
        const groups = Array.isArray(result.data.groups) ? result.data.groups : [];
        return { status: "ok", installationCount: groups.length, groups };
      },
    });

    register({
      name: "start_github_app_installation", title: "Start GitHub App installation",
      description: "Start ShipCheap's GitHub App installation flow for a signed-in person. This opens GitHub, where the person must review and approve repository access.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute() {
        const result = await jsonResponse(await fetch("/api/projects", { cache: "no-store" }));
        if (!result.authenticated) return result.data;
        window.location.assign("/api/github/install/start");
        return { status: "github_installation_started" };
      },
    });

    register({
      name: "analyze_github_repository", title: "Analyze GitHub repository",
      description: "Link and analyze one GitHub repository for the signed-in person, then open the updated ShipCheap project workspace. Use repositoryUrl for a public repository, or installationId and repositoryId from list_available_github_repositories.",
      inputSchema: {
        type: "object",
        properties: {
          repositoryUrl: { type: "string", description: "Public GitHub repository URL." },
          installationId: { type: "string", description: "ShipCheap GitHub installation record ID." },
          repositoryId: { type: "string", description: "GitHub repository ID returned by list_available_github_repositories." },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: true },
      async execute(input) {
        if (!isRecord(input)) throw new Error("Expected a GitHub repository selection object.");
        const hasPublicUrl = typeof input.repositoryUrl === "string" && Boolean(input.repositoryUrl.trim());
        const hasInstalledRepository = typeof input.installationId === "string" && typeof input.repositoryId === "string";
        if (hasPublicUrl === hasInstalledRepository) {
          throw new Error("Provide either repositoryUrl, or both installationId and repositoryId.");
        }
        const payload = hasPublicUrl
          ? { repositoryUrl: stringValue(input, "repositoryUrl") }
          : { installationId: stringValue(input, "installationId"), repositoryId: stringValue(input, "repositoryId") };
        const result = await jsonResponse(
          await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        if (!result.authenticated) return result.data;
        router.push("/projects");
        router.refresh();
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        return { status: "repository_analyzed", project: result.data.project };
      },
    });

    register({
      name: "recommend_backend_hosts", title: "Recommend backend hosts",
      description: "Rank backend hosts for a person's runtime, budget, database, region, card access, uptime need, and billing-risk tolerance.",
      inputSchema: recommendationSchema, annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        const requirements = recommendationInput(input);
        const matches = recommendPlatforms(requirements).slice(0, 5).map(({ platform, score, matchedReasons, warnings, rank }) => {
          const mcp = getPlatformMcpIntegration(platform.slug);
          return {
            rank, slug: platform.slug, name: platform.name, score, billingRisk: platform.billingRisk,
            creditCardRequired: platform.creditCardRequired, costRange: platform.costRange,
            reasons: matchedReasons.slice(0, 4), warnings: warnings.slice(0, 3),
            agentMcp: mcp ? {
              available: true,
              connection: mcp.kind,
              label: mcp.label,
              endpoint: mcp.endpoint,
              capabilities: mcp.capabilities,
              canHostMcpServer: mcp.canHostMcpServer,
              caution: mcp.caution,
              officialDocs: mcp.docsUrl,
            } : { available: false, status: "No official provider-control MCP verified by ShipCheap." },
          };
        });
        return { requirements, matches };
      },
    });

    register({
      name: "open_backend_host_comparison", title: "Open backend host comparison",
      description: "Open ShipCheap's visible provider comparison with one requested backend host highlighted for the person to inspect.",
      inputSchema: { type: "object", properties: { providerSlug: { type: "string", enum: providerSlugs } }, required: ["providerSlug"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        if (!isRecord(input)) throw new Error("Expected a provider selection object.");
        const providerSlug = enumValue(input, "providerSlug", providerSlugs);
        const provider = platforms.find((item) => item.slug === providerSlug);
        router.push(`/compare?platform=${encodeURIComponent(providerSlug)}`);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        return { status: "comparison_opened", providerSlug, providerName: provider?.name };
      },
    });

    register({
      name: "preview_billing_risk", title: "Preview billing risk",
      description: "Run ShipCheap's deterministic 1,000-month billing-risk simulation and open the configured visible simulator for human review.",
      inputSchema: simulationSchema, annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        const scenario = simulatorInput(input);
        const provider = platforms.find((item) => item.slug === scenario.providerSlug);
        if (!provider) throw new Error("Provider was not found.");
        const result = simulateMonthlyBill(scenario, provider);
        const query = new URLSearchParams({ provider: scenario.providerSlug, hasCard: String(scenario.hasCard), traffic: scenario.trafficLevel,
          spend: scenario.spendControl, data: scenario.dataLoad, bandwidth: String(scenario.bandwidthHeavy), logs: String(scenario.keepsLogs),
          jobs: scenario.jobLoad, users: String(scenario.monthlyUsers), rpu: String(scenario.requestsPerUser), responseKb: String(scenario.avgResponseKb),
          storageGb: String(scenario.storageGb), jobHours: String(scenario.jobHours), budget: String(scenario.budgetLimit) });
        router.push(`/billing-risk?${query.toString()}`);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        return { status: "simulation_opened", provider: provider.name, runs: result.runs, riskLevel: result.level,
          medianBill: formatCurrency(result.p50), highUsageBill: formatCurrency(result.p90), worstSample: formatCurrency(result.worst),
          overBudgetProbability: formatProbability(result.overBudgetProbability), headline: result.headline, caveat: result.caveat };
      },
    });
    return () => lifecycle.abort();
  }, [router]);
  return null;
}
