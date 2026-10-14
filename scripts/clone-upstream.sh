#!/usr/bin/env bash
# Clone cloudflare/agents at pin b1e3614bb0ad into vendor/agents with full history
# (fetch-depth: 0). nx affected needs NX_BASE/NX_HEAD over real ancestry.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIN="b1e3614bb0ad"
DEST="$ROOT/vendor/agents"
REPO="https://github.com/cloudflare/agents.git"

export DISABLE_TELEMETRY="${DISABLE_TELEMETRY:-1}"
export DO_NOT_TRACK="${DO_NOT_TRACK:-1}"

if [[ -x /usr/local/Cellar/git/2.39.0/bin/git ]]; then
  export PATH="/usr/local/Cellar/git/2.39.0/bin:$PATH"
elif [[ -x /usr/local/opt/git/bin/git ]]; then
  export PATH="/usr/local/opt/git/bin:$PATH"
elif [[ -x /opt/homebrew/opt/git/bin/git ]]; then
  export PATH="/opt/homebrew/opt/git/bin:$PATH"
fi

mkdir -p "$ROOT/vendor"

if [[ -d "$DEST/.git" ]]; then
  git -C "$DEST" fetch origin
  git -C "$DEST" checkout --force "$PIN"
else
  rm -rf "$DEST"
  # Full history — matches upstream pullrequest.yml fetch-depth: 0
  git clone "$REPO" "$DEST"
  git -C "$DEST" checkout "$PIN"
fi

RESOLVED="$(git -C "$DEST" rev-parse "$PIN")"
HEAD="$(git -C "$DEST" rev-parse HEAD)"
if [[ "$HEAD" != "$RESOLVED" ]]; then
  echo "vendor pin mismatch: expected $RESOLVED ($PIN) got $HEAD" >&2
  exit 1
fi

echo "vendor/agents @ $HEAD (pin $PIN)"
