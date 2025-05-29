import { createSupabaseBrowserClient } from '@packages/lib/supabase/client';

export function useSupabase() {
  const supabase = createSupabaseBrowserClient();
  return { supabase };
} 