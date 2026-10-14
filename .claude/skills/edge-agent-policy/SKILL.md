---
name: edge-agent-policy
description: >-
  Enforce a least-privilege Cloudflare Agents deploy checklist before shipping
  long-horizon edge agents: secrets from env, tool allowlist, egress allowlist,
  and no laptop-loose agent.
---

# Edge agent policy

Use this skill when deploying or reviewing a **Cloudflare Agents** worker that
runs long-horizon flows on the edge instead of a laptop.

## Checklist (required)

1. **Secrets from env** — every credential is read from environment variables
   validated at startup. Never commit tokens. Optional live deploy token name:
   `CLOUDFLARE_API_TOKEN` (documented in `.env.example`; never required for CI).

2. **Tool allowlist** — list every tool the agent may call. Reject undeclared
   tools at the policy boundary. Keep the list in
   `fixtures/edge-agent-policy.json` under `toolAllowlist`.

3. **Egress allowlist** — list every hostname the agent may reach. Block the
   rest. Keep the list under `egressAllowlist`.

4. **No laptop-loose agent** — `noLocalLooseAgent` must be `true`. Long-horizon
   Argon-style flows belong on Cloudflare Agents at the edge, not as an
   unconstrained local process.

## Validate

From the minilab root:

```bash
DISABLE_TELEMETRY=1 DO_NOT_TRACK=1 bun run validate:policy
```

Exit `0` only when all four keys are present and non-empty (`noLocalLooseAgent`
must be boolean `true`).

## Upstream pin

Featured repo: [cloudflare/agents](https://github.com/cloudflare/agents) @
`b1e3614bb0ad`. Prove the pin with:

```bash
bash scripts/upstream-agents.sh
```
