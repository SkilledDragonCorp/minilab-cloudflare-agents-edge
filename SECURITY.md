# Security Policy

**Built by [SkilledDragon LLC](https://skilleddragon.com)**

This is a **SkilledDragon educational minilab**, not a production product. We do **not** maintain these repos on a regular schedule and we do **not** operate a vulnerability response program for them.

## Supported versions

Only the `main` branch of this repository is documented. There is no LTS track.

## Contact

General questions: **hello@skilleddragon.com**  
Do not use a dedicated security mailbox for this repo — none exists.

## If you find an issue

- Prefer reporting **upstream** when the issue is in [cloudflare/agents](https://github.com/cloudflare/agents) (MIT).
- For something specific to this minilab’s policy validator, skill, or CI, you may email hello@skilleddragon.com. There is **no SLA**, and we may not patch or reply quickly.
- Do not expect private coordinated disclosure or paid bounty handling here.

## Secret-handling policy

- Never commit `.env`, API keys, PEM/key material, or SSH private keys.
- Secrets come from environment variables only. This lab requires **no API keys** for CI; `CLOUDFLARE_API_TOKEN` is optional for live Workers deploy outside CI.
- Local `.env` is gitignored. Copy from `.env.example` and set `DISABLE_TELEMETRY=1` and `DO_NOT_TRACK=1`.

## Hygiene tooling

| Control | Pin / command |
| --- | --- |
| gitleaks | `v8.30.1` (`.pre-commit-config.yaml` + CI `security` job downloads the same release binary and verifies SHA256 `551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb` for `gitleaks_8.30.1_linux_x64.tar.gz`, then runs `gitleaks git --redact --verbose --config .gitleaks.toml .`) |
| Dependency audit | `bun audit --audit-level=high` |
| Upstream pin | `cloudflare/agents` @ `b1e3614bb0ad` (MIT), cloned into gitignored `vendor/agents` |

Use at your own risk. Pin versions, review the code, and treat this as sample material.
