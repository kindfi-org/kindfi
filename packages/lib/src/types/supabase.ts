import type { Database as SupabaseDatabase } from '@supabase/supabase-js';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database extends SupabaseDatabase {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: string;
          type: string;
          message: string;
          from: string | null;
          to: string;
          metadata: Json;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          message: string;
          from?: string | null;
          to: string;
          metadata?: Json;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          type?: string;
          message?: string;
          from?: string | null;
          to?: string;
          metadata?: Json;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      mark_notifications_as_read: {
        Args: {
          p_notification_ids: string[];
        };
        Returns: undefined;
      };
      create_notification: {
        Args: {
          p_type: string;
          p_message: string;
          p_from: string | null;
          p_to: string;
          p_metadata?: Json;
        };
        Returns: string;
      };
    };
  };
} 