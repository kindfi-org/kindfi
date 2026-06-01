#!/bin/bash

# Script to generate TypeScript types from remote Supabase instance
# Usage: ./generate-types.sh [PROJECT_ID]

set -e

# Get PROJECT_ID from argument or environment variable
PROJECT_ID="${1:-${PROJECT_ID:-${SUPABASE_PROJECT_ID}}}"

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: PROJECT_ID is required"
  echo ""
  echo "Usage:"
  echo "  ./generate-types.sh <PROJECT_ID>"
  echo "  or"
  echo "  PROJECT_ID=<your-project-id> ./generate-types.sh"
  echo ""
  echo "To find your PROJECT_ID:"
  echo "  1. Go to https://supabase.com/dashboard"
  echo "  2. Select your project"
  echo "  3. Go to Settings > General"
  echo "  4. Copy the 'Reference ID' (this is your PROJECT_ID)"
  exit 1
fi

echo "🔵 Generating TypeScript types from remote Supabase project: $PROJECT_ID"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "❌ Error: Supabase CLI is not installed"
  echo "Install it with: npm install -g supabase"
  exit 1
fi

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
  echo "🔵 Not logged in to Supabase. Please login..."
  supabase login
fi

# Generate types
echo "🔵 Generating types..."
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
supabase gen types typescript --project-id "$PROJECT_ID" >"$TMP"

# Check if generation was successful
if [ $? -eq 0 ] && [ -s "$TMP" ]; then
	mv "$TMP" src/database.types.ts
	trap - EXIT
  echo "✅ Types generated successfully!"
  
  # Generate schemas
  echo "🔵 Generating Zod schemas..."
  bun run schemas
  
  if [ $? -eq 0 ]; then
    echo "✅ Schemas generated successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Review the generated types in src/database.types.ts"
    echo "  2. Commit the changes: git add src/database.types.ts src/database.schemas.ts"
    echo "  3. git commit -m 'chore: update Supabase types from remote'"
  else
    echo "⚠️  Types generated but schemas generation failed"
  fi
else
	echo "❌ Failed to generate types"
	rm -f "$TMP"
	exit 1
fi
