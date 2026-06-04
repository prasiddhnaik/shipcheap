export type AppType =
  | "node"
  | "fastapi"
  | "docker"
  | "static"
  | "worker"
  | "database";

export type Budget = "free" | "under-5" | "under-10" | "under-25" | "custom";
export type DatabaseNeed = "none" | "postgres" | "redis" | "mysql" | "sqlite" | "document";
export type PlatformCategory =
  | "app-hosting"
  | "serverless"
  | "database"
  | "frontend"
  | "cloud-vm"
  | "self-hosted"
  | "enterprise-paas"
  | "developer-workspace";
export type Region = "asia" | "us" | "europe" | "any";
export type RiskLevel = "low" | "medium" | "high";

export type CalculatorInput = {
  appType: AppType;
  budget: Budget;
  database: DatabaseNeed;
  alwaysOn: boolean;
  hasCard: boolean;
  region: Region;
  riskLevel: RiskLevel;
};

export type Platform = {
  slug: string;
  name: string;
  description: string;
  costRange: string;
  budgetFit: Budget[];
  hasFreeTier: boolean;
  creditCardRequired: boolean;
  supports: AppType[];
  databases: DatabaseNeed[];
  alwaysOn: boolean;
  regions: Region[];
  billingRisk: RiskLevel;
  bestFor: string[];
  pros: string[];
  cons: string[];
  warningNotes: string[];
  freeTierDetails: string;
};

export type SourceLink = {
  label: string;
  url: string;
};

export type CommunityInfo = {
  userCount: string;
  strength: "small" | "medium" | "large" | "very-large";
  summary: string;
  links: SourceLink[];
};

export type RankedPlatform = {
  platform: Platform;
  score: number;
  matchedReasons: string[];
  warnings: string[];
  rank: number;
};
