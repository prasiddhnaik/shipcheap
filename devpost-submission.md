# Title

ShipCheap

## One-line Summary

Backend hosting decisions without billing jumpscares—powered by WebMCP.

## Problem

Beginners choosing a backend host must reconcile runtime support, database needs, region availability, card requirements, sleeping services, free-tier limits, and surprise usage bills. Existing comparison pages force them to translate one real project into many disconnected filters and pricing tables.

## Solution

ShipCheap combines a complete human-facing comparison product with three WebMCP tools. A person describes the project once, the agent ranks suitable hosts and configures a deterministic billing-risk simulation, and the person reviews every result in the same visible interface before making the final decision.

## Why This Matters

Hosting mistakes create wasted time, failed deployments, and unexpected bills. ShipCheap makes those tradeoffs explicit for beginners while keeping account creation, billing, spending, and deployment outside agent authority.

## How We Used AI

The WebMCP integration lets an agent call `recommend_backend_hosts`, `open_backend_host_comparison`, and `preview_billing_risk` through constrained schemas. The tools reuse ShipCheap's canonical provider data, recommendation logic, and billing simulator rather than maintaining a separate agent-only model.

## How We Used Codex

Codex helped inspect the existing architecture, implement and test the WebMCP layer, expand provider coverage, verify the deployed tools in ChatGPT's in-app browser, diagnose package-manager issues, prepare the demo assets, and keep the public description aligned with verified behavior.

## Key Features

- Structured backend-host recommendations from runtime, budget, database, uptime, card access, region, and risk tolerance.
- Visible provider comparison with an agent-selected host highlighted.
- Deterministic 1,000-month billing-risk simulation with percentiles and budget-overrun probability.
- Provider-specific launch checks and billing-safety guidance.
- Progressive enhancement: the normal site still works without WebMCP.
- Explicit safety boundary: no tool can create an account, attach billing, spend money, or deploy infrastructure.

## Architecture

Next.js 16 App Router, React, TypeScript, Tailwind CSS, Prisma, SQLite, and Vercel. `src/components/WebMCPTools.tsx` registers three tools with `document.modelContext.registerTool`. Each tool uses strict JSON Schema, runtime validation, lifecycle cleanup, and concise structured results.

## Testing Instructions

1. Open https://shipcheap.vercel.app/ in ChatGPT's in-app browser or Chrome with WebMCP testing enabled.
2. Ask: “Recommend a free, no-card host in Asia for an always-on Node backend with Postgres and low billing risk.”
3. Ask the agent to open one recommendation for comparison.
4. Ask it to preview billing risk for 500 monthly users, 35 requests per user, a small database, budget alerts, and a $25 budget.
5. Confirm the visible provider, usage fields, and simulation result match the request.

## Public Demo Link

https://shipcheap.vercel.app/

## Public Repository Link

https://github.com/prasiddhnaik/shipcheap/tree/codex/newdesign

## Demo Video

TODO: Add the public narrated YouTube URL. The existing local 30-second render contains music but not spoken narration, so it is not yet the required final demo.

## Screenshot Shot List

1. Homepage with the WebMCP-enabled hosting-decision workflow.
2. Ranked recommendation results for the no-card Asia/Postgres prompt.
3. Provider comparison with the agent-selected host highlighted.
4. Billing-risk simulator showing percentiles and budget-overrun probability.
5. Source view of the three `registerTool` definitions.

## Submission Readiness Notes

- Devpost thumbnail received and uploaded: `submission-assets/devpost-thumbnail-final.png`.
- Live app verified in ChatGPT's in-app browser with all three tools registered.
- Public repository and MIT license verified.
- Core Devpost project fields are saved.
- Challenge-specific fields still need the participant's confirmed residence country before they can be saved truthfully.

## Known Limitations

- Provider pricing and free-tier rules change frequently and must be verified before a real deployment decision.
- The current entry exposes three WebMCP tools; the proposed seven-tool decision workspace is future work and is not claimed as shipped.
- A public narrated YouTube demo is still required.

## TODO Official Form Fields

- Confirm submitter type: recommended `Individual`.
- Confirm country of residence; do not infer eligibility data.
- Confirm learning level: recommended `Significant`.
- Confirm career AI value: recommended `Yes`.
- Add the public narrated YouTube URL.
