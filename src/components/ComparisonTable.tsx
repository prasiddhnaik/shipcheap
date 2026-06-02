"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BillingRiskBadge } from "@/components/BillingRiskBadge";
import { FeatureBadge } from "@/components/FeatureBadge";
import { ProviderLogo } from "@/components/ProviderLogo";
import { getPlatformCategory, platforms } from "@/data/platforms";
import type { Platform, PlatformCategory } from "@/lib/types";
import { appTypeLabels, categoryLabels, databaseLabels, regionLabels } from "@/lib/utils";
import { Check, X } from "lucide-react";

type FilterKey = "free" | "noCard" | "docker" | "database" | "lowRisk";

const filters: { key: FilterKey; label: string }[] = [
  { key: "free", label: "Free tier only" },
  { key: "noCard", label: "No card required" },
  { key: "docker", label: "Docker support" },
  { key: "database", label: "Database support" },
  { key: "lowRisk", label: "Low billing risk" },
];

export function ComparisonTable({ selectedPlatformSlug }: { selectedPlatformSlug?: string }) {
  const [activeCategory, setActiveCategory] = useState<PlatformCategory | "all">("all");
  const [activeFilters, setActiveFilters] = useState<Record<FilterKey, boolean>>({
    free: false,
    noCard: false,
    docker: false,
    database: false,
    lowRisk: false,
  });

  const filteredPlatforms = useMemo(() => {
    return platforms.filter((platform) => {
      if (activeCategory !== "all" && getPlatformCategory(platform.slug) !== activeCategory) return false;
      if (activeFilters.free && !platform.hasFreeTier) return false;
      if (activeFilters.noCard && platform.creditCardRequired) return false;
      if (activeFilters.docker && !platform.supports.includes("docker")) return false;
      if (activeFilters.database && platform.databases.length === 0) return false;
      if (activeFilters.lowRisk && platform.billingRisk !== "low") return false;
      return true;
    }).sort((a, b) => {
      if (!selectedPlatformSlug) return 0;
      if (a.slug === selectedPlatformSlug) return -1;
      if (b.slug === selectedPlatformSlug) return 1;
      return 0;
    });
  }, [activeCategory, activeFilters, selectedPlatformSlug]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-[#111821]/85 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Comparison matrix</h2>
            <p className="mt-1 text-sm text-slate-400">
              {selectedPlatformSlug ? "Selected provider is highlighted below." : "Use filters to narrow providers by billing and runtime fit."}
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-400">
            {filteredPlatforms.length} providers
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
        <select
          value={activeCategory}
          onChange={(event) => setActiveCategory(event.target.value as PlatformCategory | "all")}
          className="rounded-md border border-white/10 bg-[#080d14] px-3 py-2 text-sm font-semibold text-slate-200 outline-none transition focus:border-violet-300/60"
        >
          <option value="all">All categories</option>
          {(Object.entries(categoryLabels) as [PlatformCategory, string][]).map(([category, label]) => (
            <option key={category} value={category}>
              {label}
            </option>
          ))}
        </select>
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
                ? "border-violet-300/60 bg-violet-500/20 text-violet-100"
                : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
            }`}
          >
            {filter.label}
          </button>
        ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111821]/85">
        <div className="overflow-x-auto">
          <table className="min-w-[1080px] w-full table-fixed border-collapse text-left text-sm">
            <thead className="bg-white/[0.04] text-xs font-semibold text-slate-300">
              <tr>
                <Th>Platform</Th>
                <Th>Category</Th>
                <Th>Free tier</Th>
                <Th>Credit card</Th>
                <Th>Node.js</Th>
                <Th>FastAPI</Th>
                <Th>Docker</Th>
                <Th>Database support</Th>
                <Th>Always-on</Th>
                <Th>Regions</Th>
                <Th>Billing risk</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPlatforms.map((platform) => (
                <tr
                  key={platform.slug}
                  className={`align-top text-slate-300 transition ${
                    platform.slug === selectedPlatformSlug ? "bg-violet-500/10 ring-1 ring-inset ring-violet-300/35" : "hover:bg-white/[0.025]"
                  }`}
                >
                  <Td>
                    <div className="flex items-center gap-3">
                      <ProviderLogo name={platform.name} />
                      <div>
                        <Link className="font-semibold text-white hover:text-violet-200" href={`/platforms/${platform.slug}`}>
                          {platform.name}
                        </Link>
                        {platform.slug === selectedPlatformSlug && <p className="mt-1 text-xs font-medium text-violet-200">Selected from recommendations</p>}
                      </div>
                    </div>
                  </Td>
                  <Td>{categoryLabels[getPlatformCategory(platform.slug)]}</Td>
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
  return platform.supports.includes(appType) ? (
    <span className="inline-flex items-center gap-1 text-emerald-300">
      <Check size={13} />
      {appTypeLabels[appType]}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-slate-500">
      <X size={13} />
      No
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold first:w-[18%]">{children}</th>;
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-4 leading-6">{children}</td>;
}
