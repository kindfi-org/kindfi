#!/usr/bin/env bash
# Writes Supabase-generated TypeScript types atomically so a failed CLI run
# never truncates the committed database.types.ts file.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${ROOT_DIR}/src/database.types.ts"
TMP="$(mktemp)"

cleanup() {
	rm -f "$TMP"
}
trap cleanup EXIT

cd "$ROOT_DIR"

if [ "${1:-local}" = "local" ]; then
	supabase gen types typescript --local >"$TMP"
elif [ "${1:-}" = "remote" ]; then
	PROJECT_ID="${PROJECT_ID:-${SUPABASE_PROJECT_ID:-}}"
	if [ -z "$PROJECT_ID" ]; then
		echo "Error: PROJECT_ID or SUPABASE_PROJECT_ID is required for remote generation" >&2
		exit 1
	fi
	supabase gen types typescript --project-id "$PROJECT_ID" >"$TMP"
else
	echo "Usage: gen-types.sh [local|remote]" >&2
	exit 1
fi

if [ ! -s "$TMP" ]; then
	echo "Error: Supabase type generation produced an empty file; keeping ${DEST}" >&2
	exit 1
fi

mv "$TMP" "$DEST"
trap - EXIT
