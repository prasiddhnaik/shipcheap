import type { Platform, RiskLevel } from "@/lib/types";

export type TrafficLevel = "small" | "steady" | "spike";
export type SpendControl = "none" | "alerts" | "hard-cap";
export type DataLoad = "none" | "small" | "growing" | "heavy";
export type JobLoad = "none" | "scheduled" | "always-on";

export type SimulatorInput = {
  hasCard: boolean;
  providerSlug: string;
  trafficLevel: TrafficLevel;
  spendControl: SpendControl;
  dataLoad: DataLoad;
  bandwidthHeavy: boolean;
  keepsLogs: boolean;
  jobLoad: JobLoad;
  monthlyUsers: number;
  requestsPerUser: number;
  avgResponseKb: number;
  storageGb: number;
  jobHours: number;
  budgetLimit: number;
};

export const defaultSimulatorInput: SimulatorInput = {
  hasCard: false,
  providerSlug: "koyeb",
  trafficLevel: "small",
  spendControl: "alerts",
  dataLoad: "small",
  bandwidthHeavy: false,
  keepsLogs: false,
  jobLoad: "none",
  monthlyUsers: 500,
  requestsPerUser: 35,
  avgResponseKb: 120,
  storageGb: 1,
  jobHours: 0,
  budgetLimit: 25,
};

export const trafficLabels: Record<TrafficLevel, string> = {
  small: "Small prototype",
  steady: "Steady users",
  spike: "User or bot spike possible",
};

export const spendControlLabels: Record<SpendControl, string> = {
  none: "No alerts or cap",
  alerts: "Budget alerts",
  "hard-cap": "Hard cap or no-card path",
};

export const dataLoadLabels: Record<DataLoad, string> = {
  none: "No persistent data",
  small: "Small database",
  growing: "Growing database",
  heavy: "Heavy storage/data",
};

export const jobLoadLabels: Record<JobLoad, string> = {
  none: "No jobs",
  scheduled: "Cron or queues",
  "always-on": "Always-on workers",
};

export type SimulatedCostCenter = {
  label: string;
  p90: number;
};

export type BillSimulationResult = {
  runs: number;
  level: RiskLevel;
  p50: number;
  p90: number;
  worst: number;
  uncappedP90: number;
  over25Probability: number;
  over100Probability: number;
  overBudgetProbability: number;
  shockProbability: number;
  budgetLimit: number;
  sampleUsersP90: number;
  sampleRequestsP90: number;
  costCenters: SimulatedCostCenter[];
  headline: string;
  caveat: string;
};

type SimulatedMonth = {
  users: number;
  requests: number;
  total: number;
  uncappedTotal: number;
  compute: number;
  bandwidth: number;
  database: number;
  jobs: number;
  logs: number;
  platform: number;
};

const SIMULATION_RUNS = 1000;

export function simulateMonthlyBill(input: SimulatorInput, provider: Platform): BillSimulationResult {
  const random = seededRandom(`${provider.slug}:${JSON.stringify(input)}`);
  const months: SimulatedMonth[] = [];

  for (let index = 0; index < SIMULATION_RUNS; index += 1) {
    months.push(simulateOneMonth(input, provider, random));
  }

  const totals = months.map((month) => month.total).sort((a, b) => a - b);
  const uncappedTotals = months.map((month) => month.uncappedTotal).sort((a, b) => a - b);
  const users = months.map((month) => month.users).sort((a, b) => a - b);
  const requests = months.map((month) => month.requests).sort((a, b) => a - b);
  const p50 = percentile(totals, 0.5);
  const p90 = percentile(totals, 0.9);
  const worst = totals[totals.length - 1] ?? 0;
  const uncappedP90 = percentile(uncappedTotals, 0.9);
  const over25Probability = probability(months, (month) => month.uncappedTotal > 25);
  const over100Probability = probability(months, (month) => month.uncappedTotal > 100);
  const overBudgetProbability = probability(months, (month) => month.uncappedTotal > input.budgetLimit);
  const shockProbability = probability(months, (month) => month.uncappedTotal > 250);
  const level = p90 >= 100 || shockProbability >= 0.08 ? "high" : p90 >= 25 || over100Probability >= 0.08 ? "medium" : "low";

  return {
    runs: SIMULATION_RUNS,
    level,
    p50,
    p90,
    worst,
    uncappedP90,
    over25Probability,
    over100Probability,
    overBudgetProbability,
    shockProbability,
    budgetLimit: input.budgetLimit,
    sampleUsersP90: percentile(users, 0.9),
    sampleRequestsP90: percentile(requests, 0.9),
    costCenters: buildCostCenters(months),
    headline: buildHeadline(level, p90, worst),
    caveat:
      "This is a rough Monte Carlo-style model, not an official provider quote. It uses ShipCheap's provider traits plus generic usage assumptions so you can test risk shape before checking live pricing docs.",
  };
}

function simulateOneMonth(input: SimulatorInput, provider: Platform, random: () => number): SimulatedMonth {
  const model = providerCostModel(provider);
  const users = sampleUsers(input, random);
  const requestsPerUser = sampleAround(random, input.requestsPerUser, input.trafficLevel === "spike" ? 0.9 : 0.35);
  const botMultiplier = input.trafficLevel === "spike" && random() < 0.22 ? sampleRange(random, 4, 35) : 1;
  const requests = Math.round(users * requestsPerUser * botMultiplier);
  const responseKb = sampleAround(random, input.avgResponseKb, input.bandwidthHeavy ? 1.1 : 0.45);
  const bandwidthGb = requests * responseKb / 1_000_000;
  const computeHours = sampleComputeHours(input, provider, requests, random);
  const dbGb = sampleDataGb(input, random);
  const logGb = input.keepsLogs ? requests * sampleRange(random, 1.5, 8) / 1_000_000 : 0;
  const jobHours = sampleJobHours(input, random);

  const platform = model.baseMonthly;
  const compute = Math.max(0, computeHours - model.freeComputeHours) * model.computeHourCost;
  const requestCost = Math.max(0, requests / 1_000_000 - model.freeMillionRequests) * model.requestMillionCost;
  const bandwidth = Math.max(0, bandwidthGb - model.freeBandwidthGb) * model.bandwidthGbCost;
  const database = Math.max(0, dbGb - model.freeDatabaseGb) * model.databaseGbCost;
  const jobs = jobHours * model.jobHourCost;
  const logs = Math.max(0, logGb - model.freeLogGb) * model.logGbCost;
  const uncappedTotal = platform + compute + requestCost + bandwidth + database + jobs + logs;
  const total = applySpendControl(uncappedTotal, input, provider);

  return {
    users,
    requests,
    total,
    uncappedTotal,
    compute: compute + requestCost,
    bandwidth,
    database,
    jobs,
    logs,
    platform,
  };
}

function providerCostModel(provider: Platform) {
  const riskMultiplier = provider.billingRisk === "high" ? 1.7 : provider.billingRisk === "medium" ? 1.25 : 0.8;
  const freeTierDiscount = provider.hasFreeTier ? 1 : 0;
  const cardMultiplier = provider.creditCardRequired ? 1.2 : 0.9;

  return {
    baseMonthly: provider.hasFreeTier ? 0 : 5 * riskMultiplier,
    freeComputeHours: freeTierDiscount ? 90 : 0,
    freeMillionRequests: freeTierDiscount ? 0.75 : 0,
    freeBandwidthGb: freeTierDiscount ? 35 : 5,
    freeDatabaseGb: provider.databases.length > 0 ? 1.5 : 0,
    freeLogGb: freeTierDiscount ? 1 : 0,
    computeHourCost: 0.018 * riskMultiplier * cardMultiplier,
    requestMillionCost: 0.6 * riskMultiplier,
    bandwidthGbCost: 0.1 * riskMultiplier,
    databaseGbCost: 0.75 * riskMultiplier,
    jobHourCost: 0.012 * riskMultiplier,
    logGbCost: 0.35 * riskMultiplier,
  };
}

function sampleUsers(input: SimulatorInput, random: () => number) {
  if (input.trafficLevel === "small") return Math.round(sampleAround(random, input.monthlyUsers, 0.35));
  if (input.trafficLevel === "steady") return Math.round(sampleAround(random, input.monthlyUsers, 0.7));

  const base = sampleAround(random, input.monthlyUsers, 0.9);
  const viralMultiplier = random() < 0.18 ? sampleRange(random, 8, 70) : sampleRange(random, 1.2, 6);
  return Math.round(base * viralMultiplier);
}

function sampleComputeHours(input: SimulatorInput, provider: Platform, requests: number, random: () => number) {
  const requestDrivenHours = requests / sampleRange(random, 35_000, 95_000);
  const alwaysOnHours = provider.alwaysOn && input.jobLoad !== "none" ? sampleRange(random, 80, 730) : 0;
  return requestDrivenHours + alwaysOnHours;
}

function sampleDataGb(input: SimulatorInput, random: () => number) {
  if (input.dataLoad === "none") return 0;
  if (input.dataLoad === "small") return sampleAround(random, input.storageGb, 0.45);
  if (input.dataLoad === "growing") return sampleAround(random, input.storageGb, 1.1);
  return sampleAround(random, input.storageGb, 1.8);
}

function sampleJobHours(input: SimulatorInput, random: () => number) {
  if (input.jobLoad === "none") return 0;
  if (input.jobLoad === "scheduled") return sampleAround(random, input.jobHours, 0.65);
  return sampleAround(random, input.jobHours, 0.8);
}

function applySpendControl(uncappedTotal: number, input: SimulatorInput, provider: Platform) {
  if (input.spendControl === "hard-cap") return Math.min(uncappedTotal, input.budgetLimit);
  if (!input.hasCard && !provider.creditCardRequired) return Math.min(uncappedTotal, Math.max(10, input.budgetLimit));
  return uncappedTotal;
}

function buildCostCenters(months: SimulatedMonth[]) {
  const centers: Array<keyof Pick<SimulatedMonth, "platform" | "compute" | "bandwidth" | "database" | "jobs" | "logs">> = [
    "compute",
    "bandwidth",
    "database",
    "jobs",
    "logs",
    "platform",
  ];

  return centers
    .map((center) => ({
      label: center === "platform" ? "base platform cost" : center,
      p90: percentile(months.map((month) => month[center]).sort((a, b) => a - b), 0.9),
    }))
    .filter((center) => center.p90 > 0.5)
    .sort((a, b) => b.p90 - a.p90)
    .slice(0, 4);
}

function buildHeadline(level: RiskLevel, p90: number, worst: number) {
  if (level === "low") return `Most simulated months stay near ${formatCurrency(p90)} or less.`;
  if (level === "medium") return `A rough high-usage month lands around ${formatCurrency(p90)}, with worse samples near ${formatCurrency(worst)}.`;
  return `The simulated bad months can reach ${formatCurrency(worst)} if traffic or usage blows up.`;
}

export function formatCurrency(value: number) {
  if (value >= 1000) return `$${Math.round(value).toLocaleString("en-US")}`;
  if (value >= 100) return `$${Math.round(value)}`;
  return `$${value.toFixed(value >= 10 ? 0 : 2)}`;
}

export function formatProbability(value: number) {
  if (value === 0) return "0%";
  if (value < 0.01) return "<1%";
  return `${Math.round(value * 100)}%`;
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return 0;
  const index = Math.min(values.length - 1, Math.max(0, Math.ceil(values.length * p) - 1));
  return values[index] ?? 0;
}

function probability(months: SimulatedMonth[], predicate: (month: SimulatedMonth) => boolean) {
  return months.filter(predicate).length / months.length;
}

function sampleRange(random: () => number, min: number, max: number) {
  return min + (max - min) * random();
}

function sampleAround(random: () => number, value: number, spread: number) {
  const safeValue = Math.max(0, value);
  const min = safeValue * Math.max(0.05, 1 - spread);
  const max = safeValue * (1 + spread);
  return sampleRange(random, min, Math.max(min, max));
}

function seededRandom(seedText: string) {
  let seed = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    seed ^= seedText.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
