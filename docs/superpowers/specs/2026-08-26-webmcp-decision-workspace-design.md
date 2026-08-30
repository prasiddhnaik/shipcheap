# WebMCP Decision Workspace Design

Date: 2026-08-26

## Objective

Make WebMCP the central ShipCheap product experience: a person describes a backend-hosting need once, an agent performs the comparison and risk-analysis legwork, and both work from the same visible, editable decision state. The agent may update local decision data but cannot create provider accounts, deploy infrastructure, use credentials, or spend money.

## Selected Approach

Use one client-side decision workspace embedded in the primary dashboard. A shared provider owns requirements, shortlist, billing comparison, proposed decision, rationale, source-confidence state, checklist progress, and an activity trail. Human controls and WebMCP tools call the same pure domain operations, so agent actions immediately appear in the interface.

Two alternatives were rejected:

- Keeping global tools hidden preserves the current UI but makes WebMCP look bolted on and leaves little visible human-agent collaboration.
- Building an autonomous deployment agent would be more dramatic but introduces credentials, external mutations, financial risk, and a much larger verification burden.

## User Experience

The homepage becomes a four-stage workspace:

1. **Frame the need:** The user or agent fills app type, budget, database, availability, card access, region, and billing-risk tolerance. Every field remains editable.
2. **Build the shortlist:** ShipCheap ranks providers after applying hard constraints. The agent can propose a winner; the user can override it.
3. **Stress-test bills:** Bill Duel compares the top candidates using the existing deterministic simulation and explains the first likely cost pressure for each.
4. **Approve the launch plan:** ShipCheap generates provider-specific checks. The agent can mark locally completed research steps, but the user must explicitly approve the final decision.

An activity panel shows every WebMCP call, its plain-language effect, and whether it read or changed local state. The interface always displays the safety boundary.

Provider results also show MCP capability when an official source verifies it. ShipCheap distinguishes an official remote provider-control MCP, an official local MCP, and the ability to host an MCP workload. These labels never imply that connecting an MCP is risk-free: the UI includes the connection mode, supported actions, official documentation, and a provider-specific caution.

## State Model

`DecisionWorkspaceState` contains:

- normalized `CalculatorInput` requirements;
- current stage and whether requirements were confirmed;
- ranked shortlist and selected provider slug;
- per-provider billing simulation summaries;
- agent-proposed provider and rationale;
- source-confidence summaries for shortlisted providers;
- provider-specific checklist items and completion state;
- explicit human approval state;
- bounded activity events containing timestamp, actor, tool name, summary, and result status.

State is persisted in versioned `localStorage` and can be reset. No secret, account identifier, or provider credential is stored. Invalid or obsolete persisted data falls back to a safe default.

Pure functions in `src/lib/decision-workspace.ts` own normalization, transitions, shortlist derivation, simulations, checklist generation, source-confidence rules, and event creation. UI and WebMCP adapters consume those functions rather than duplicating business logic.

## WebMCP Tool Surface

Seven imperative tools are registered through `document.modelContext.registerTool`:

1. `get_hosting_decision_workspace` — return the current requirements, shortlist, decision, source confidence, checklist progress, and approval status. Read-only.
2. `set_hosting_requirements` — validate and apply hosting requirements to visible local state; clears downstream results that no longer match.
3. `build_hosting_shortlist` — rank eligible providers, update the visible shortlist, and return reasons, warnings, and source confidence.
4. `compare_billing_risk` — run the existing deterministic billing simulation across up to three selected providers and show the results in Bill Duel.
5. `propose_hosting_decision` — record a provider and concise rationale as an agent proposal. It does not count as human approval.
6. `get_launch_plan` — generate and return the current provider-specific checklist. Read-only.
7. `update_launch_check` — mark a checklist item locally complete or incomplete and make the change visible.

Every mutating tool uses strict JSON Schema plus runtime validation. It emits an activity event and moves the visible workspace to the affected stage. Tools return structured data with explicit caveats instead of relying on DOM text.

## Source Confidence

Official URLs in `platformSourceLinks` remain the source allowlist. A provider's confidence summary is computed from persisted `PlatformSourceCheck` records:

- `verified`: required sources checked successfully and have not changed;
- `needs-review`: a source changed, is missing, is blocked, failed, or is older than the freshness threshold;
- `unknown`: no persisted check exists.

Only `verified` providers may be presented as a confident final recommendation. Other providers remain visible as alternatives with the official source link, last-check time when available, and a clear uncertainty label. A user may explicitly accept the uncertainty to select one, but the application records that acceptance and never describes it as verified.

The public experience reads existing source-check records through a new read-only endpoint. It never triggers the protected crawler or performs arbitrary URL fetching.

## Component Boundaries

- `DecisionWorkspaceProvider`: owns client state, versioned persistence, and dispatch.
- `DecisionWorkspace`: renders the four-stage primary flow.
- `AgentActivityPanel`: renders bounded, human-readable WebMCP activity.
- `SourceConfidenceBadge`: renders verified, review-needed, or unknown source state and source links.
- `WebMCPTools`: becomes a thin adapter from validated tool inputs to workspace actions.
- Existing `recommendPlatforms`, `simulateMonthlyBill`, and `buildLaunchChecklist` remain canonical domain functions.

The provider wraps the application in `src/app/layout.tsx` so tools remain registered across navigation. The homepage consumes the same state and renders the full workflow. Existing comparison, billing-risk, provider, and launch-check routes remain available as detailed views.

## Error Handling and Safety

- Invalid tool input returns an actionable validation error and does not mutate state.
- Unsupported WebMCP browsers retain the complete manual UI.
- Registration failures are logged without crashing the page.
- Missing freshness data produces `unknown`, never a fabricated verified state.
- Changed or failed sources prevent confident agent selection until the user accepts uncertainty.
- Local storage parse/version failures reset only the workspace state.
- Activity history is capped to prevent unbounded storage growth.
- No tool performs network writes, authentication, deployment, account creation, or payment actions.

## Test Strategy

Implementation follows red-green-refactor with Node's built-in test runner through a new `pnpm test` script:

- pure state-transition tests for setting requirements and clearing stale downstream state;
- ranking tests for hard constraints and source-confidence gates;
- simulation-comparison tests for deterministic output and provider limits;
- checklist tests for valid IDs and local completion updates;
- persistence migration/fallback tests;
- WebMCP adapter tests using a small fake `document.modelContext` and real domain operations;
- browser verification for the four stages, activity updates, manual overrides, reset, responsive layout, and graceful behavior without WebMCP.

Final verification requires `pnpm test`, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, a refreshed code-review graph, and desktop/mobile browser checks with no console errors.

## Scope Boundary

This build does not implement the previously discussed model selector, provider account integrations, one-click deployment, authentication, cloud credentials, payments, or background autonomous actions. Those remain separate future work so the challenge experience stays coherent and safe.

## Success Criteria

- A judge can ask an agent to take a natural-language backend requirement from empty workspace to a visible proposed decision and launch plan.
- Every agent mutation is immediately visible and reversible by the user.
- The user—not the agent—owns final approval.
- A stale or unknown provider source cannot be described as a verified confident recommendation.
- The workflow remains fully usable without WebMCP.
- The demo can be shown clearly in under three minutes.
