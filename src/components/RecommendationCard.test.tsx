import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { platforms } from "@/data/platforms";
import type { RankedPlatform } from "@/lib/types";
import { RecommendationCard } from "./DashboardHome";

function resultFor(slug: string): RankedPlatform {
  const platform = platforms.find((candidate) => candidate.slug === slug);
  assert.ok(platform, `Expected ${slug} in the provider catalog.`);

  return {
    platform,
    rank: 2,
    score: 96,
    matchedReasons: ["Fits the selected backend and budget requirements."],
    warnings: [],
  };
}

test("a selected recommendation keeps the full provider name, hierarchy, and actions", () => {
  const html = renderToStaticMarkup(
    <RecommendationCard result={resultFor("google-cloud-run")} index={1} selected onSelect={() => undefined} />,
  );

  assert.match(html, />Google Cloud Run</);
  assert.doesNotMatch(html, /truncate/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, />Selected</);
  assert.match(html, /h-14 w-14/);
  assert.match(html, /rounded-full/);
  assert.match(html, /min-h-11/);
  assert.match(html, /href="\/platforms\/google-cloud-run"/);
  assert.match(html, /href="\/compare\?platform=google-cloud-run"/);
});

test("recommendation cards expose an explicit selection control for keyboard users", () => {
  const html = renderToStaticMarkup(
    <RecommendationCard result={resultFor("northflank")} index={2} selected={false} onSelect={() => undefined} />,
  );

  assert.match(html, /<button[^>]*aria-pressed="false"[^>]*>[\s\S]*Select/);
  assert.match(html, /Northflank logo/);
});
