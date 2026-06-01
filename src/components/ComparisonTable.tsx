"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FeatureBadge } from "@/components/FeatureBadge";
import { platforms } from "@/data/platforms";
import type { Platform } from "@/lib/types";
import { appTypeLabels, databaseLabels, regionLabels } from "@/lib/utils";

type FilterKey = "free" | "noCard" | "docker" | "database" | "lowRisk";

const filters: { key: FilterKey; label: string }[] = [
  { key: "free", label: "Free tier only" },
  { key: "noCard", label: "No card required" },
  { key: "docker", label: "Docker support" },
  { key: "database", label: "Database support" },
  { key: "lowRisk", label: "Low billing risk" },
];

export function ComparisonTable() {
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, boolean>>({
    free: false,
    noCard: false,
    docker: false,
    database: false,
    lowRisk: false,
  });

  const filteredPlatforms = useMemo(() => {
    return platforms.filter((platform) => {
      if (activeFilters.free && !platform.hasFreeTier) return false;
      if (activeFilters.noCard && platform.creditCardRequired) return false;
      if (activeFilters.docker && !platform.supports.includes("docker")) return false;
      if (activeFilters.database && platform.databases.length === 0) return false;
      if (activeFilters.lowRisk && platform.billingRisk !== "low") return false;
      return true;
    });
  }, [activeFilters]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() =>
              setActiveFilters((current) => ({
                ...current,
                [filter.key]: !current[filter.key],
              }))
            }
            className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
              activeFilters[filter.key]
                ? "border-cyan-300/60 bg-cyan-300/15 text-cyan-100"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/70">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <Th>Platform</Th>
                <Th>Free tier</Th>
                <Th>Credit card</Th>
                <Th>Node.js</Th>
                <Th>FastAPI</Th>
                <Th>Docker</Th>
                <Th>Database support</Th>
                <Th>Always-on</Th>
                <Th>Regions</Th>
                <Th>Billing risk</Th>
                <Th>Best for</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPlatforms.map((platform) => (
                <tr key={platform.slug} className="align-top text-slate-300">
                  <Td>
                    <Link className="font-semibold text-white hover:text-cyan-200" href={`/platforms/${platform.slug}`}>
                      {platform.name}
                    </Link>
                  </Td>
                  <Td>{platform.hasFreeTier ? <FeatureBadge tone="good">Yes</FeatureBadge> : "No"}</Td>
                  <Td>{platform.creditCardRequired ? <FeatureBadge tone="warn">Required</FeatureBadge> : <FeatureBadge tone="good">No card</FeatureBadge>}</Td>
                  <Td>{support(platform, "node")}</Td>
                  <Td>{support(platform, "fastapi")}</Td>
                  <Td>{support(platform, "docker")}</Td>
                  <Td>{platform.databases.map((database) => databaseLabels[database]).join(", ") || "None"}</Td>
                  <Td>{platform.alwaysOn ? "Yes" : "No"}</Td>
                  <Td>{platform.regions.map((region) => regionLabels[region]).join(", ")}</Td>
                  <Td>
                    <BillingRiskBadge risk={platform.billingRisk} />
                  </Td>
                  <Td>{platform.bestFor.join(", ")}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function support(platform: Platform, appType: Platform["supports"][number]) {
  return platform.supports.includes(appType) ? appTypeLabels[appType] : "No";
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-4 leading-6">{children}</td>;
}
