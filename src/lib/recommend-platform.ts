import { platforms } from "@/data/platforms";
import type { CalculatorInput, Platform, RankedPlatform, RiskLevel } from "@/lib/types";
import { databaseLabels } from "@/lib/utils";

const riskOrder: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function fitsRiskTolerance(platformRisk: RiskLevel, tolerance: RiskLevel) {
  return riskOrder[platformRisk] <= riskOrder[tolerance];
}

function scorePlatform(platform: Platform, input: CalculatorInput) {
  let score = 0;
  const matchedReasons: string[] = [];
  const warnings: string[] = [];

  if (platform.supports.includes(input.appType)) {
    score += 30;
    matchedReasons.push(`Supports your selected app type.`);
  }

  if (platform.budgetFit.includes(input.budget) || input.budget === "custom") {
    score += 25;
    matchedReasons.push(`Looks compatible with your selected budget range.`);
  }

  if (input.budget === "free" && platform.hasFreeTier) {
    score += 20;
    matchedReasons.push(`Has a starter free tier.`);
  }

  if (!input.hasCard && !platform.creditCardRequired) {
    score += 20;
    matchedReasons.push(`Does not require a credit card for the beginner path.`);
  } else if (!input.hasCard && platform.creditCardRequired) {
    warnings.push(`Likely blocked because a credit card is required.`);
  }

  if (input.database === "none" || platform.databases.includes(input.database)) {
    score += 15;
    matchedReasons.push(
      input.database === "none"
        ? `No database requirement keeps this option simple.`
        : `Supports ${databaseLabels[input.database]} for your app.`,
    );
  } else {
    warnings.push(`Does not directly match your selected database need.`);
  }

  if (!input.alwaysOn || platform.alwaysOn) {
    score += 15;
    matchedReasons.push(input.alwaysOn ? `Supports always-on hosting.` : `Can fit non always-on workloads.`);
  } else {
    warnings.push(`May not fit always-on backend services.`);
  }

  if (input.region === "any" || platform.regions.includes(input.region)) {
    score += 10;
    matchedReasons.push(`Covers your preferred region.`);
  }

  if (fitsRiskTolerance(platform.billingRisk, input.riskLevel)) {
    score += 15;
    matchedReasons.push(`Billing risk fits your tolerance.`);
  } else {
    warnings.push(`Billing risk is higher than your selected tolerance.`);
  }

  if (input.riskLevel === "low" && platform.billingRisk === "low") {
    score += 10;
    matchedReasons.push(`Low-risk option gets a beginner-safety bonus.`);
  }

  warnings.push(...platform.warningNotes);

  return { score, matchedReasons, warnings };
}

export function recommendPlatforms(input: CalculatorInput): RankedPlatform[] {
  return platforms
    .map((platform) => {
      const result = scorePlatform(platform, input);
      return { platform, ...result };
    })
    .sort((a, b) => b.score - a.score || a.platform.name.localeCompare(b.platform.name))
    .map((result, index) => ({ ...result, rank: index + 1 }));
}

export const defaultCalculatorInput: CalculatorInput = {
  appType: "node",
  budget: "free",
  database: "postgres",
  alwaysOn: true,
  hasCard: false,
  region: "asia",
  riskLevel: "low",
};
