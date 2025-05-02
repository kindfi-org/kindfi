import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createMockClient } from './mock';

export * from "./database.schemas";
export * from "./database.types";

export const createClient = () => {
  // Use mock client in development, without credentials
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Using mock Supabase client as no credentials provided');
    return createMockClient();
  }

  return createSupabaseClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    }
  );
};
