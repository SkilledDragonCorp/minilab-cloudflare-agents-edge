# minilab-cloudflare-agents-edge

**Built by SkilledDragon LLC — architecture-led software engineering · [skilleddragon.com](https://skilleddragon.com)**

Bun/TypeScript minilab: clone [cloudflare/agents](https://github.com/cloudflare/agents) at pin `b1e3614bb0ad`, run the upstream keyless CI commands from `.github/workflows/pullrequest.yml` verbatim, and ship a least-privilege edge-agent checklist skill for Claude Code / Cursor.

Story: long-horizon agent flows belong on the edge — Cloudflare Agents — not as a loose process on a laptop. This lab proves the upstream suite still builds at the pin and documents a deploy checklist.

## What we built

| Piece | Purpose |
| --- | --- |
| `scripts/clone-upstream.sh` | Full-history clone of `cloudflare/agents` into gitignored `vendor/agents` @ `b1e3614bb0ad` |
| `scripts/upstream-agents.sh` | Verbatim install/build/check/playwright/`nx affected -t test` from upstream PR CI |
| `src/policy.ts` + `src/cli.ts` | Bun checklist validator over `fixtures/edge-agent-policy.json` |
| `.claude/skills/edge-agent-policy/` | Least-privilege deploy checklist skill |
| CI | Jobs `lab`, `upstream`, `security` (gitleaks 8.30.1 + `bun audit`) |

## Featured upstream

- Repo: https://github.com/cloudflare/agents — MIT
- **Pin:** `main@b1e3614bb0ad`
- Keyless CI source: `.github/workflows/pullrequest.yml` + `.github/actions/install` at that pin

## Exact upstream commands

Inside `vendor/agents` @ `b1e3614bb0ad` (full history; `NX_BASE` / `NX_HEAD` set for `nx affected`):

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm run check
pnpm exec playwright install --with-deps chromium
CI=true pnpm exec nx affected -t test
```

## Setup

```bash
cp .env.example .env
bun install
bun run test
bun run typecheck
bun run check:skills
bun run check:banned-phrases
bun run validate:policy
```

Upstream cohort (Linux preferred — matches CI `ubuntu-24.04`; needs Node 24, pnpm 11.19.0 via corepack, network, Playwright):

```bash
bash scripts/upstream-agents.sh
```

## What we tested

| Check | Command | Result |
| --- | --- | --- |
| Lab unit tests | `bun run test` (`bun test ./tests`) | **pass** (6/6) |
| Typecheck | `bun run typecheck` | **pass** |
| Skills layout | `bun run check:skills` | **pass** |
| Banned soft phrases | `bun run check:banned-phrases` | **pass** |
| Policy fixture | `bun run validate:policy` | **pass** |
| Upstream install/build/check | `pnpm install --frozen-lockfile` + `pnpm run build` + `pnpm run check` @ `b1e3614bb0ad479b05be2e15909e4ccee6308f37` | **pass** locally |
| Upstream Playwright | `pnpm exec playwright install --with-deps chromium` | **pass** locally |
| Upstream nx affected | `CI=true pnpm exec nx affected -t test` | **pass** via CI job `upstream` on `ubuntu-24.04` (local Darwin workerd pool flakes under load: perf timeouts / `ECONNRESET`) |
| Secret scan | gitleaks `v8.30.1` | **pass** (lab tree; vendor gitignored) + CI `security` |
| Dependency audit | `bun audit --audit-level=high` | **pass** (0 vulns) |

## Tutorial

1. Copy `.env.example` → `.env` (keyless; optional `CLOUDFLARE_API_TOKEN` for live deploy only).
2. Run `bun run test` and `bun run validate:policy` to confirm the checklist fixture.
3. Run `bash scripts/upstream-agents.sh` on Linux (or rely on CI `upstream`) to prove the pin.
4. Before shipping an edge agent, open the skill and fill every allowlist key.

## Using these skills in Claude Code and Cursor

Skills live **only** under `.claude/skills/<name>/SKILL.md`. Do not create `.cursor/skills` or `.agents/skills` mirrors — CI fails if those paths exist.

- **Claude Code:** project skills under `.claude/skills/` load automatically for this repo.
- **Cursor:** point the agent at `.claude/skills/edge-agent-policy/SKILL.md` (same path; no duplicate tree).

Skill: **edge-agent-policy** — secrets from env, tool allowlist, egress allowlist, `noLocalLooseAgent: true`.

## API keys

| Variable | Required | Notes |
| --- | --- | --- |
| _(none)_ | — | Keyless CI |
| `DISABLE_TELEMETRY` | recommended | Set to `1` in `.env` |
| `DO_NOT_TRACK` | recommended | Set to `1` in `.env` |
| `CLOUDFLARE_API_TOKEN` | optional | Live Workers deploy outside CI only |

## License

MIT — see [LICENSE](./LICENSE). Upstream [cloudflare/agents](https://github.com/cloudflare/agents) is also MIT.
