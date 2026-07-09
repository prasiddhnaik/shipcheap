import type { Platform } from "@/lib/types";
import { getPlatformSourceLinks } from "@/data/platforms";

export type LaunchCheckItem = {
  id: string;
  title: string;
  detail: string;
  severity: "required" | "recommended" | "verify";
};

export function buildLaunchChecklist(platform: Platform): LaunchCheckItem[] {
  const sources = getPlatformSourceLinks(platform.slug);
  const pricingSource = sources.find((link) => /pricing|billing|plans/i.test(link.label)) ?? sources[0];

  const items: LaunchCheckItem[] = [
    {
      id: "verify-pricing",
      title: "Verify current pricing and quotas",
      detail: pricingSource
        ? `Open ${pricingSource.label} and confirm free/paid limits still match what ShipCheap shows.`
        : "Open the provider pricing page and confirm free/paid limits still match what ShipCheap shows.",
      severity: "required",
    },
    {
      id: "env-secrets",
      title: "Set env vars and secrets outside the repo",
      detail: "Put DATABASE_URL, API keys, and auth secrets in the provider dashboard — never commit them.",
      severity: "required",
    },
    {
      id: "health-route",
      title: "Add a health check route",
      detail: "Expose a cheap /health (or similar) endpoint so restarts and probes do not hit expensive work.",
      severity: "recommended",
    },
  ];

  if (platform.creditCardRequired) {
    items.push({
      id: "card-path",
      title: "Expect a card or billing account",
      detail: `${platform.name} usually needs a billing path. Prefer a no-card provider while prototyping if that is a blocker.`,
      severity: "required",
    });
  } else {
    items.push({
      id: "no-card-path",
      title: "Confirm the no-card starter path",
      detail: "Double-check whether free usage still works without attaching a card, and what triggers an upgrade prompt.",
      severity: "verify",
    });
  }

  if (platform.hasFreeTier) {
    items.push({
      id: "sleep-behavior",
      title: "Check free-tier sleep / cold start behavior",
      detail: "Many free backends sleep after idle. Confirm whether that breaks webhooks, bots, or always-on needs.",
      severity: "verify",
    });
  }

  if (platform.alwaysOn) {
    items.push({
      id: "always-on-cost",
      title: "Model always-on compute cost",
      detail: "If the service stays awake, run the bill-risk simulator with always-on / worker hours before launch.",
      severity: "recommended",
    });
  } else {
    items.push({
      id: "always-on-gap",
      title: "Always-on may be limited",
      detail: `${platform.name} is marked limited for always-on. Avoid it for bots, queues, or webhook receivers that cannot sleep.`,
      severity: "required",
    });
  }

  if (platform.databases.length > 0) {
    items.push({
      id: "database-plan",
      title: "Pick the database path deliberately",
      detail: `Supported here: ${platform.databases.join(", ")}. Confirm backup retention, connection limits, and whether the DB is included or add-on priced.`,
      severity: "recommended",
    });
  } else {
    items.push({
      id: "external-db",
      title: "Plan an external database",
      detail: `${platform.name} is not a strong built-in DB host in ShipCheap's data. Pair it with Neon, Supabase, or another managed DB if needed.`,
      severity: "recommended",
    });
  }

  if (platform.billingRisk === "high") {
    items.push({
      id: "spend-controls",
      title: "Set hard spend controls first",
      detail: "High billing-risk providers need budget alerts, caps, or a separate test project before public traffic.",
      severity: "required",
    });
  } else if (platform.billingRisk === "medium") {
    items.push({
      id: "budget-alerts",
      title: "Turn on budget alerts",
      detail: "Create alerts for compute, bandwidth, and database growth before sharing the URL.",
      severity: "recommended",
    });
  }

  items.push(
    {
      id: "rate-limits",
      title: "Add basic rate limits / bot protection",
      detail: "Public APIs get scraped. Cap expensive routes so a crawler cannot create a surprise bill.",
      severity: "recommended",
    },
    {
      id: "log-retention",
      title: "Shorten log and metrics retention while testing",
      detail: "Long retention is a quiet cost center. Keep it short until usage is predictable.",
      severity: "verify",
    },
    {
      id: "run-simulator",
      title: "Run a bill-risk scenario for this provider",
      detail: `Use /platforms/${platform.slug}/simulation or the bill duel to stress-test growth, bots, and storage.`,
      severity: "recommended",
    },
  );

  return items;
}
