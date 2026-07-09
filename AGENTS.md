<!-- BEGIN:nextjs-agent-rules -->
# This Is Not The Next.js You Remember

This project uses Next.js 16.2.6. APIs, routing conventions, middleware/proxy behavior, config shape, and file structure may differ from older Next.js versions and from model memory.

Before changing Next.js code, read the relevant local docs under `node_modules/next/dist/docs/`. Prefer the local installed docs over generic memory or stale web examples. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ShipCheap Agent Instructions

## Operating Defaults

- Always use `pnpm`, never `npm` or `npx`.
- Use `pnpm exec <tool>` for local binaries.
- Inspect the codebase before asking questions when the answer can be found locally.
- Keep edits scoped. Do not revert or overwrite unrelated worktree changes.
- Prefer the repo's existing patterns over introducing new abstractions.
- Use `rg` / `rg --files` for search.
- Use `apply_patch` for manual file edits.
- Avoid touching `.env`; update `.env.example` only when public configuration shape changes.

## Current Project Facts

- App: ShipCheap, a Next.js App Router application.
- Package manager: `pnpm`.
- Framework/runtime stack: Next.js `16.2.6`, React `19.2.4`, TypeScript, Tailwind CSS 4.
- Auth: none. The product is intentionally account-free; share links are anonymous.
- Data layer: Prisma `6.19.3`, local development database under `prisma/`.
- UI icons: `lucide-react` and `simple-icons`.
- Important existing security hygiene: `package.json` pins PostCSS through `pnpm.overrides`.
- Local Clerk skill files under `.agents/skills/` are historical reference only unless auth is reintroduced.

## Product Direction

- ShipCheap is focused on backend hosting decisions, not broad cloud management.
- Prioritize billing-risk modeling, no-card/free-tier safety, backend-specific recommendations, beginner guidance, saved comparisons, freshness checks, and provider-specific simulation.
- Keep research, copy, and new features anchored to the user job: helping someone choose and safely test where to host a backend.
- Avoid drifting into generic cloud comparison, DevOps dashboards, frontend hosting catalogs, or enterprise procurement workflows unless the user explicitly asks.

## Available Agent Capabilities

Use these capabilities when they are available in the current Codex session:

- Shell commands: inspect files, run project scripts, query Git, and start local servers from `/Users/prasiddhnaik/Documents/shipcheap`.
- File editing: use `apply_patch` for precise manual edits. Keep generated or mechanical rewrites scoped and explain them.
- Parallel reads: use parallel tool calls for independent `rg`, `sed`, `ls`, `git`, and file-inspection commands.
- Web lookup: use web search for current docs, security advisories, package behavior, pricing, or any fact likely to have changed. Prefer official/primary sources for technical claims.
- Local Browser / Playwright: open localhost routes, inspect UI, capture screenshots, check console errors, and verify desktop/mobile layout after frontend changes.
- Image handling: view local images when visual inspection is needed; generate or edit images only when the user asks for visual assets.
- Git: inspect status and diffs freely. Stage, commit, branch, push, or create PRs only when the user asks.
- Skills: use relevant Codex skills/plugins when explicitly requested or clearly applicable.
- Memory: use prior project memory when it can prevent repeated investigation, but verify drift-prone facts against the current repo before acting.
- Data/document/report tooling: when asked for reports or plans, create real standalone HTML files in the workspace instead of chat-only outlines.

If a requested capability is missing in a future run, say so plainly and use the closest safe fallback.

## Available Plugin Guidance

Use plugins when they are available in the current Codex session and match the task. Do not force a plugin when a direct repo inspection or local command is enough.

- Browser: use for localhost navigation, screenshots, console checks, and UI verification after frontend changes.
- Codex Security: use for security reviews, dependency audits, auth/data-access checks, and remediation validation.
- GitHub: use for issues, pull requests, CI checks, release notes, and repository publishing tasks.
- Vercel: use for deployment checks, Vercel docs, project configuration, and build/deploy troubleshooting.
- Supabase / Neon Postgres: use only if this project is connected to those services or the user asks for database platform work. This repo currently uses Prisma with a local development database.
- OpenAI Developers: use for OpenAI API, Agents SDK, ChatGPT app, or API-key related work.
- Auth plugins/skills: only if the user explicitly asks to reintroduce accounts.
- Data Analytics / Build Web Data Visualization: use for analytics reports, dashboards, charts, and source-backed data presentations.
- Documents: use for Word/Google Docs style artifacts when the user asks for document output.
- Computer Use: use only when desktop-app control is explicitly needed and the runtime is available.
- Image generation: use only when the user asks to create or edit visual assets.
- Game Studio, Build iOS Apps, Build macOS Apps, Cloudflare, Render, Twilio, Temporal, Hugging Face, Life Science Research, Alpaca, CodeRabbit, Plugin Eval, and Remotion: use only when the user explicitly asks for that domain or the task clearly requires it.

If a named plugin is unavailable, say that directly and continue with the best local fallback.

## Planning Behavior

- When the user asks for a plan, interview them one question at a time.
- For each planning question, include the recommended answer.
- Walk down dependent decisions in order instead of dumping a broad plan.
- If repo inspection can answer a planning question, inspect first and report the finding.
- When producing a plan report, create a simple standalone HTML file with inline responsive CSS. Do not use Markdown for plan reports.
- Keep plan reports plain and account-like: what is known, what decisions remain, what work will happen, what validation will prove it.
- Treat reports and research artifacts as local handoff files by default. Do not commit them unless the user explicitly asks.

## Implementation Standards

- For frontend work, build the actual usable screen or flow first, not a landing-page explanation.
- Match the existing app chrome, spacing, Tailwind usage, components, and interaction patterns.
- Use lucide icons inside icon buttons when an icon exists.
- Keep text inside buttons, cards, and panels responsive and non-overlapping.
- Do not add decorative gradient blobs, oversized marketing sections, or card-within-card layouts unless the existing design already requires them.
- For database work, update Prisma schema and migrations deliberately, then run the relevant Prisma validation/generation commands.
- For auth-sensitive behavior, make authorization decisions server-side. Client hooks are for UI state, not trust boundaries.
- For API routes and server actions, validate input shape, ownership, and size limits. Treat saved comparisons, feedback, freshness checks, and any Prisma writes as trust boundaries.
- Before changing `src/proxy.ts`, rewrites, or other Next.js request-boundary behavior, read the relevant local Next.js 16 docs under `node_modules/next/dist/docs/` and verify API behavior after the change.

## Verification Gates

Run the narrowest useful checks for the change, and report any skipped checks explicitly.

- General code changes:
  - `pnpm lint`
  - `pnpm build`
- Type or Next.js routing uncertainty:
  - `pnpm exec tsc --noEmit`
  - read the relevant `node_modules/next/dist/docs/` page before editing
- Prisma changes:
  - `pnpm prisma:generate`
  - `pnpm prisma:migrate` only when creating or applying a local dev migration is appropriate
- Dependency or security-sensitive changes:
  - `pnpm audit --audit-level moderate`
- Frontend changes:
  - start the app with `pnpm dev`
  - use the in-app Browser or Playwright to inspect the changed route
  - check desktop and mobile-sized viewports when layout is affected
- There is currently no committed `test` script in `package.json`. Do not claim automated test coverage unless a real test command or a specific Playwright/browser check was run and reported.

## Security Posture

- Never log secrets, tokens, cookies, database URLs, or private identifiers.
- Do not expose server-only environment variables through client components.
- Treat anonymous share links and Prisma writes as trust boundaries: validate payloads, rate-limit by IP, and avoid leaking unrelated records.
- Validate user-controlled slugs, IDs, form payloads, and JSON bodies before using them in Prisma calls.
- Prefer explicit allowlists and canonical data from `src/data/platforms.ts` when platform IDs, plans, or provider slugs are involved.
- If a security review is requested, inspect concrete trust boundaries and dependencies, then provide validation evidence. Do not present a generic review as an exhaustive scan.

## Git And Worktree Hygiene

- Before editing, check `git status --short`.
- Preserve user changes, especially in files already modified before the current task.
- Do not run destructive commands such as `git reset --hard` or `git checkout --` unless the user explicitly asks.
- If asked to commit or push, finish the whole workflow and report the exact files changed plus verification results.

## Useful Commands

```sh
pnpm install
pnpm dev
pnpm lint
pnpm build
pnpm exec tsc --noEmit
pnpm prisma:generate
pnpm prisma:migrate
pnpm audit --audit-level moderate
```
