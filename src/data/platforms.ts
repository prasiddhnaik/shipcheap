import type { Platform } from "@/lib/types";

export const pricingDisclaimer =
  "Starter data, verify before relying on it. Hosting prices, free tiers, and card requirements change often.";

export const platforms: Platform[] = [
  {
    slug: "render",
    name: "Render",
    description:
      "A developer-friendly platform for web services, workers, cron jobs, static sites, and managed databases.",
    costRange: "Free static sites; paid web services commonly start around low monthly tiers",
    budgetFit: ["free", "under-10", "under-25", "custom"],
    hasFreeTier: true,
    creditCardRequired: false,
    supports: ["node", "fastapi", "docker", "static"],
    databases: ["postgres", "redis"],
    alwaysOn: true,
    regions: ["us", "europe"],
    billingRisk: "medium",
    freeTierDetails:
      "Starter free options exist for some workloads, but always-on backend needs usually push users toward paid plans.",
    bestFor: ["Small APIs", "managed deploys", "teams that want simple Git-based hosting"],
    pros: ["Simple deploy flow", "good docs", "managed Postgres option"],
    cons: ["Free backend limits can surprise beginners", "region coverage is not universal"],
    warningNotes: ["Confirm current free tier limits and sleep behavior before depending on it."],
  },
  {
    slug: "railway",
    name: "Railway",
    description:
      "A flexible app hosting platform with quick deploys, environment management, and database add-ons.",
    costRange: "Usage-based starter plans; monthly cost depends on resource consumption",
    budgetFit: ["under-5", "under-10", "under-25", "custom"],
    hasFreeTier: false,
    creditCardRequired: true,
    supports: ["node", "fastapi", "docker"],
    databases: ["postgres", "redis", "mysql"],
    alwaysOn: true,
    regions: ["us", "europe", "asia"],
    billingRisk: "high",
    freeTierDetails:
      "Treat free or trial claims as temporary starter data and verify the current account policy.",
    bestFor: ["Fast prototypes", "full-stack projects", "apps with managed database add-ons"],
    pros: ["Fast setup", "strong developer experience", "broad database support"],
    cons: ["Usage-based billing needs monitoring", "card requirement can block beginners"],
    warningNotes: ["Set spending controls and review usage before running production workloads."],
  },
  {
    slug: "fly",
    name: "Fly.io",
    description:
      "A global app platform for running Dockerized apps close to users with strong regional control.",
    costRange: "Small apps may fit low-cost allowances; production usage is metered",
    budgetFit: ["under-5", "under-10", "under-25", "custom"],
    hasFreeTier: true,
    creditCardRequired: true,
    supports: ["node", "fastapi", "docker"],
    databases: ["postgres", "redis"],
    alwaysOn: true,
    regions: ["us", "europe", "asia"],
    billingRisk: "medium",
    freeTierDetails:
      "Free allowances and included resources should be checked against the current Fly.io pricing page.",
    bestFor: ["Docker apps", "global APIs", "teams comfortable with infrastructure concepts"],
    pros: ["Excellent regional control", "Docker-native", "good fit for always-on services"],
    cons: ["More operational concepts than beginner platforms", "billing is metered"],
    warningNotes: ["Verify machine, volume, and bandwidth pricing before scaling."],
  },
  {
    slug: "koyeb",
    name: "Koyeb",
    description:
      "A serverless-style app platform for containers, Git deploys, APIs, workers, and global services.",
    costRange: "Free starter options plus paid instances for production use",
    budgetFit: ["free", "under-10", "under-25", "custom"],
    hasFreeTier: true,
    creditCardRequired: false,
    supports: ["node", "fastapi", "docker", "worker"],
    databases: ["postgres"],
    alwaysOn: true,
    regions: ["us", "europe", "asia"],
    billingRisk: "low",
    freeTierDetails:
      "Starter data suggests beginner-friendly free entry points; verify quotas before relying on them.",
    bestFor: ["No-card experiments", "Docker APIs", "beginner-safe backend hosting"],
    pros: ["No-card-friendly starter path", "Docker support", "good API hosting fit"],
    cons: ["Database story often depends on external providers", "quotas need verification"],
    warningNotes: ["Check current free instance limits and deployment region availability."],
  },
  {
    slug: "vercel",
    name: "Vercel",
    description:
      "A frontend-first platform with strong serverless and edge support, best known for Next.js deployments.",
    costRange: "Generous hobby tier for frontend/serverless; paid plans for teams and heavier usage",
    budgetFit: ["free", "under-25", "custom"],
    hasFreeTier: true,
    creditCardRequired: false,
    supports: ["node", "static", "worker"],
    databases: ["postgres"],
    alwaysOn: false,
    regions: ["us", "europe", "asia"],
    billingRisk: "medium",
    freeTierDetails:
      "Hobby usage can be very useful, but backend fit depends on serverless limits and current plan rules.",
    bestFor: ["Next.js apps", "static frontends", "serverless APIs"],
    pros: ["Excellent frontend workflow", "no-card hobby path", "fast global deploys"],
    cons: ["Not ideal for long-running backend processes", "serverless limits matter"],
    warningNotes: ["Review execution, bandwidth, and team/commercial use limits."],
  },
  {
    slug: "supabase",
    name: "Supabase",
    description:
      "A hosted Postgres platform with auth, storage, edge functions, and realtime features.",
    costRange: "Free project tier; paid project plans for production resources",
    budgetFit: ["free", "under-25", "custom"],
    hasFreeTier: true,
    creditCardRequired: false,
    supports: ["database", "worker"],
    databases: ["postgres"],
    alwaysOn: true,
    regions: ["us", "europe", "asia"],
    billingRisk: "low",
    freeTierDetails:
      "Free projects are useful for learning and MVPs, with production limits that must be checked.",
    bestFor: ["Postgres-backed apps", "backend-as-a-service", "projects needing auth later"],
    pros: ["Strong Postgres base", "beginner-friendly free tier", "useful dashboard"],
    cons: ["Not general-purpose app hosting", "paid plans needed as usage grows"],
    warningNotes: ["Verify project pausing, quotas, storage, and egress rules."],
  },
  {
    slug: "neon",
    name: "Neon",
    description:
      "A serverless Postgres platform with branching, autoscaling, and developer-friendly database workflows.",
    costRange: "Free database starter tier; paid usage for larger projects",
    budgetFit: ["free", "under-10", "under-25", "custom"],
    hasFreeTier: true,
    creditCardRequired: false,
    supports: ["database"],
    databases: ["postgres"],
    alwaysOn: true,
    regions: ["us", "europe", "asia"],
    billingRisk: "low",
    freeTierDetails:
      "Starter data suggests a useful free Postgres path; verify compute, storage, and branch limits.",
    bestFor: ["Postgres databases", "branching workflows", "pairing with Vercel or Koyeb"],
    pros: ["Great Postgres developer experience", "no-card-friendly entry", "database branching"],
    cons: ["Database only, not app hosting", "serverless behavior may need app tuning"],
    warningNotes: ["Check compute hours, storage, and autosuspend behavior."],
  },
  {
    slug: "digitalocean-app-platform",
    name: "DigitalOcean App Platform",
    description:
      "A managed app platform from DigitalOcean for services, static sites, workers, and managed databases.",
    costRange: "Paid app platform tiers with separate managed database pricing",
    budgetFit: ["under-10", "under-25", "custom"],
    hasFreeTier: true,
    creditCardRequired: true,
    supports: ["node", "fastapi", "docker", "static", "worker"],
    databases: ["postgres", "redis", "mysql"],
    alwaysOn: true,
    regions: ["us", "europe", "asia"],
    billingRisk: "medium",
    freeTierDetails:
      "Static-site starter options may exist; backend services and databases should be treated as paid.",
    bestFor: ["Predictable paid hosting", "teams already using DigitalOcean", "managed app services"],
    pros: ["Established cloud provider", "managed databases", "broad runtime support"],
    cons: ["Card usually required", "database costs can exceed tiny budgets"],
    warningNotes: ["Check app instance, build minute, database, bandwidth, and regional pricing."],
  },
];

export function getPlatformBySlug(slug: string) {
  return platforms.find((platform) => platform.slug === slug);
}
