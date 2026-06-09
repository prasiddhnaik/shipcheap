import type { Metadata } from "next";
import { AppChrome } from "@/components/AppChrome";
import { BillingRiskSimulator } from "@/components/BillingRiskSimulator";
import { platforms } from "@/data/platforms";
import { defaultSimulatorInput, type SimulatorInput } from "@/lib/billing-risk-simulation";

export const metadata: Metadata = {
  title: "Billing Risk Simulator | ShipCheap",
  description: "Model accidental hosting bill risk before choosing a deployment platform.",
};

const trafficLevels = new Set<SimulatorInput["trafficLevel"]>(["small", "steady", "spike"]);
const spendControls = new Set<SimulatorInput["spendControl"]>(["none", "alerts", "hard-cap"]);
const dataLoads = new Set<SimulatorInput["dataLoad"]>(["none", "small", "growing", "heavy"]);
const jobLoads = new Set<SimulatorInput["jobLoad"]>(["none", "scheduled", "always-on"]);

type BillingRiskSearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BillingRiskPage({ searchParams }: { searchParams: BillingRiskSearchParams }) {
  const initialInput = parseInitialInput(await searchParams);

  return (
    <AppChrome active="billing-risk" compactSidebar>
      <BillingRiskSimulator initialInput={initialInput} />
    </AppChrome>
  );
}

function parseInitialInput(searchParams: Record<string, string | string[] | undefined>): SimulatorInput {
  const value = (key: string) => {
    const raw = searchParams[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };
  const provider = value("provider");
  const traffic = value("traffic");
  const spend = value("spend");
  const data = value("data");
  const jobs = value("jobs");

  return {
    ...defaultSimulatorInput,
    providerSlug: provider && platforms.some((platform) => platform.slug === provider) ? provider : defaultSimulatorInput.providerSlug,
    hasCard: parseBoolean(value("hasCard"), defaultSimulatorInput.hasCard),
    trafficLevel: traffic && trafficLevels.has(traffic as SimulatorInput["trafficLevel"]) ? traffic as SimulatorInput["trafficLevel"] : defaultSimulatorInput.trafficLevel,
    spendControl: spend && spendControls.has(spend as SimulatorInput["spendControl"]) ? spend as SimulatorInput["spendControl"] : defaultSimulatorInput.spendControl,
    dataLoad: data && dataLoads.has(data as SimulatorInput["dataLoad"]) ? data as SimulatorInput["dataLoad"] : defaultSimulatorInput.dataLoad,
    bandwidthHeavy: parseBoolean(value("bandwidth"), defaultSimulatorInput.bandwidthHeavy),
    keepsLogs: parseBoolean(value("logs"), defaultSimulatorInput.keepsLogs),
    jobLoad: jobs && jobLoads.has(jobs as SimulatorInput["jobLoad"]) ? jobs as SimulatorInput["jobLoad"] : defaultSimulatorInput.jobLoad,
    monthlyUsers: parseNumber(value("users"), defaultSimulatorInput.monthlyUsers, 0, 10_000_000),
    requestsPerUser: parseNumber(value("rpu"), defaultSimulatorInput.requestsPerUser, 1, 10_000),
    avgResponseKb: parseNumber(value("responseKb"), defaultSimulatorInput.avgResponseKb, 1, 100_000),
    storageGb: parseNumber(value("storageGb"), defaultSimulatorInput.storageGb, 0, 1_000_000),
    jobHours: parseNumber(value("jobHours"), defaultSimulatorInput.jobHours, 0, 100_000),
    budgetLimit: parseNumber(value("budget"), defaultSimulatorInput.budgetLimit, 1, 1_000_000),
  };
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function parseNumber(value: string | undefined, fallback: number, min: number, max: number) {
  if (!value) return fallback;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, numberValue));
}
