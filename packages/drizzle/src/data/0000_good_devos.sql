-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."comment_type" AS ENUM('comment', 'question', 'answer');--> statement-breakpoint
CREATE TYPE "public"."escrow_status_type" AS ENUM('NEW', 'FUNDED', 'ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."kyc_status_enum" AS ENUM('pending', 'approved', 'rejected', 'verified');--> statement-breakpoint
CREATE TYPE "public"."kyc_verification_enum" AS ENUM('basic', 'enhanced');--> statement-breakpoint
CREATE TYPE "public"."milestone_status" AS ENUM('pending', 'completed', 'approved', 'rejected', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."notification_delivery_status" AS ENUM('pending', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'success', 'warning', 'error');--> statement-breakpoint
CREATE TYPE "public"."project_member_role" AS ENUM('admin', 'editor');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('kinder', 'kindler');--> statement-breakpoint
CREATE TABLE "escrow_contracts" (
	"id" uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
	"engagement_id" text NOT NULL,
	"contract_id" text NOT NULL,
	"project_id" uuid NOT NULL,
	"contribution_id" uuid NOT NULL,
	"payer_address" text NOT NULL,
	"receiver_address" text NOT NULL,
	"amount" numeric(20, 7) NOT NULL,
	"current_state" "escrow_status_type" DEFAULT 'NEW' NOT NULL,
	"platform_fee" numeric(5, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"completed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "escrow_contracts_engagement_id_key" UNIQUE("engagement_id"),
	CONSTRAINT "escrow_contracts_contract_id_key" UNIQUE("contract_id"),
	CONSTRAINT "valid_escrow_amount" CHECK (amount > (0)::numeric),
	CONSTRAINT "valid_platform_fee" CHECK (platform_fee >= (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "escrow_contracts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"current_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"target_amount" numeric(12, 2) NOT NULL,
	"min_investment" numeric(12, 2) NOT NULL,
	"percentage_complete" numeric(5, 2) DEFAULT '0' NOT NULL,
	"investors_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"category_id" uuid,
	"image_url" text,
	"owner_id" uuid NOT NULL,
	CONSTRAINT "check_min_investment_less_than_target" CHECK (min_investment <= target_amount),
	CONSTRAINT "check_positive_target_amount" CHECK (target_amount > (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "escrow_status" (
	"id" uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
	"escrow_id" text NOT NULL,
	"status" "escrow_status_type" NOT NULL,
	"current_milestone" integer,
	"total_funded" numeric(20, 7),
	"total_released" numeric(20, 7),
	"last_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "valid_amounts" CHECK (total_funded >= total_released)
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
	"project_id" uuid NOT NULL,
	"contributor_id" uuid NOT NULL,
	"amount" numeric(20, 7) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"role" "user_role" DEFAULT 'kindler' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"image_url" text
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_updates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_pitch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"story" text,
	"pitch_deck" text,
	"video_url" text,
	"project_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "project_pitch" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "community" (
	"id" uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
	"project_id" uuid NOT NULL,
	"update_id" uuid NOT NULL,
	"comment_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"amount" numeric(20, 7) NOT NULL,
	"deadline" timestamp with time zone NOT NULL,
	"status" "milestone_status" DEFAULT 'pending' NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"completed_at" timestamp with time zone,
	"project_id" uuid NOT NULL,
	CONSTRAINT "valid_milestone_amount" CHECK (amount > (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "milestones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "project_member_role" DEFAULT 'editor' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"title" text NOT NULL,
	CONSTRAINT "project_members_project_id_user_id_key" UNIQUE("project_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "project_members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"color" char(7) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "project_tags_name_key" UNIQUE("name"),
	CONSTRAINT "project_tags_color_check" CHECK ((color)::text ~ '^#[0-9A-Fa-f]{6}$'::text)
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
	"content" text NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"project_id" uuid,
	"project_update_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"type" "comment_type" DEFAULT 'comment' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "check_project_or_update" CHECK (((project_id IS NOT NULL) AND (project_update_id IS NULL)) OR ((project_id IS NULL) AND (project_update_id IS NOT NULL))),
	CONSTRAINT "chk_comments_metadata_status" CHECK ((type <> 'question'::comment_type) OR ((metadata ->> 'status'::text) = ANY (ARRAY['new'::text, 'answered'::text, 'resolved'::text])))
);
--> statement-breakpoint
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "escrow_reviews" (
	"id" uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4() NOT NULL,
	"escrow_id" uuid NOT NULL,
	"milestone_id" uuid,
	"reviewer_address" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"reviewed_at" timestamp with time zone,
	"disputer_id" uuid,
	"type" text NOT NULL,
	"resolution_text" text,
	"evidence_urls" text[],
	"transaction_hash" text,
	CONSTRAINT "escrow_reviews_type_check" CHECK (type = ANY (ARRAY['dispute'::text, 'milestone'::text]))
);
--> statement-breakpoint
ALTER TABLE "escrow_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"name" text NOT NULL,
	"color" char(7) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text,
	CONSTRAINT "categories_name_key" UNIQUE("name"),
	CONSTRAINT "categories_color_key" UNIQUE("color"),
	CONSTRAINT "chk_color_format" CHECK (color ~ '^#[0-9A-Fa-f]{6}$'::text)
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "kyc_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "kyc_status_enum" DEFAULT 'pending' NOT NULL,
	"verification_level" "kyc_verification_enum" DEFAULT 'basic' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kyc_status_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "kyc_status" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "kyc_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kyc_status_id" uuid NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"decision" "kyc_status_enum" NOT NULL,
	"reason" text,
	"additional_notes" text,
	"review_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kyc_reviews_kyc_status_id_reviewer_id_key" UNIQUE("kyc_status_id","reviewer_id")
);
--> statement-breakpoint
ALTER TABLE "kyc_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"email" boolean DEFAULT true,
	"push" boolean DEFAULT true,
	"in_app" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"priority" "notification_priority" DEFAULT 'medium' NOT NULL,
	"is_read" boolean DEFAULT false,
	"delivery_status" "notification_delivery_status" DEFAULT 'pending',
	"delivery_attempts" integer DEFAULT 0,
	"next_retry_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "project_tag_relationships" (
	"project_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "project_tag_relationships_pkey" PRIMARY KEY("project_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "escrow_milestones" (
	"escrow_id" uuid NOT NULL,
	"milestone_id" uuid NOT NULL,
	CONSTRAINT "escrow_milestones_pkey1" PRIMARY KEY("escrow_id","milestone_id")
);
--> statement-breakpoint
ALTER TABLE "escrow_milestones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "kindler_projects" (
	"kindler_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kindler_projects_pkey" PRIMARY KEY("kindler_id","project_id")
);
--> statement-breakpoint
ALTER TABLE "kindler_projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "escrow_contracts" ADD CONSTRAINT "escrow_contracts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_contracts" ADD CONSTRAINT "escrow_contracts_contribution_id_fkey" FOREIGN KEY ("contribution_id") REFERENCES "public"."contributions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_pitch" ADD CONSTRAINT "project_pitch_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community" ADD CONSTRAINT "community_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community" ADD CONSTRAINT "community_update_id_fkey" FOREIGN KEY ("update_id") REFERENCES "public"."project_updates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community" ADD CONSTRAINT "comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_project_update_id_fkey" FOREIGN KEY ("project_update_id") REFERENCES "public"."project_updates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_reviews" ADD CONSTRAINT "escrow_reviews_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrow_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_reviews" ADD CONSTRAINT "escrow_reviews_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_status" ADD CONSTRAINT "kyc_status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_reviews" ADD CONSTRAINT "kyc_reviews_kyc_status_id_fkey" FOREIGN KEY ("kyc_status_id") REFERENCES "public"."kyc_status"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kyc_reviews" ADD CONSTRAINT "kyc_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tag_relationships" ADD CONSTRAINT "project_tag_relationships_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_tag_relationships" ADD CONSTRAINT "project_tag_relationships_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."project_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_milestones" ADD CONSTRAINT "escrow_milestones_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "public"."escrow_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escrow_milestones" ADD CONSTRAINT "escrow_milestones_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "public"."milestones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kindler_projects" ADD CONSTRAINT "kindler_projects_kindler_id_fkey" FOREIGN KEY ("kindler_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kindler_projects" ADD CONSTRAINT "kindler_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_projects_owner_id" ON "projects" USING btree ("owner_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_escrow_status_escrow_id" ON "escrow_status" USING btree ("escrow_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_escrow_status_last_updated" ON "escrow_status" USING btree ("last_updated" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_escrow_status_metadata" ON "escrow_status" USING gin ("metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_escrow_status_status" ON "escrow_status" USING btree ("status" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_project_updates_author_id" ON "project_updates" USING btree ("author_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_project_updates_project_id" ON "project_updates" USING btree ("project_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "community_project_id_idx" ON "community" USING btree ("project_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "community_update_id_idx" ON "community" USING btree ("update_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_project_members_project_id" ON "project_members" USING btree ("project_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_project_members_user_id" ON "project_members" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_metadata_status" ON "comments" USING btree (((metadata ->> 'status'::text)) text_ops) WHERE (type = 'question'::comment_type);--> statement-breakpoint
CREATE INDEX "idx_comments_official_answers" ON "comments" USING btree (((metadata ->> 'is_official'::text)) text_ops) WHERE (type = 'answer'::comment_type);--> statement-breakpoint
CREATE INDEX "idx_comments_parent_id" ON "comments" USING btree ("parent_comment_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_type" ON "comments" USING btree ("type" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_comments_type_parent" ON "comments" USING btree ("type" uuid_ops,"parent_comment_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "escrow_reviews_escrow_id_idx" ON "escrow_reviews" USING btree ("escrow_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "escrow_reviews_milestone_id_idx" ON "escrow_reviews" USING btree ("milestone_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "escrow_reviews_type_idx" ON "escrow_reviews" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX "idx_kyc_status_user_id" ON "kyc_status" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_kyc_reviews_kyc_status_id" ON "kyc_reviews" USING btree ("kyc_status_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_kyc_reviews_reviewer_id" ON "kyc_reviews" USING btree ("reviewer_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read" bool_ops);--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_kindler_projects_project_id" ON "kindler_projects" USING btree ("project_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "public_select_escrow_contracts" ON "escrow_contracts" AS PERMISSIVE FOR SELECT TO public USING (true);--> statement-breakpoint
CREATE POLICY "Projects can be deleted by owner" ON "projects" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = owner_id));--> statement-breakpoint
CREATE POLICY "Projects can be updated by owner" ON "projects" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Projects can be created by authenticated users" ON "projects" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Projects are viewable by everyone" ON "projects" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Allow public read access to projects" ON "projects" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Allow project owners to update their projects" ON "projects" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Allow authenticated users to create projects" ON "projects" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));--> statement-breakpoint
CREATE POLICY "Users can insert their own profile" ON "profiles" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public read access to profiles" ON "profiles" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Project updates can be deleted by authors or project owners" ON "project_updates" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((auth.uid() = author_id) OR (EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = project_updates.project_id) AND (projects.owner_id = auth.uid()))))));--> statement-breakpoint
CREATE POLICY "Project updates can be modified by authors" ON "project_updates" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Project updates can be created by project members" ON "project_updates" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public read access to project updates" ON "project_updates" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can delete their own project pitches" ON "project_pitch" AS PERMISSIVE FOR DELETE TO public USING ((project_id IN ( SELECT projects.id
   FROM projects
  WHERE ((projects.id = project_pitch.project_id) AND (projects.owner_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Users can update their own project pitches" ON "project_pitch" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can insert their own project pitches" ON "project_pitch" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Public read access to project pitches" ON "project_pitch" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Project owners can delete milestones" ON "milestones" AS PERMISSIVE FOR DELETE TO public USING ((project_id IN ( SELECT projects.id
   FROM projects
  WHERE (projects.owner_id = auth.uid()))));--> statement-breakpoint
CREATE POLICY "Project owners can update milestones" ON "milestones" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Public read access to milestones" ON "milestones" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Project owners can create milestones" ON "milestones" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Project owners can remove members" ON "project_members" AS PERMISSIVE FOR DELETE TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM projects
  WHERE ((projects.id = project_members.project_id) AND (projects.owner_id = auth.uid())))) OR (user_id = auth.uid())));--> statement-breakpoint
CREATE POLICY "Project owners can update member roles" ON "project_members" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "Project owners can add members" ON "project_members" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Public read access to project members" ON "project_members" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "update_question_status" ON "comments" AS PERMISSIVE FOR UPDATE TO public USING (((type = 'question'::comment_type) AND (author_id = auth.uid()))) WITH CHECK (((type = 'question'::comment_type) AND (author_id = auth.uid()) AND (content = content) AND (NOT (parent_comment_id IS DISTINCT FROM parent_comment_id)) AND (project_id = project_id) AND true));--> statement-breakpoint
CREATE POLICY "update_answer_official" ON "comments" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Public read access to comments" ON "comments" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can write categories" ON "categories" AS PERMISSIVE FOR ALL TO public USING ((current_setting('jwt.claims.role'::text, true) = 'admin'::text)) WITH CHECK ((current_setting('jwt.claims.role'::text, true) = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Public can read categories" ON "categories" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Admins can update KYC statuses" ON "kyc_status" AS PERMISSIVE FOR UPDATE TO public USING (((auth.jwt() ->> 'role'::text) = 'admin'::text));--> statement-breakpoint
CREATE POLICY "Admins can view all KYC statuses" ON "kyc_status" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can view their own KYC status" ON "kyc_status" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can view their own KYC reviews" ON "kyc_reviews" AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM kyc_status
  WHERE ((kyc_status.id = kyc_reviews.kyc_status_id) AND (kyc_status.user_id = auth.uid())))));--> statement-breakpoint
CREATE POLICY "Admins can update KYC reviews" ON "kyc_reviews" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Admins can create KYC reviews" ON "kyc_reviews" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Admins can view all KYC reviews" ON "kyc_reviews" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own notification preferences" ON "notification_preferences" AS PERMISSIVE FOR UPDATE TO public USING ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can view their own notification preferences" ON "notification_preferences" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Users can create their own notifications" ON "notifications" AS PERMISSIVE FOR INSERT TO public WITH CHECK ((auth.uid() = user_id));--> statement-breakpoint
CREATE POLICY "Users can delete their own notifications" ON "notifications" AS PERMISSIVE FOR DELETE TO public;--> statement-breakpoint
CREATE POLICY "Users can update their own notifications" ON "notifications" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Users can view their own notifications" ON "notifications" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Project owners can delete escrow milestones" ON "escrow_milestones" AS PERMISSIVE FOR DELETE TO public USING ((milestone_id IN ( SELECT milestones.id
   FROM milestones
  WHERE (milestones.project_id IN ( SELECT projects.id
           FROM projects
          WHERE (projects.owner_id = auth.uid()))))));--> statement-breakpoint
CREATE POLICY "Project owners can update escrow milestones" ON "escrow_milestones" AS PERMISSIVE FOR UPDATE TO public;--> statement-breakpoint
CREATE POLICY "Project owners can view escrow milestones" ON "escrow_milestones" AS PERMISSIVE FOR SELECT TO public;--> statement-breakpoint
CREATE POLICY "Project owners can create escrow milestones" ON "escrow_milestones" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can leave projects" ON "kindler_projects" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((auth.uid() = kindler_id));--> statement-breakpoint
CREATE POLICY "Users can join projects as kindlers" ON "kindler_projects" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "Kindler-project relationships viewable by everyone" ON "kindler_projects" AS PERMISSIVE FOR SELECT TO "authenticated";
*/