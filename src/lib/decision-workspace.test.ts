import assert from "node:assert/strict";
import test from "node:test";
import { platforms } from "@/data/platforms";
import { defaultSimulatorInput } from "./billing-risk-simulation";
import type { WorkspaceBillingComparison } from "./decision-workspace";
import {
  buildWorkspaceShortlist,
  compareWorkspaceBilling,
  createDecisionWorkspace,
  createWorkspaceLaunchPlan,
  proposeWorkspaceDecision,
  reduceDecisionWorkspace,
  resetDecisionWorkspace,
  updateWorkspaceLaunchCheck,
} from "./decision-workspace";

test("setting new requirements clears downstream decision state", () => {
  const comparison: WorkspaceBillingComparison = {
    providerSlug: "koyeb",
    runs: 1000,
    level: "low",
    p50: 1,
    p90: 2,
    worst: 3,
    uncappedP90: 2,
    over25Probability: 0,
    over100Probability: 0,
    overBudgetProbability: 0,
    shockProbability: 0,
    budgetLimit: 25,
    sampleUsersP90: 500,
    sampleRequestsP90: 17_500,
    costCenters: [],
    headline: "Low modeled billing risk.",
    caveat: "Test fixture.",
  };
  const current = {
    ...createDecisionWorkspace(),
    shortlist: ["koyeb"],
    billingComparisons: { koyeb: comparison },
    selectedProviderSlug: "koyeb",
    proposedProviderSlug: "koyeb",
    proposalRationale: "Lowest downside in the current scenario.",
    launchCheckProgress: { "verify-pricing": true },
    acceptedUncertainty: { koyeb: true },
    humanApproved: true,
    stage: "launch" as const,
  };

  const next = reduceDecisionWorkspace(current, {
    type: "requirements.set",
    requirements: { ...current.requirements, appType: "fastapi" },
    actor: "agent",
    toolName: "set_hosting_requirements",
  });

  assert.equal(next.requirements.appType, "fastapi");
  assert.deepEqual(next.shortlist, []);
  assert.deepEqual(next.billingComparisons, {});
  assert.equal(next.selectedProviderSlug, null);
  assert.equal(next.proposedProviderSlug, null);
  assert.equal(next.proposalRationale, null);
  assert.deepEqual(next.launchCheckProgress, {});
  assert.deepEqual(next.acceptedUncertainty, {});
  assert.equal(next.humanApproved, false);
  assert.equal(next.stage, "requirements");
  assert.equal(next.activity.at(-1)?.toolName, "set_hosting_requirements");
});

test("shortlist excludes providers that violate no-card and always-on hard constraints", () => {
  const state = createDecisionWorkspace();
  const next = buildWorkspaceShortlist(state, {});

  assert.ok(next.shortlist.includes("koyeb"));
  assert.equal(next.shortlist.includes("railway"), false);
  assert.equal(next.shortlist.includes("vercel"), false);
  assert.ok(next.shortlist.length > 0 && next.shortlist.length <= 3);
  assert.ok(
    next.shortlist.every((slug) => {
      const provider = platforms.find((entry) => entry.slug === slug);
      return provider && !provider.creditCardRequired && provider.alwaysOn;
    }),
  );
  assert.equal(next.stage, "shortlist");
});

test("billing comparison deduplicates and accepts at most three known providers", () => {
  const state = { ...createDecisionWorkspace(), shortlist: ["koyeb", "render", "fly", "railway"] };
  const next = compareWorkspaceBilling(state, defaultSimulatorInput, ["koyeb", "render", "koyeb", "fly", "railway"]);

  assert.deepEqual(Object.keys(next.billingComparisons), ["koyeb", "render", "fly"]);
  assert.equal(next.billingComparisons.koyeb.runs, 1000);
  assert.equal(next.stage, "billing");
  assert.throws(
    () => compareWorkspaceBilling(state, defaultSimulatorInput, ["not-a-provider"]),
    /Unknown provider/,
  );
});

test("agent proposal never sets human approval", () => {
  const state = {
    ...createDecisionWorkspace(),
    shortlist: ["koyeb"],
    sourceConfidenceBySlug: { koyeb: "verified" as const },
  };
  const next = proposeWorkspaceDecision(state, "koyeb", "Best downside protection.", "agent", "propose_hosting_decision");

  assert.equal(next.proposedProviderSlug, "koyeb");
  assert.equal(next.selectedProviderSlug, "koyeb");
  assert.equal(next.humanApproved, false);
});

test("unverified provider proposal requires explicit uncertainty acceptance", () => {
  const state = {
    ...createDecisionWorkspace(),
    shortlist: ["render"],
    sourceConfidenceBySlug: { render: "needs-review" as const },
  };

  assert.throws(
    () => proposeWorkspaceDecision(state, "render", "Strong runtime fit.", "agent", "propose_hosting_decision"),
    /accept source uncertainty/i,
  );
});

test("launch checks reject an item id outside the current provider plan", () => {
  const state = { ...createDecisionWorkspace(), selectedProviderSlug: "koyeb" };
  const plan = createWorkspaceLaunchPlan(state);
  assert.ok(plan.some((item) => item.id === "verify-pricing"));
  assert.throws(
    () => updateWorkspaceLaunchCheck(state, "not-a-check", true, "agent", "update_launch_check"),
    /Unknown launch check/,
  );
});

test("activity history keeps only the newest 50 events", () => {
  let state = createDecisionWorkspace();
  for (let index = 0; index < 55; index += 1) {
    state = reduceDecisionWorkspace(state, {
      type: "requirements.set",
      requirements: { ...state.requirements, hasCard: index % 2 === 0 },
      actor: "user",
    });
  }
  assert.equal(state.activity.length, 50);
});

test("reset restores a clean versioned workspace", () => {
  const dirty = {
    ...createDecisionWorkspace(),
    selectedProviderSlug: "koyeb",
    humanApproved: true,
    stage: "launch" as const,
  };
  assert.deepEqual(resetDecisionWorkspace(), createDecisionWorkspace());
  assert.notDeepEqual(dirty, resetDecisionWorkspace());
});
