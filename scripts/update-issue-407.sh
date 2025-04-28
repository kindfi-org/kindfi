#!/usr/bin/env bash
# shellcheck shell=bash
set -euo pipefail

REPO="kindfi-org/kindfi"
ISSUE_NUMBER=407

# Fetch the current issue body
current_body=$(gh issue view "$ISSUE_NUMBER" --repo "$REPO" --json body --jq .body)

# Define the update to append
update_section=$(cat << 'EOF'

---

## Server-side Supabase Utilities (package/lib)

These are global utility functions intended for Next.js Server Components  
and any server-level data-fetch use cases **without** DrizzleORM (admin actions).

```ts
// packages/lib/src/supabase-query.ts
import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

type ServerQueryFn<TData> = (client: SupabaseClient) => Promise<TData>;

export const fetchSupabaseServer = cache(async <TData>(
  queryName: string,
  queryFn: ServerQueryFn<TData>
): Promise<TData> => {
  const supabase = createServerComponentClient({ cookies });
  try {
    return await queryFn(supabase);
  } catch (error) {
    console.error(\`Error in server query \${queryName}:\`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
});

export async function prefetchSupabaseQuery<TData>(
  queryClient: QueryClient,
  queryName: string,
  queryFn: ServerQueryFn<TData>,
  additionalKeyValues?: unknown[]
): Promise<void> {
  const baseKey = ['supabase', queryName];
  const queryKey = additionalKeyValues?.length ? [...baseKey, ...additionalKeyValues] : baseKey;
  const supabase = createServerComponentClient({ cookies });
  await queryClient.prefetchQuery({
    queryKey,
    queryFn: () => queryFn(supabase),
  });
}
EOF
)

# Update the issue with appended section
gh issue edit "$ISSUE_NUMBER" --repo "$REPO" --body "$current_body$update_section"