import assert from "node:assert/strict";
import test from "node:test";
import { createBillingRiskToolDefinition } from "./WebMCPTools";

const noCardFlyScenario = {
  providerSlug: "fly",
  hasCard: false,
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

test("the registered billing tool parses input, navigates, and suppresses unavailable prices", async () => {
  const routes: string[] = [];
  const tool = createBillingRiskToolDefinition({ push: (route) => routes.push(route) });
  const originalAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = (callback) => {
    callback(0);
    return 0;
  };

  try {
    const output = await tool.execute(noCardFlyScenario) as Record<string, unknown>;

    assert.equal(output.availability, "requires-card");
    assert.equal(output.riskLevel, null);
    assert.equal(output.highUsageBill, null);
    assert.equal(routes.length, 1);
    assert.match(routes[0] ?? "", /^\/billing-risk\?/);
    assert.match(routes[0] ?? "", /provider=fly/);
    assert.match(routes[0] ?? "", /hasCard=false/);
  } finally {
    globalThis.requestAnimationFrame = originalAnimationFrame;
  }
});

test("the registered billing tool rejects malformed scenarios", async () => {
  const tool = createBillingRiskToolDefinition({ push: () => undefined });
  await assert.rejects(async () => {
    await tool.execute({ ...noCardFlyScenario, providerSlug: "unknown" });
  }, /providerSlug/);
});
