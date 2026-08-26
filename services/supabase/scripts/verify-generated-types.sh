#!/usr/bin/env bash
# Fails when generated Supabase artifacts are missing or empty.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TYPES_FILE="${ROOT_DIR}/src/database.types.ts"
SCHEMAS_FILE="${ROOT_DIR}/src/database.schemas.ts"

for file in "$TYPES_FILE" "$SCHEMAS_FILE"; do
	if [ ! -s "$file" ]; then
		echo "Error: ${file} is missing or empty. Regenerate with: cd services/supabase && bun run gen" >&2
		exit 1
	fi
done

if ! grep -q 'export type Database' "$TYPES_FILE"; then
	echo "Error: ${TYPES_FILE} does not export Database. Regenerate with: cd services/supabase && bun run gen" >&2
	exit 1
fi
