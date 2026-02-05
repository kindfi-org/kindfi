export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          color: string
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          color?: string
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenge: string
          created_at: string
          expires_at: string
          id: string
          identifier: string
          next_auth_user_id: string | null
          rp_id: string
          user_id: string | null
        }
        Insert: {
          challenge: string
          created_at?: string
          expires_at?: string
          id?: string
          identifier: string
          next_auth_user_id?: string | null
          rp_id: string
          user_id?: string | null
        }
        Update: {
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          next_auth_user_id?: string | null
          rp_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          metadata: Json
          parent_comment_id: string | null
          project_id: string | null
          project_update_id: string | null
          type: Database["public"]["Enums"]["comment_type"]
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json
          parent_comment_id?: string | null
          project_id?: string | null
          project_update_id?: string | null
          type?: Database["public"]["Enums"]["comment_type"]
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json
          parent_comment_id?: string | null
          project_id?: string | null
          project_update_id?: string | null
          type?: Database["public"]["Enums"]["comment_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_update_id_fkey"
            columns: ["project_update_id"]
            isOneToOne: false
            referencedRelation: "project_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      community: {
        Row: {
          comment_id: string
          created_at: string | null
          id: string
          project_id: string
          update_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string | null
          id?: string
          project_id: string
          update_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string | null
          id?: string
          project_id?: string
          update_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "project_updates"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          amount: number
          contributor_id: string
          created_at: string | null
          id: string
          project_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          contributor_id: string
          created_at?: string | null
          id?: string
          project_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          contributor_id?: string
          created_at?: string | null
          id?: string
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      devices: {
        Row: {
          aaguid: string
          address: string
          backup_state: Database["public"]["Enums"]["backup_state"]
          created_at: string
          credential_id: string
          credential_type: Database["public"]["Enums"]["credential_type"]
          device_name: string | null
          device_type: Database["public"]["Enums"]["device_type"]
          id: string
          identifier: string
          last_used_at: string | null
          next_auth_user_id: string | null
          profile_verification_status: Database["public"]["Enums"]["profile_verification_status"]
          public_key: string
          rp_id: string
          sign_count: number
          transports: string[]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aaguid?: string
          address?: string
          backup_state?: Database["public"]["Enums"]["backup_state"]
          created_at?: string
          credential_id: string
          credential_type?: Database["public"]["Enums"]["credential_type"]
          device_name?: string | null
          device_type?: Database["public"]["Enums"]["device_type"]
          id?: string
          identifier: string
          last_used_at?: string | null
          next_auth_user_id?: string | null
          profile_verification_status?: Database["public"]["Enums"]["profile_verification_status"]
          public_key: string
          rp_id: string
          sign_count?: number
          transports?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aaguid?: string
          address?: string
          backup_state?: Database["public"]["Enums"]["backup_state"]
          created_at?: string
          credential_id?: string
          credential_type?: Database["public"]["Enums"]["credential_type"]
          device_name?: string | null
          device_type?: Database["public"]["Enums"]["device_type"]
          id?: string
          identifier?: string
          last_used_at?: string | null
          next_auth_user_id?: string | null
          profile_verification_status?: Database["public"]["Enums"]["profile_verification_status"]
          public_key?: string
          rp_id?: string
          sign_count?: number
          transports?: string[]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      escrow_contracts: {
        Row: {
          amount: number
          completed_at: string | null
          contract_id: string
          contribution_id: string
          created_at: string | null
          current_state: Database["public"]["Enums"]["escrow_status_type"]
          engagement_id: string
          id: string
          metadata: Json | null
          payer_address: string
          platform_fee: number
          project_id: string
          receiver_address: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          contract_id: string
          contribution_id: string
          created_at?: string | null
          current_state?: Database["public"]["Enums"]["escrow_status_type"]
          engagement_id: string
          id?: string
          metadata?: Json | null
          payer_address: string
          platform_fee: number
          project_id: string
          receiver_address: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          contract_id?: string
          contribution_id?: string
          created_at?: string | null
          current_state?: Database["public"]["Enums"]["escrow_status_type"]
          engagement_id?: string
          id?: string
          metadata?: Json | null
          payer_address?: string
          platform_fee?: number
          project_id?: string
          receiver_address?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_contracts_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_milestones: {
        Row: {
          created_at: string
          escrow_id: string
          milestone_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escrow_id: string
          milestone_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escrow_id?: string
          milestone_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_milestones_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_reviews: {
        Row: {
          created_at: string | null
          disputer_id: string | null
          escrow_id: string
          evidence_urls: string[] | null
          id: string
          milestone_id: string | null
          resolution_text: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewer_address: string
          status: string
          transaction_hash: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          disputer_id?: string | null
          escrow_id: string
          evidence_urls?: string[] | null
          id?: string
          milestone_id?: string | null
          resolution_text?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_address: string
          status?: string
          transaction_hash?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          disputer_id?: string | null
          escrow_id?: string
          evidence_urls?: string[] | null
          id?: string
          milestone_id?: string | null
          resolution_text?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewer_address?: string
          status?: string
          transaction_hash?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_reviews_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_reviews_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_status: {
        Row: {
          current_milestone: number | null
          escrow_id: string
          id: string
          last_updated: string | null
          metadata: Json | null
          status: Database["public"]["Enums"]["escrow_status_type"]
          total_funded: number | null
          total_released: number | null
        }
        Insert: {
          current_milestone?: number | null
          escrow_id: string
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          status: Database["public"]["Enums"]["escrow_status_type"]
          total_funded?: number | null
          total_released?: number | null
        }
        Update: {
          current_milestone?: number | null
          escrow_id?: string
          id?: string
          last_updated?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["escrow_status_type"]
          total_funded?: number | null
          total_released?: number | null
        }
        Relationships: []
      }
      foundation_escrows: {
        Row: {
          created_at: string
          escrow_id: string
          foundation_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escrow_id: string
          foundation_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escrow_id?: string
          foundation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "foundation_escrows_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: false
            referencedRelation: "escrow_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "foundation_escrows_foundation_id_fkey"
            columns: ["foundation_id"]
            isOneToOne: false
            referencedRelation: "foundations"
            referencedColumns: ["id"]
          },
        ]
      }
      foundation_milestones: {
        Row: {
          achieved_date: string
          created_at: string
          description: string | null
          foundation_id: string
          id: string
          impact_metric: string | null
          metadata: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          achieved_date: string
          created_at?: string
          description?: string | null
          foundation_id: string
          id?: string
          impact_metric?: string | null
          metadata?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          achieved_date?: string
          created_at?: string
          description?: string | null
          foundation_id?: string
          id?: string
          impact_metric?: string | null
          metadata?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "foundation_milestones_foundation_id_fkey"
            columns: ["foundation_id"]
            isOneToOne: false
            referencedRelation: "foundations"
            referencedColumns: ["id"]
          },
        ]
      }
      foundations: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string
          founded_year: number
          founder_id: string
          id: string
          logo_url: string | null
          metadata: Json
          mission: string | null
          name: string
          slug: string
          social_links: Json
          total_campaigns_completed: number
          total_campaigns_open: number
          total_donations_received: number
          updated_at: string
          vision: string | null
          website_url: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description: string
          founded_year: number
          founder_id: string
          id?: string
          logo_url?: string | null
          metadata?: Json
          mission?: string | null
          name: string
          slug: string
          social_links?: Json
          total_campaigns_completed?: number
          total_campaigns_open?: number
          total_donations_received?: number
          updated_at?: string
          vision?: string | null
          website_url?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string
          founded_year?: number
          founder_id?: string
          id?: string
          logo_url?: string | null
          metadata?: Json
          mission?: string | null
          name?: string
          slug?: string
          social_links?: Json
          total_campaigns_completed?: number
          total_campaigns_open?: number
          total_donations_received?: number
          updated_at?: string
          vision?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      kyc_admin_whitelist: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kyc_reviews: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          reviewer_id: string | null
          status: Database["public"]["Enums"]["kyc_status_enum"]
          updated_at: string
          user_id: string
          verification_level: Database["public"]["Enums"]["kyc_verification_enum"]
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          reviewer_id?: string | null
          status: Database["public"]["Enums"]["kyc_status_enum"]
          updated_at?: string
          user_id: string
          verification_level: Database["public"]["Enums"]["kyc_verification_enum"]
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          reviewer_id?: string | null
          status?: Database["public"]["Enums"]["kyc_status_enum"]
          updated_at?: string
          user_id?: string
          verification_level?: Database["public"]["Enums"]["kyc_verification_enum"]
        }
        Relationships: []
      }
      milestones: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          deadline: string
          description: string | null
          id: string
          order_index: number
          project_id: string
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          deadline: string
          description?: string | null
          id?: string
          order_index: number
          project_id: string
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          deadline?: string
          description?: string | null
          id?: string
          order_index?: number
          project_id?: string
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          email: boolean | null
          in_app: boolean | null
          push: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: boolean | null
          in_app?: boolean | null
          push?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: boolean | null
          in_app?: boolean | null
          push?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          delivery_attempts: number | null
          delivery_status:
            | Database["public"]["Enums"]["notification_delivery_status"]
            | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          metadata: Json | null
          next_retry_at: string | null
          priority: Database["public"]["Enums"]["notification_priority"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          delivery_attempts?: number | null
          delivery_status?:
            | Database["public"]["Enums"]["notification_delivery_status"]
            | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          next_retry_at?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          delivery_attempts?: number | null
          delivery_status?:
            | Database["public"]["Enums"]["notification_delivery_status"]
            | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          metadata?: Json | null
          next_retry_at?: string | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          image_url: string | null
          next_auth_user_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          slug: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          image_url?: string | null
          next_auth_user_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          slug?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          next_auth_user_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_escrows: {
        Row: {
          created_at: string
          escrow_id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          escrow_id: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          escrow_id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_escrows_escrow_id_fkey"
            columns: ["escrow_id"]
            isOneToOne: true
            referencedRelation: "escrow_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_escrows_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          role: Database["public"]["Enums"]["project_member_role"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          role?: Database["public"]["Enums"]["project_member_role"]
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_member_role"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_pitch: {
        Row: {
          created_at: string | null
          id: string
          pitch_deck: string | null
          project_id: string
          story: string
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pitch_deck?: string | null
          project_id: string
          story: string
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pitch_deck?: string | null
          project_id?: string
          story?: string
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_pitch_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tag_relationships: {
        Row: {
          project_id: string
          tag_id: string
        }
        Insert: {
          project_id: string
          tag_id: string
        }
        Update: {
          project_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tag_relationships_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tag_relationships_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "project_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          color: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_team: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string
          id: string
          order_index: number
          photo_url: string | null
          project_id: string
          role_title: string
          updated_at: string
          years_involved: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          order_index?: number
          photo_url?: string | null
          project_id: string
          role_title: string
          updated_at?: string
          years_involved?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          order_index?: number
          photo_url?: string | null
          project_id?: string
          role_title?: string
          updated_at?: string
          years_involved?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "project_team_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_updates: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category_id: string
          created_at: string | null
          current_amount: number
          description: string
          foundation_id: string | null
          id: string
          image_url: string | null
          kinder_count: number
          kindler_id: string
          metadata: Json
          min_investment: number
          percentage_complete: number
          project_location: string
          slug: string | null
          social_links: Json
          status: Database["public"]["Enums"]["project_status"]
          target_amount: number
          title: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          current_amount?: number
          description: string
          foundation_id?: string | null
          id?: string
          image_url?: string | null
          kinder_count?: number
          kindler_id: string
          metadata?: Json
          min_investment: number
          percentage_complete?: number
          project_location: string
          slug?: string | null
          social_links?: Json
          status?: Database["public"]["Enums"]["project_status"]
          target_amount: number
          title: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          current_amount?: number
          description?: string
          foundation_id?: string | null
          id?: string
          image_url?: string | null
          kinder_count?: number
          kindler_id?: string
          metadata?: Json
          min_investment?: number
          percentage_complete?: number
          project_location?: string
          slug?: string | null
          social_links?: Json
          status?: Database["public"]["Enums"]["project_status"]
          target_amount?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_foundation_id_fkey"
            columns: ["foundation_id"]
            isOneToOne: false
            referencedRelation: "foundations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_interests: {
        Row: {
          category_id: string | null
          consent: boolean
          created_at: string
          email: string | null
          id: string
          location: string | null
          name: string
          project_description: string | null
          project_name: string | null
          role: string
          source: string | null
        }
        Insert: {
          category_id?: string | null
          consent?: boolean
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name: string
          project_description?: string | null
          project_name?: string | null
          role: string
          source?: string | null
        }
        Update: {
          category_id?: string | null
          consent?: boolean
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          name?: string
          project_description?: string | null
          project_name?: string | null
          role?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_kyc_admin: {
        Args: { admin_notes?: string; target_user_id: string }
        Returns: undefined
      }
      cleanup_expired_challenges: { Args: never; Returns: undefined }
      current_auth_user_id: { Args: never; Returns: string }
      get_current_user_profile: {
        Args: never
        Returns: {
          profile_id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }[]
      }
      is_project_owner: {
        Args: { project_uuid: string; user_uuid: string }
        Returns: boolean
      }
      is_project_team_member: {
        Args: { project_uuid: string; user_uuid: string }
        Returns: boolean
      }
      remove_kyc_admin: { Args: { target_user_id: string }; Returns: undefined }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      backup_state: "not_backed_up" | "backed_up"
      comment_type: "comment" | "question" | "answer"
      credential_type: "public-key"
      device_type: "single_device" | "multi_device"
      escrow_status_type:
        | "NEW"
        | "FUNDED"
        | "ACTIVE"
        | "COMPLETED"
        | "DISPUTED"
        | "CANCELLED"
      kyc_status_enum: "pending" | "approved" | "rejected" | "verified"
      kyc_verification_enum: "basic" | "enhanced"
      milestone_status:
        | "pending"
        | "completed"
        | "approved"
        | "rejected"
        | "disputed"
      notification_delivery_status: "pending" | "delivered" | "failed"
      notification_priority: "low" | "medium" | "high" | "urgent"
      notification_type: "info" | "success" | "warning" | "error"
      profile_verification_status: "unverified" | "verified"
      project_member_role:
        | "admin"
        | "editor"
        | "advisor"
        | "community"
        | "core"
        | "others"
      project_status:
        | "draft"
        | "review"
        | "active"
        | "paused"
        | "funded"
        | "rejected"
      user_role:
        | "donor"
        | "creator"
        | "pending"
        | "admin"
        | "kinder"
        | "kindler"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      backup_state: ["not_backed_up", "backed_up"],
      comment_type: ["comment", "question", "answer"],
      credential_type: ["public-key"],
      device_type: ["single_device", "multi_device"],
      escrow_status_type: [
        "NEW",
        "FUNDED",
        "ACTIVE",
        "COMPLETED",
        "DISPUTED",
        "CANCELLED",
      ],
      kyc_status_enum: ["pending", "approved", "rejected", "verified"],
      kyc_verification_enum: ["basic", "enhanced"],
      milestone_status: [
        "pending",
        "completed",
        "approved",
        "rejected",
        "disputed",
      ],
      notification_delivery_status: ["pending", "delivered", "failed"],
      notification_priority: ["low", "medium", "high", "urgent"],
      notification_type: ["info", "success", "warning", "error"],
      profile_verification_status: ["unverified", "verified"],
      project_member_role: [
        "admin",
        "editor",
        "advisor",
        "community",
        "core",
        "others",
      ],
      project_status: [
        "draft",
        "review",
        "active",
        "paused",
        "funded",
        "rejected",
      ],
      user_role: ["donor", "creator", "pending", "admin", "kinder", "kindler"],
    },
  },
} as const
