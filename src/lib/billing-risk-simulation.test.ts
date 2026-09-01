import assert from "node:assert/strict";
import test from "node:test";
import { platforms } from "@/data/platforms";
import {
  buildBillingRiskToolResult,
  defaultSimulatorInput,
  simulateMonthlyBill,
} from "./billing-risk-simulation";

function platform(slug: string) {
  const match = platforms.find((entry) => entry.slug === slug);
  assert.ok(match, `Expected ${slug} to exist in the provider catalog.`);
  return match;
}

test("a no-card Fly.io scenario is unavailable and never shown as a zero-cost free tier", () => {
  const fly = platform("fly");
  const result = simulateMonthlyBill(
    { ...defaultSimulatorInput, providerSlug: fly.slug, hasCard: false },
    fly,
  );

  assert.equal(result.availability, "requires-card");
  assert.match(result.availabilityReason ?? "", /card/i);
  assert.ok(result.p90 > 0, "Fly.io should have a non-zero usage-based estimate.");
});

test("a Render free instance remains available without a payment card", () => {
  const render = platform("render");
  const result = simulateMonthlyBill(
    { ...defaultSimulatorInput, providerSlug: render.slug, hasCard: false },
    render,
  );

  assert.equal(result.availability, "available");
  assert.equal(result.availabilityReason, null);
});

test("attaching a card makes a card-required provider eligible for cost modeling", () => {
  const fly = platform("fly");
  const result = simulateMonthlyBill(
    { ...defaultSimulatorInput, providerSlug: fly.slug, hasCard: true },
    fly,
  );

  assert.equal(result.availability, "available");
  assert.equal(result.availabilityReason, null);
  assert.ok(result.p90 > 0);
});

test("self-hosted platforms include infrastructure cost instead of appearing as free hosting", () => {
  for (const slug of ["coolify", "dokku", "caprover"]) {
    const selfHosted = platform(slug);
    const result = simulateMonthlyBill(
      { ...defaultSimulatorInput, providerSlug: selfHosted.slug, hasCard: false },
      selfHosted,
    );

    assert.equal(selfHosted.hasFreeTier, false, `${selfHosted.name} software is free, but its server is not.`);
    assert.ok(result.p90 > 0, `${selfHosted.name} should include a modeled infrastructure cost.`);
  }
});

test("WebMCP billing output suppresses prices for an unavailable provider", () => {
  const fly = platform("fly");
  const simulation = simulateMonthlyBill(
    { ...defaultSimulatorInput, providerSlug: fly.slug, hasCard: false },
    fly,
  );
  const output = buildBillingRiskToolResult(fly, simulation);

  assert.equal(output.availability, "requires-card");
  assert.equal(output.riskLevel, null);
  assert.equal(output.medianBill, null);
  assert.equal(output.highUsageBill, null);
  assert.equal(output.worstSample, null);
  assert.equal(output.overBudgetProbability, null);
  assert.match(output.headline, /card/i);
});
