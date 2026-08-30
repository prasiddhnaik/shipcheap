# WebMCP Decision Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn ShipCheap's homepage into a source-aware, human-approved hosting decision workspace shared by the user interface and seven WebMCP tools.

**Architecture:** Pure domain functions own workspace transitions, source confidence, provider ranking, simulations, and checklist state. A client provider persists a versioned local workspace and exposes actions to both the homepage and a thin WebMCP adapter, keeping every agent mutation visible and reversible.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Prisma 6.19.3, WebMCP imperative API, Node test runner through `tsx`, Playwright.

**Spec:** `docs/superpowers/specs/2026-08-26-webmcp-decision-workspace-design.md`

## Global Constraints

- Use `pnpm`; repair the broken local launcher with Corepack before package commands.
- Read the installed Next.js 16 client-component, layout, and route-handler documentation before editing those boundaries.
- Preserve the existing comparison, billing-risk, provider, saved, and launch-check routes.
- WebMCP is progressive enhancement; the manual experience must remain complete without `document.modelContext`.
- Agent mutations are local only. No tool may authenticate, deploy, create an account, transmit credentials, or spend money.
- Only official URLs from `platformSourceLinks` may be presented as provider evidence.
- Missing, stale, changed, blocked, or failed source records never count as verified.
- Do not modify `.env` or commit/stage changes unless the user separately requests it.
- Preserve the existing untracked `deep-research-report.md` and `webmcp-submission-kit.html` files.

---

### Task 1: Restore the package command and add the test harness

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: Node.js 26 and Corepack already installed on the workstation.
- Produces: working `pnpm` launcher and `pnpm test -- <path>` command backed by `tsx --test`.

- [ ] **Step 1: Repair the user-local pnpm shim without changing repository files**

Run:

```bash
corepack enable --install-directory <pnpm-bin-directory> pnpm
pnpm --version
```

Expected: `pnpm --version` exits 0 and prints a version.

Pin `"packageManager": "pnpm@10.17.1"` in `package.json` so Corepack uses the lockfile-compatible major and preserves the existing `pnpm.overrides` and `pnpm.onlyBuiltDependencies` behavior.

- [ ] **Step 2: Add the TypeScript test runner using pnpm**

Run:

```bash
pnpm add -D tsx
```

Expected: `tsx` appears under `devDependencies` and the lockfile records it.

- [ ] **Step 3: Add the test script**

Add this entry to `package.json` scripts:

```json
"test": "tsx --test"
```

- [ ] **Step 4: Verify the empty harness is callable**

Run:

```bash
pnpm exec tsx --version
```

Expected: the `tsx` version prints without package-manager errors.

### Task 2: Build the pure decision-workspace domain

**Files:**
- Create: `src/lib/decision-workspace.ts`
- Create: `src/lib/decision-workspace.test.ts`

**Interfaces:**
- Consumes: `CalculatorInput`, `RankedPlatform`, `SimulatorInput`, `BillSimulationResult`, `LaunchCheckItem`, `recommendPlatforms`, `simulateMonthlyBill`, `buildLaunchChecklist`.
- Produces: `DecisionWorkspaceState`, `DecisionWorkspaceAction`, `createDecisionWorkspace()`, `reduceDecisionWorkspace(state, action)`, `buildWorkspaceShortlist(state, confidenceBySlug)`, `compareWorkspaceBilling(state, input)`, and `createWorkspaceLaunchPlan(state)`.

- [ ] **Step 1: Write a failing test for requirements invalidation**

```ts
import assert from "node:assert/strict";
import test from "node:test";
import { createDecisionWorkspace, reduceDecisionWorkspace } from "./decision-workspace";

test("setting new requirements clears downstream decision state", () => {
  const current = {
    ...createDecisionWorkspace(),
    selectedProviderSlug: "koyeb",
    proposedProviderSlug: "koyeb",
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
  assert.equal(next.selectedProviderSlug, null);
  assert.equal(next.proposedProviderSlug, null);
  assert.equal(next.humanApproved, false);
  assert.equal(next.stage, "requirements");
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm test -- src/lib/decision-workspace.test.ts`

Expected: FAIL because `decision-workspace.ts` does not exist.

- [ ] **Step 3: Implement the state types, safe defaults, capped activity events, and requirements transition**

Use these exact stage and actor unions:

```ts
export type WorkspaceStage = "requirements" | "shortlist" | "billing" | "launch";
export type WorkspaceActor = "user" | "agent" | "system";
export type SourceConfidenceLevel = "verified" | "needs-review" | "unknown";
```

`requirements.set` must clear shortlist, simulations, proposal, checklist progress, uncertainty acceptance, and human approval.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `pnpm test -- src/lib/decision-workspace.test.ts`

Expected: PASS.

- [ ] **Step 5: Add failing tests for shortlist, billing comparison, proposal, checklist updates, and reset**

Cover these observable behaviors:

```ts
test("shortlist excludes providers that violate no-card and always-on hard constraints", () => {});
test("billing comparison accepts at most three known provider slugs", () => {});
test("agent proposal never sets human approval", () => {});
test("launch checks reject an item id outside the current provider plan", () => {});
test("activity history keeps only the newest 50 events", () => {});
test("reset restores a clean versioned workspace", () => {});
```

- [ ] **Step 6: Run the expanded test file and verify RED**

Run: `pnpm test -- src/lib/decision-workspace.test.ts`

Expected: FAIL on the first unimplemented transition.

- [ ] **Step 7: Implement the minimal pure operations**

Hard constraints are:

```ts
const violatesHardConstraint = (result: RankedPlatform, input: CalculatorInput) =>
  (!input.hasCard && result.platform.creditCardRequired) ||
  (input.alwaysOn && !result.platform.alwaysOn) ||
  !result.platform.supports.includes(input.appType) ||
  (input.database !== "none" && !result.platform.databases.includes(input.database));
```

Limit shortlist and billing inputs to three provider slugs, deduplicate slugs, and throw descriptive errors for unknown providers or checklist IDs.

- [ ] **Step 8: Run the domain tests and verify GREEN**

Run: `pnpm test -- src/lib/decision-workspace.test.ts`

Expected: all decision-workspace tests pass.

### Task 3: Add source-confidence reading and recommendation gating

**Files:**
- Create: `src/lib/source-confidence.ts`
- Create: `src/lib/source-confidence.test.ts`
- Create: `src/app/api/freshness/status/route.ts`

**Interfaces:**
- Consumes: Prisma `platformSourceCheck` rows and `platformSourceLinks` allowlist.
- Produces: `summarizeSourceConfidence(slug, requiredSources, checks, now)`, `GET /api/freshness/status?providers=koyeb,render`, and `Record<string, ProviderSourceConfidence>`.

- [ ] **Step 1: Write failing confidence tests**

```ts
test("returns verified only when every required source is current and fresh", () => {});
test("returns needs-review when a source changed or failed", () => {});
test("returns needs-review when the newest successful check is older than seven days", () => {});
test("returns unknown when no checks exist", () => {});
test("ignores URLs outside the platform source allowlist", () => {});
```

Use a fixed `now = new Date("2026-08-26T12:00:00Z")` and a seven-day freshness threshold.

- [ ] **Step 2: Run the confidence tests and verify RED**

Run: `pnpm test -- src/lib/source-confidence.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the pure confidence summarizer**

Return this public shape:

```ts
export type ProviderSourceConfidence = {
  platformSlug: string;
  level: "verified" | "needs-review" | "unknown";
  checkedAt: string | null;
  sources: Array<{
    label: string;
    url: string;
    status: "current" | "changed" | "failed" | "blocked" | "missing";
    checkedAt: string | null;
  }>;
};
```

- [ ] **Step 4: Run confidence tests and verify GREEN**

Run: `pnpm test -- src/lib/source-confidence.test.ts`

Expected: PASS.

- [ ] **Step 5: Add the read-only route handler**

The route must:

- accept a comma-separated `providers` query;
- reject more than three slugs with HTTP 400;
- reject unknown slugs with HTTP 400;
- query only matching `platformSourceCheck` rows;
- summarize against `getPlatformSourceLinks(slug)`;
- return `{ providers: Record<string, ProviderSourceConfidence> }`;
- never invoke `runPlatformSourceChecks()`.

- [ ] **Step 6: Verify route types and focused tests**

Run:

```bash
pnpm test -- src/lib/source-confidence.test.ts
pnpm exec tsc --noEmit
```

Expected: both exit 0.

### Task 4: Add versioned persistence and the shared React provider

**Files:**
- Create: `src/lib/decision-workspace-persistence.ts`
- Create: `src/lib/decision-workspace-persistence.test.ts`
- Create: `src/components/DecisionWorkspaceProvider.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `DecisionWorkspaceState`, `DecisionWorkspaceAction`, `createDecisionWorkspace()`, `reduceDecisionWorkspace()`.
- Produces: `serializeWorkspace(state)`, `parseWorkspace(raw)`, `useDecisionWorkspace()`, and provider actions used by UI and WebMCP.

- [ ] **Step 1: Read the installed Next.js boundary documentation**

Run:

```bash
sed -n '1,240p' node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
sed -n '1,220p' node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/layout.md
```

- [ ] **Step 2: Write failing persistence tests**

```ts
test("round-trips a valid version-one workspace", () => {});
test("rejects malformed JSON and returns a clean workspace", () => {});
test("rejects an unsupported persistence version", () => {});
test("removes activity text longer than the allowed bound", () => {});
```

- [ ] **Step 3: Run persistence tests and verify RED**

Run: `pnpm test -- src/lib/decision-workspace-persistence.test.ts`

Expected: FAIL because the persistence module does not exist.

- [ ] **Step 4: Implement strict version-one serialization and parsing**

Use key `shipcheap:decision-workspace:v1`. Validate enums, provider slugs, arrays, booleans, and string lengths at parse time; return `createDecisionWorkspace()` on any invalid payload.

- [ ] **Step 5: Run persistence tests and verify GREEN**

Run: `pnpm test -- src/lib/decision-workspace-persistence.test.ts`

Expected: PASS.

- [ ] **Step 6: Implement `DecisionWorkspaceProvider`**

Use `useReducer`, hydrate once after mount, persist after hydration, expose `{ state, dispatch }`, and throw a clear error when `useDecisionWorkspace()` is called outside the provider.

- [ ] **Step 7: Wrap the application without turning the root layout into a client component**

```tsx
<body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
  <DecisionWorkspaceProvider>
    <WebMCPTools />
    {children}
  </DecisionWorkspaceProvider>
</body>
```

- [ ] **Step 8: Verify focused tests and TypeScript**

Run:

```bash
pnpm test -- src/lib/decision-workspace-persistence.test.ts src/lib/decision-workspace.test.ts
pnpm exec tsc --noEmit
```

Expected: both exit 0.

### Task 5: Replace the three hidden tools with seven workspace tools

**Files:**
- Create: `src/lib/webmcp-tools.ts`
- Create: `src/lib/webmcp-tools.test.ts`
- Modify: `src/components/WebMCPTools.tsx`

**Interfaces:**
- Consumes: `DecisionWorkspaceState`, workspace dispatch/actions, `simulatorInput`, source-confidence fetcher.
- Produces: `createWorkspaceToolDefinitions(adapter): ToolDefinition[]` with the seven exact tool names from the spec.

- [ ] **Step 1: Write failing tool-contract tests**

```ts
test("registers exactly the seven documented tool names", () => {});
test("marks only workspace inspection and launch-plan retrieval read-only", () => {});
test("set_hosting_requirements rejects missing required fields before dispatch", async () => {});
test("propose_hosting_decision cannot set human approval", async () => {});
test("every mutation returns the next visible stage and an activity summary", async () => {});
```

The expected names are:

```ts
[
  "get_hosting_decision_workspace",
  "set_hosting_requirements",
  "build_hosting_shortlist",
  "compare_billing_risk",
  "propose_hosting_decision",
  "get_launch_plan",
  "update_launch_check",
]
```

- [ ] **Step 2: Run tool tests and verify RED**

Run: `pnpm test -- src/lib/webmcp-tools.test.ts`

Expected: FAIL because the factory does not exist.

- [ ] **Step 3: Implement the framework-independent tool factory**

The adapter exposes current state plus typed methods; schemas use `additionalProperties: false`, enums from canonical platform/type data, and required arrays. Outputs include `status`, `stage`, structured results, `sourceConfidence`, and `caveats` where relevant.

- [ ] **Step 4: Run tool tests and verify GREEN**

Run: `pnpm test -- src/lib/webmcp-tools.test.ts`

Expected: PASS.

- [ ] **Step 5: Make `WebMCPTools` a lifecycle adapter**

Use `useDecisionWorkspace()`, keep current state/actions in refs to avoid repeated registration, register definitions once per stable adapter, pass one `AbortController.signal`, and abort on unmount. Do not navigate as a substitute for updating workspace state.

- [ ] **Step 6: Verify tool tests and TypeScript**

Run:

```bash
pnpm test -- src/lib/webmcp-tools.test.ts
pnpm exec tsc --noEmit
```

Expected: both exit 0.

### Task 6: Build the primary visible decision workspace

**Files:**
- Create: `src/components/SourceConfidenceBadge.tsx`
- Create: `src/components/AgentActivityPanel.tsx`
- Create: `src/components/DecisionWorkspace.tsx`
- Modify: `src/components/DashboardHome.tsx`
- Modify: `src/app/globals.css` only if an existing utility cannot express a required state.

**Interfaces:**
- Consumes: `useDecisionWorkspace()`, canonical provider data, source-confidence endpoint, existing provider logos/badges, and pure workspace operations.
- Produces: the four-stage homepage experience demonstrated in the approved mockup.

- [ ] **Step 1: Add a failing Playwright smoke test for the new primary flow**

Create a temporary, uncommitted Playwright test under `tmp/qa/decision-workspace.spec.ts` that asserts:

```ts
await expect(page.getByRole("heading", { name: /pick, stress-test, and prepare/i })).toBeVisible();
await expect(page.getByText(/webmcp tools ready/i)).toBeVisible();
await page.getByRole("button", { name: /build shortlist/i }).click();
await expect(page.getByRole("heading", { name: /proposed winner/i })).toBeVisible();
await page.getByRole("button", { name: /stress-test/i }).click();
await expect(page.getByText(/scenario estimate/i)).toBeVisible();
```

- [ ] **Step 2: Run the browser test and verify RED**

Run the dev server and then:

```bash
pnpm exec playwright test tmp/qa/decision-workspace.spec.ts
```

Expected: FAIL because the approved workspace UI is absent.

- [ ] **Step 3: Implement the four-stage workspace using existing visual language**

Required visible elements:

- editable requirements and hard-constraint explanation;
- three-provider shortlist with score, reasons, warnings, and source badge;
- selected/proposed-provider distinction and explicit user override;
- three-provider deterministic Bill Duel summary;
- proposal rationale labeled as agent-proposed;
- provider-specific launch checklist;
- separate human approval control;
- reset control;
- capped agent activity panel and permanent local-only safety note.

Reuse the existing brutalist panel, button, provider-logo, and risk-badge patterns. Do not add gradients, decorative blobs, nested marketing cards, or authentication controls.

- [ ] **Step 4: Integrate the workspace as the dashboard's primary flow**

Replace the duplicated calculator/recommendations blocks in `DashboardHome` with `DecisionWorkspace`, while retaining useful navigation and detailed route links. Remove the duplicate database field currently rendered in the preferences grid.

- [ ] **Step 5: Run the browser test and verify GREEN**

Run: `pnpm exec playwright test tmp/qa/decision-workspace.spec.ts`

Expected: PASS.

- [ ] **Step 6: Verify desktop and mobile manually**

Check `1280x800` and `390x844`, all four stages, user overrides, checklist toggles, reset, no horizontal overlap, and no console errors.

### Task 7: Verify the full product and refresh challenge materials

**Files:**
- Modify: `README.md`
- Modify: `webmcp-submission-kit.html`
- Do not commit: `tmp/qa/decision-workspace.spec.ts`

**Interfaces:**
- Consumes: completed workspace and seven-tool contract.
- Produces: accurate repository instructions and a submission/demo script matching the shipped experience.

- [ ] **Step 1: Update challenge documentation**

Document all seven tools, the shared visible state, source-confidence gate, local-only mutations, human approval boundary, and the exact judge demo prompt sequence.

- [ ] **Step 2: Update the submission kit**

Revise the description and under-three-minute narration to demonstrate:

1. natural-language requirements;
2. visible shortlist creation;
3. source-confidence labels;
4. three-provider Bill Duel;
5. agent proposal versus human approval;
6. provider-specific launch checks.

- [ ] **Step 3: Refresh the graph and inspect blast radius**

Run:

```bash
code-review-graph update
code-review-graph impact --files src/lib/decision-workspace.ts src/lib/webmcp-tools.ts src/components/DecisionWorkspaceProvider.tsx src/components/DecisionWorkspace.tsx src/components/WebMCPTools.tsx src/components/DashboardHome.tsx src/app/layout.tsx
```

Expected: impacted flows are understood and no unrelated route is silently removed.

- [ ] **Step 4: Run the complete verification gate**

Run:

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm audit --audit-level moderate
```

Expected: tests, lint, types, and build exit 0. Report audit findings separately from application correctness.

- [ ] **Step 5: Run final browser verification**

Test the production build or deployed preview at desktop and mobile sizes. Execute every registered tool through a WebMCP-capable browser/inspector when available; otherwise verify registration and executions with the controlled test shim and label that boundary explicitly.

- [ ] **Step 6: Inspect final repository state**

Run:

```bash
git diff --check
git status --short
git diff --stat
```

Expected: only scoped implementation/docs changes plus the user's pre-existing untracked files and `.superpowers/` design artifacts.
