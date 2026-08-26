# ShipCheap

Backend hosting without billing jumpscares.

ShipCheap helps developers compare backend hosting platforms and find safer, cheaper places to deploy backend apps. It includes a calculator, ranked recommendations, a comparison table, platform detail pages, beginner-focused guide pages, and saved comparison links.

## WebMCP Challenge extension

ShipCheap was meaningfully extended for the 2026 WebMCP Challenge after submissions opened on August 25, 2026. The new browser-agent layer lives in `src/components/WebMCPTools.tsx` and registers three imperative WebMCP tools with `document.modelContext.registerTool`:

- `recommend_backend_hosts` ranks providers from structured project constraints.
- `open_backend_host_comparison` opens the existing human-readable comparison with a provider highlighted.
- `preview_billing_risk` runs ShipCheap's deterministic 1,000-month risk model and opens the configured simulator so the person and agent share the same visible result.

The integration is progressive enhancement: ShipCheap remains fully usable when `document.modelContext` is unavailable. Tool inputs are constrained with JSON Schema and validated again at execution time. No tool creates infrastructure, spends money, or changes a hosting account.

To test, open the deployed app in ChatGPT's in-app browser or in Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled. Ask the agent to recommend a no-card host for a small backend, inspect one recommendation, then preview its billing risk.

## Features

- Hosting calculator for app type, budget, database, always-on needs, card availability, region, and billing risk tolerance
- Ranked platform results with reasons, warnings, pros, cons, and best-fit notes
- Comparison table for Render, Railway, Fly.io, Koyeb, Vercel, Supabase, Neon, and DigitalOcean App Platform
- Filters for free tier, no card, Docker support, database support, and low billing risk
- Platform detail pages and SEO-style guides for Node.js, FastAPI, and no-card hosting
- Cross-provider bill duel on the billing risk simulator (same workload, side-by-side P90 / blow-up ranking)
- Scenario packs that prefill common beginner hosting situations
- Provider launch checklists for pre-deploy traps
- Anonymous shareable comparison links (no account required)
- SQLite-backed share snapshots with Prisma

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- SQLite for local development
- pnpm

## Recommendation Scoring

The scoring function lives in `src/lib/recommend-platform.ts`.

- Supports selected app type: +30
- Fits selected budget: +25
- Has free tier when user wants free: +20
- Does not require credit card when user has no card: +20
- Supports selected database: +15
- Supports always-on when needed: +15
- Has preferred region: +10
- Billing risk matches tolerance: +15
- Low billing risk bonus for low-risk beginners: +10

## Pricing Disclaimer

All platform entries use starter data, verify before relying on it. Hosting prices, free tiers, card requirements, quotas, and billing rules change often.

## Run Locally

```bash
pnpm install
pnpm prisma:migrate
pnpm dev
```

Open `http://localhost:3000`.

## Future Improvements

- Live pricing updates
- Community platform submissions
- More providers
- Price change tracker
- GitHub bot for pricing data updates
- Decision report export
- Free-tier failure matrix
