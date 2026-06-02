import type { AppType, Budget, DatabaseNeed, PlatformCategory, Region, RiskLevel } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const appTypeLabels: Record<AppType, string> = {
  node: "Node.js API",
  fastapi: "Python FastAPI",
  docker: "Docker app",
  static: "Static frontend",
  worker: "Worker",
  database: "Database",
};

export const budgetLabels: Record<Budget, string> = {
  free: "Free",
  "under-5": "Under $5",
  "under-10": "Under $10",
  "under-25": "Under $25",
  custom: "Custom",
};

export const databaseLabels: Record<DatabaseNeed, string> = {
  none: "None",
  postgres: "Postgres",
  redis: "Redis",
  mysql: "MySQL",
  sqlite: "SQLite",
  document: "Backend database",
};

export const categoryLabels: Record<PlatformCategory, string> = {
  "app-hosting": "App hosting",
  serverless: "Serverless/edge",
  database: "Database/BaaS",
  frontend: "Frontend + functions",
  "cloud-vm": "Cloud VM/IaaS",
  "self-hosted": "Self-hosted PaaS",
  "enterprise-paas": "Enterprise PaaS",
  "developer-workspace": "Browser IDE deploys",
};

export const regionLabels: Record<Region, string> = {
  asia: "Asia",
  us: "US",
  europe: "Europe",
  any: "Any",
};

export const riskLabels: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};
