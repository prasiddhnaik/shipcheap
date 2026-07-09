import type { CalculatorInput } from "@/lib/types";

export type ScenarioPack = {
  id: string;
  title: string;
  summary: string;
  input: CalculatorInput;
  riskHint: string;
};

export const scenarioPacks: ScenarioPack[] = [
  {
    id: "student-no-card",
    title: "Student, no card",
    summary: "FastAPI + Postgres, free budget, low billing risk, no credit card.",
    riskHint: "Prefer no-card paths and verify free-tier sleep behavior.",
    input: {
      appType: "fastapi",
      budget: "free",
      database: "postgres",
      alwaysOn: false,
      hasCard: false,
      region: "any",
      riskLevel: "low",
    },
  },
  {
    id: "side-project-10",
    title: "Side project under $10",
    summary: "Node API with Postgres, always-on, tight monthly budget.",
    riskHint: "Set spend alerts before attaching a card.",
    input: {
      appType: "node",
      budget: "under-10",
      database: "postgres",
      alwaysOn: true,
      hasCard: true,
      region: "us",
      riskLevel: "medium",
    },
  },
  {
    id: "discord-bot",
    title: "Always-on Discord bot",
    summary: "Worker-style backend that must stay awake, low spend tolerance.",
    riskHint: "Always-on free tiers are rare — model idle compute carefully.",
    input: {
      appType: "worker",
      budget: "under-5",
      database: "none",
      alwaysOn: true,
      hasCard: false,
      region: "any",
      riskLevel: "low",
    },
  },
  {
    id: "docker-api",
    title: "Docker API prototype",
    summary: "Containerized backend with Redis, flexible region, medium risk.",
    riskHint: "Check bandwidth and log retention before public launch.",
    input: {
      appType: "docker",
      budget: "under-25",
      database: "redis",
      alwaysOn: true,
      hasCard: true,
      region: "europe",
      riskLevel: "medium",
    },
  },
];

export function getScenarioPack(id: string) {
  return scenarioPacks.find((pack) => pack.id === id);
}
