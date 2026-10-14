#!/usr/bin/env bash
# Verbatim upstream CI from cloudflare/agents .github/workflows/pullrequest.yml
# + .github/actions/install at pin b1e3614bb0ad.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIN="b1e3614bb0ad"
VENDOR="$ROOT/vendor/agents"

export DISABLE_TELEMETRY="${DISABLE_TELEMETRY:-1}"
export DO_NOT_TRACK="${DO_NOT_TRACK:-1}"
# Match upstream pullrequest.yml env
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="${PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD:-1}"
export NX_PARALLEL="${NX_PARALLEL:-2}"
export CI="${CI:-true}"

if [[ -x /usr/local/Cellar/git/2.39.0/bin/git ]]; then
  export PATH="/usr/local/Cellar/git/2.39.0/bin:$PATH"
elif [[ -x /usr/local/opt/git/bin/git ]]; then
  export PATH="/usr/local/opt/git/bin:$PATH"
elif [[ -x /opt/homebrew/opt/git/bin/git ]]; then
  export PATH="/opt/homebrew/opt/git/bin:$PATH"
fi

bash "$ROOT/scripts/clone-upstream.sh"

RESOLVED="$(git -C "$VENDOR" rev-parse "$PIN")"
HEAD="$(git -C "$VENDOR" rev-parse HEAD)"
if [[ "$HEAD" != "$RESOLVED" ]]; then
  echo "upstream pin mismatch: expected $RESOLVED ($PIN) got $HEAD" >&2
  exit 1
fi

cd "$VENDOR"

# packageManager from upstream package.json at the pin
if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@11.19.0 --activate
fi

# From .github/actions/install at b1e3614bb0ad
pnpm install --frozen-lockfile

# From .github/workflows/pullrequest.yml at b1e3614bb0ad
pnpm run build
pnpm run check
pnpm exec playwright install --with-deps chromium

# after nx-set-shas (or export NX_BASE / NX_HEAD for the PR base):
# Lab equivalent of nrwl/nx-set-shas@v5 outside an agents PR (push fallback
# when last-successful SHA is unavailable): BASE = HEAD~1, HEAD = pin.
# Override NX_BASE/NX_HEAD in the environment to widen or narrow the range.
# Full-history clone is required so git can resolve the ancestry.
if [[ -z "${NX_BASE:-}" ]]; then
  export NX_BASE="$(git rev-parse HEAD~1)"
fi
if [[ -z "${NX_HEAD:-}" ]]; then
  export NX_HEAD="$(git rev-parse HEAD)"
fi
echo "NX_BASE=$NX_BASE"
echo "NX_HEAD=$NX_HEAD"

CI=true pnpm exec nx affected -t test

echo "upstream-agents.sh OK @ $HEAD"
