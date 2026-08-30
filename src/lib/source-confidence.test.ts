import assert from "node:assert/strict";
import test from "node:test";
import type { SourceLink } from "./types";
import { summarizeSourceConfidence, type SourceConfidenceCheck } from "./source-confidence";

const now = new Date("2026-08-26T12:00:00.000Z");
const required: SourceLink[] = [
  { label: "Pricing", url: "https://example.com/pricing" },
  { label: "MCP", url: "https://example.com/mcp" },
];

function check(sourceUrl: string, overrides: Partial<SourceConfidenceCheck> = {}): SourceConfidenceCheck {
  return {
    sourceUrl,
    status: "current",
    changedSinceLastRun: false,
    lastCheckedAt: new Date("2026-08-24T12:00:00.000Z"),
    ...overrides,
  };
}

test("returns verified only when every required source is current and fresh", () => {
  const result = summarizeSourceConfidence("render", required, [check(required[0].url), check(required[1].url)], now);
  assert.equal(result.level, "verified");
  assert.ok(result.sources.every((source) => source.status === "current"));
});

test("returns needs-review when a source changed or failed", () => {
  for (const status of ["changed", "failed", "blocked"] as const) {
    const result = summarizeSourceConfidence(
      "render",
      required,
      [check(required[0].url), check(required[1].url, { status })],
      now,
    );
    assert.equal(result.level, "needs-review");
  }
});

test("returns needs-review when the newest successful check is older than seven days", () => {
  const stale = new Date("2026-08-18T11:59:59.000Z");
  const result = summarizeSourceConfidence(
    "render",
    required,
    [check(required[0].url, { lastCheckedAt: stale }), check(required[1].url, { lastCheckedAt: stale })],
    now,
  );
  assert.equal(result.level, "needs-review");
  assert.ok(result.sources.every((source) => source.status === "stale"));
});

test("returns unknown when no checks exist", () => {
  const result = summarizeSourceConfidence("render", required, [], now);
  assert.equal(result.level, "unknown");
  assert.ok(result.sources.every((source) => source.status === "missing"));
});

test("ignores URLs outside the platform source allowlist", () => {
  const result = summarizeSourceConfidence(
    "render",
    required,
    [check("https://attacker.example/fake"), check(required[0].url), check(required[1].url)],
    now,
  );
  assert.equal(result.level, "verified");
  assert.equal(result.sources.length, required.length);
});
