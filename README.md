# ShipCheap

Backend hosting without billing jumpscares.

ShipCheap helps developers compare backend hosting platforms and find safer, cheaper places to deploy backend apps. It includes a calculator, ranked recommendations, a comparison table, platform detail pages, beginner-focused guide pages, and saved comparison links.

## Features

- Hosting calculator for app type, budget, database, always-on needs, card availability, region, and billing risk tolerance
- Ranked platform results with reasons, warnings, pros, cons, and best-fit notes
- Comparison table for Render, Railway, Fly.io, Koyeb, Vercel, Supabase, Neon, and DigitalOcean App Platform
- Filters for free tier, no card, Docker support, database support, and low billing risk
- Platform detail pages and SEO-style guides for Node.js, FastAPI, and no-card hosting
- Cross-provider bill duel on the billing risk simulator (same workload, side-by-side P90 / blow-up ranking)
- Signed-in favorites with short “why I’m watching this” notes
- SQLite-backed saved comparison links with Prisma

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
- Deployment guide generator
- Decision report export and shareable comparison links
