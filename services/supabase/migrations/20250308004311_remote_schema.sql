drop trigger if exists "set_updated_at" on "public"."project_pitch";

drop trigger if exists "update_projects_modtime" on "public"."projects";

drop policy "public_select_escrow_contracts" on "public"."escrow_contracts";

drop policy "Project owners can create escrow milestones" on "public"."escrow_milestones";

drop policy "Project owners can delete escrow milestones" on "public"."escrow_milestones";

drop policy "Project owners can update escrow milestones" on "public"."escrow_milestones";

drop policy "Project owners can view escrow milestones" on "public"."escrow_milestones";

drop policy "Kindler-project relationships viewable by everyone" on "public"."kindler_projects";

drop policy "Users can join projects as kindlers" on "public"."kindler_projects";

drop policy "Users can leave projects" on "public"."kindler_projects";

drop policy "Profiles are viewable by everyone" on "public"."profiles";

drop policy "Users can insert their own profile" on "public"."profiles";

drop policy "Users can update their own profile" on "public"."profiles";

drop policy "Project owners can create project milestones" on "public"."project_milestones";

drop policy "Project owners can delete project milestones" on "public"."project_milestones";

drop policy "Project owners can view project milestones" on "public"."project_milestones";

drop policy "Users can delete their own project pitches" on "public"."project_pitch";

drop policy "Users can insert their own project pitches" on "public"."project_pitch";

drop policy "Users can update their own project pitches" on "public"."project_pitch";

drop policy "Users can view project pitches they have access to" on "public"."project_pitch";

drop policy "Project updates are viewable by everyone" on "public"."project_updates";

drop policy "Project updates can be created by project members" on "public"."project_updates";

drop policy "Project updates can be deleted by authors or project owners" on "public"."project_updates";

drop policy "Project updates can be modified by authors" on "public"."project_updates";

drop policy "Allow authenticated users to create projects" on "public"."projects";

drop policy "Allow project owners to update their projects" on "public"."projects";

drop policy "Allow public read access to projects" on "public"."projects";

drop policy "Projects are viewable by everyone" on "public"."projects";

drop policy "Projects can be created by authenticated users" on "public"."projects";

drop policy "Projects can be deleted by owner" on "public"."projects";

drop policy "Projects can be updated by owner" on "public"."projects";

revoke delete on table "public"."comments" from "anon";

revoke insert on table "public"."comments" from "anon";

revoke references on table "public"."comments" from "anon";

revoke select on table "public"."comments" from "anon";

revoke trigger on table "public"."comments" from "anon";

revoke truncate on table "public"."comments" from "anon";

revoke update on table "public"."comments" from "anon";

revoke delete on table "public"."comments" from "authenticated";

revoke insert on table "public"."comments" from "authenticated";

revoke references on table "public"."comments" from "authenticated";

revoke select on table "public"."comments" from "authenticated";

revoke trigger on table "public"."comments" from "authenticated";

revoke truncate on table "public"."comments" from "authenticated";

revoke update on table "public"."comments" from "authenticated";

revoke delete on table "public"."comments" from "service_role";

revoke insert on table "public"."comments" from "service_role";

revoke references on table "public"."comments" from "service_role";

revoke select on table "public"."comments" from "service_role";

revoke trigger on table "public"."comments" from "service_role";

revoke truncate on table "public"."comments" from "service_role";

revoke update on table "public"."comments" from "service_role";

revoke delete on table "public"."community" from "anon";

revoke insert on table "public"."community" from "anon";

revoke references on table "public"."community" from "anon";

revoke select on table "public"."community" from "anon";

revoke trigger on table "public"."community" from "anon";

revoke truncate on table "public"."community" from "anon";

revoke update on table "public"."community" from "anon";

revoke delete on table "public"."community" from "authenticated";

revoke insert on table "public"."community" from "authenticated";

revoke references on table "public"."community" from "authenticated";

revoke select on table "public"."community" from "authenticated";

revoke trigger on table "public"."community" from "authenticated";

revoke truncate on table "public"."community" from "authenticated";

revoke update on table "public"."community" from "authenticated";

revoke delete on table "public"."community" from "service_role";

revoke insert on table "public"."community" from "service_role";

revoke references on table "public"."community" from "service_role";

revoke select on table "public"."community" from "service_role";

revoke trigger on table "public"."community" from "service_role";

revoke truncate on table "public"."community" from "service_role";

revoke update on table "public"."community" from "service_role";

revoke delete on table "public"."contributions" from "anon";

revoke insert on table "public"."contributions" from "anon";

revoke references on table "public"."contributions" from "anon";

revoke select on table "public"."contributions" from "anon";

revoke trigger on table "public"."contributions" from "anon";

revoke truncate on table "public"."contributions" from "anon";

revoke update on table "public"."contributions" from "anon";

revoke delete on table "public"."contributions" from "authenticated";

revoke insert on table "public"."contributions" from "authenticated";

revoke references on table "public"."contributions" from "authenticated";

revoke select on table "public"."contributions" from "authenticated";

revoke trigger on table "public"."contributions" from "authenticated";

revoke truncate on table "public"."contributions" from "authenticated";

revoke update on table "public"."contributions" from "authenticated";

revoke delete on table "public"."contributions" from "service_role";

revoke insert on table "public"."contributions" from "service_role";

revoke references on table "public"."contributions" from "service_role";

revoke select on table "public"."contributions" from "service_role";

revoke trigger on table "public"."contributions" from "service_role";

revoke truncate on table "public"."contributions" from "service_role";

revoke update on table "public"."contributions" from "service_role";

revoke delete on table "public"."escrow_contracts" from "anon";

revoke insert on table "public"."escrow_contracts" from "anon";

revoke references on table "public"."escrow_contracts" from "anon";

revoke select on table "public"."escrow_contracts" from "anon";

revoke trigger on table "public"."escrow_contracts" from "anon";

revoke truncate on table "public"."escrow_contracts" from "anon";

revoke update on table "public"."escrow_contracts" from "anon";

revoke delete on table "public"."escrow_contracts" from "authenticated";

revoke insert on table "public"."escrow_contracts" from "authenticated";

revoke references on table "public"."escrow_contracts" from "authenticated";

revoke select on table "public"."escrow_contracts" from "authenticated";

revoke trigger on table "public"."escrow_contracts" from "authenticated";

revoke truncate on table "public"."escrow_contracts" from "authenticated";

revoke update on table "public"."escrow_contracts" from "authenticated";

revoke delete on table "public"."escrow_contracts" from "service_role";

revoke insert on table "public"."escrow_contracts" from "service_role";

revoke references on table "public"."escrow_contracts" from "service_role";

revoke select on table "public"."escrow_contracts" from "service_role";

revoke trigger on table "public"."escrow_contracts" from "service_role";

revoke truncate on table "public"."escrow_contracts" from "service_role";

revoke update on table "public"."escrow_contracts" from "service_role";

revoke delete on table "public"."escrow_milestones" from "anon";

revoke insert on table "public"."escrow_milestones" from "anon";

revoke references on table "public"."escrow_milestones" from "anon";

revoke select on table "public"."escrow_milestones" from "anon";

revoke trigger on table "public"."escrow_milestones" from "anon";

revoke truncate on table "public"."escrow_milestones" from "anon";

revoke update on table "public"."escrow_milestones" from "anon";

revoke delete on table "public"."escrow_milestones" from "authenticated";

revoke insert on table "public"."escrow_milestones" from "authenticated";

revoke references on table "public"."escrow_milestones" from "authenticated";

revoke select on table "public"."escrow_milestones" from "authenticated";

revoke trigger on table "public"."escrow_milestones" from "authenticated";

revoke truncate on table "public"."escrow_milestones" from "authenticated";

revoke update on table "public"."escrow_milestones" from "authenticated";

revoke delete on table "public"."escrow_milestones" from "service_role";

revoke insert on table "public"."escrow_milestones" from "service_role";

revoke references on table "public"."escrow_milestones" from "service_role";

revoke select on table "public"."escrow_milestones" from "service_role";

revoke trigger on table "public"."escrow_milestones" from "service_role";

revoke truncate on table "public"."escrow_milestones" from "service_role";

revoke update on table "public"."escrow_milestones" from "service_role";

revoke delete on table "public"."escrow_status" from "anon";

revoke insert on table "public"."escrow_status" from "anon";

revoke references on table "public"."escrow_status" from "anon";

revoke select on table "public"."escrow_status" from "anon";

revoke trigger on table "public"."escrow_status" from "anon";

revoke truncate on table "public"."escrow_status" from "anon";

revoke update on table "public"."escrow_status" from "anon";

revoke delete on table "public"."escrow_status" from "authenticated";

revoke insert on table "public"."escrow_status" from "authenticated";

revoke references on table "public"."escrow_status" from "authenticated";

revoke select on table "public"."escrow_status" from "authenticated";

revoke trigger on table "public"."escrow_status" from "authenticated";

revoke truncate on table "public"."escrow_status" from "authenticated";

revoke update on table "public"."escrow_status" from "authenticated";

revoke delete on table "public"."escrow_status" from "service_role";

revoke insert on table "public"."escrow_status" from "service_role";

revoke references on table "public"."escrow_status" from "service_role";

revoke select on table "public"."escrow_status" from "service_role";

revoke trigger on table "public"."escrow_status" from "service_role";

revoke truncate on table "public"."escrow_status" from "service_role";

revoke update on table "public"."escrow_status" from "service_role";

revoke delete on table "public"."kindler_projects" from "anon";

revoke insert on table "public"."kindler_projects" from "anon";

revoke references on table "public"."kindler_projects" from "anon";

revoke select on table "public"."kindler_projects" from "anon";

revoke trigger on table "public"."kindler_projects" from "anon";

revoke truncate on table "public"."kindler_projects" from "anon";

revoke update on table "public"."kindler_projects" from "anon";

revoke delete on table "public"."kindler_projects" from "authenticated";

revoke insert on table "public"."kindler_projects" from "authenticated";

revoke references on table "public"."kindler_projects" from "authenticated";

revoke select on table "public"."kindler_projects" from "authenticated";

revoke trigger on table "public"."kindler_projects" from "authenticated";

revoke truncate on table "public"."kindler_projects" from "authenticated";

revoke update on table "public"."kindler_projects" from "authenticated";

revoke delete on table "public"."kindler_projects" from "service_role";

revoke insert on table "public"."kindler_projects" from "service_role";

revoke references on table "public"."kindler_projects" from "service_role";

revoke select on table "public"."kindler_projects" from "service_role";

revoke trigger on table "public"."kindler_projects" from "service_role";

revoke truncate on table "public"."kindler_projects" from "service_role";

revoke update on table "public"."kindler_projects" from "service_role";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."profiles" from "authenticated";

revoke insert on table "public"."profiles" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke select on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke delete on table "public"."profiles" from "service_role";

revoke insert on table "public"."profiles" from "service_role";

revoke references on table "public"."profiles" from "service_role";

revoke select on table "public"."profiles" from "service_role";

revoke trigger on table "public"."profiles" from "service_role";

revoke truncate on table "public"."profiles" from "service_role";

revoke update on table "public"."profiles" from "service_role";

revoke delete on table "public"."project_milestones" from "anon";

revoke insert on table "public"."project_milestones" from "anon";

revoke references on table "public"."project_milestones" from "anon";

revoke select on table "public"."project_milestones" from "anon";

revoke trigger on table "public"."project_milestones" from "anon";

revoke truncate on table "public"."project_milestones" from "anon";

revoke update on table "public"."project_milestones" from "anon";

revoke delete on table "public"."project_milestones" from "authenticated";

revoke insert on table "public"."project_milestones" from "authenticated";

revoke references on table "public"."project_milestones" from "authenticated";

revoke select on table "public"."project_milestones" from "authenticated";

revoke trigger on table "public"."project_milestones" from "authenticated";

revoke truncate on table "public"."project_milestones" from "authenticated";

revoke update on table "public"."project_milestones" from "authenticated";

revoke delete on table "public"."project_milestones" from "service_role";

revoke insert on table "public"."project_milestones" from "service_role";

revoke references on table "public"."project_milestones" from "service_role";

revoke select on table "public"."project_milestones" from "service_role";

revoke trigger on table "public"."project_milestones" from "service_role";

revoke truncate on table "public"."project_milestones" from "service_role";

revoke update on table "public"."project_milestones" from "service_role";

revoke delete on table "public"."project_pitch" from "anon";

revoke insert on table "public"."project_pitch" from "anon";

revoke references on table "public"."project_pitch" from "anon";

revoke select on table "public"."project_pitch" from "anon";

revoke trigger on table "public"."project_pitch" from "anon";

revoke truncate on table "public"."project_pitch" from "anon";

revoke update on table "public"."project_pitch" from "anon";

revoke delete on table "public"."project_pitch" from "authenticated";

revoke insert on table "public"."project_pitch" from "authenticated";

revoke references on table "public"."project_pitch" from "authenticated";

revoke select on table "public"."project_pitch" from "authenticated";

revoke trigger on table "public"."project_pitch" from "authenticated";

revoke truncate on table "public"."project_pitch" from "authenticated";

revoke update on table "public"."project_pitch" from "authenticated";

revoke delete on table "public"."project_pitch" from "service_role";

revoke insert on table "public"."project_pitch" from "service_role";

revoke references on table "public"."project_pitch" from "service_role";

revoke select on table "public"."project_pitch" from "service_role";

revoke trigger on table "public"."project_pitch" from "service_role";

revoke truncate on table "public"."project_pitch" from "service_role";

revoke update on table "public"."project_pitch" from "service_role";

revoke delete on table "public"."project_tag_relationships" from "anon";

revoke insert on table "public"."project_tag_relationships" from "anon";

revoke references on table "public"."project_tag_relationships" from "anon";

revoke select on table "public"."project_tag_relationships" from "anon";

revoke trigger on table "public"."project_tag_relationships" from "anon";

revoke truncate on table "public"."project_tag_relationships" from "anon";

revoke update on table "public"."project_tag_relationships" from "anon";

revoke delete on table "public"."project_tag_relationships" from "authenticated";

revoke insert on table "public"."project_tag_relationships" from "authenticated";

revoke references on table "public"."project_tag_relationships" from "authenticated";

revoke select on table "public"."project_tag_relationships" from "authenticated";

revoke trigger on table "public"."project_tag_relationships" from "authenticated";

revoke truncate on table "public"."project_tag_relationships" from "authenticated";

revoke update on table "public"."project_tag_relationships" from "authenticated";

revoke delete on table "public"."project_tag_relationships" from "service_role";

revoke insert on table "public"."project_tag_relationships" from "service_role";

revoke references on table "public"."project_tag_relationships" from "service_role";

revoke select on table "public"."project_tag_relationships" from "service_role";

revoke trigger on table "public"."project_tag_relationships" from "service_role";

revoke truncate on table "public"."project_tag_relationships" from "service_role";

revoke update on table "public"."project_tag_relationships" from "service_role";

revoke delete on table "public"."project_tags" from "anon";

revoke insert on table "public"."project_tags" from "anon";

revoke references on table "public"."project_tags" from "anon";

revoke select on table "public"."project_tags" from "anon";

revoke trigger on table "public"."project_tags" from "anon";

revoke truncate on table "public"."project_tags" from "anon";

revoke update on table "public"."project_tags" from "anon";

revoke delete on table "public"."project_tags" from "authenticated";

revoke insert on table "public"."project_tags" from "authenticated";

revoke references on table "public"."project_tags" from "authenticated";

revoke select on table "public"."project_tags" from "authenticated";

revoke trigger on table "public"."project_tags" from "authenticated";

revoke truncate on table "public"."project_tags" from "authenticated";

revoke update on table "public"."project_tags" from "authenticated";

revoke delete on table "public"."project_tags" from "service_role";

revoke insert on table "public"."project_tags" from "service_role";

revoke references on table "public"."project_tags" from "service_role";

revoke select on table "public"."project_tags" from "service_role";

revoke trigger on table "public"."project_tags" from "service_role";

revoke truncate on table "public"."project_tags" from "service_role";

revoke update on table "public"."project_tags" from "service_role";

revoke delete on table "public"."project_updates" from "anon";

revoke insert on table "public"."project_updates" from "anon";

revoke references on table "public"."project_updates" from "anon";

revoke select on table "public"."project_updates" from "anon";

revoke trigger on table "public"."project_updates" from "anon";

revoke truncate on table "public"."project_updates" from "anon";

revoke update on table "public"."project_updates" from "anon";

revoke delete on table "public"."project_updates" from "authenticated";

revoke insert on table "public"."project_updates" from "authenticated";

revoke references on table "public"."project_updates" from "authenticated";

revoke select on table "public"."project_updates" from "authenticated";

revoke trigger on table "public"."project_updates" from "authenticated";

revoke truncate on table "public"."project_updates" from "authenticated";

revoke update on table "public"."project_updates" from "authenticated";

revoke delete on table "public"."project_updates" from "service_role";

revoke insert on table "public"."project_updates" from "service_role";

revoke references on table "public"."project_updates" from "service_role";

revoke select on table "public"."project_updates" from "service_role";

revoke trigger on table "public"."project_updates" from "service_role";

revoke truncate on table "public"."project_updates" from "service_role";

revoke update on table "public"."project_updates" from "service_role";

revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke references on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke trigger on table "public"."projects" from "anon";

revoke truncate on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."projects" from "authenticated";

revoke insert on table "public"."projects" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke select on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke delete on table "public"."projects" from "service_role";

revoke insert on table "public"."projects" from "service_role";

revoke references on table "public"."projects" from "service_role";

revoke select on table "public"."projects" from "service_role";

revoke trigger on table "public"."projects" from "service_role";

revoke truncate on table "public"."projects" from "service_role";

revoke update on table "public"."projects" from "service_role";

alter table "public"."comments" drop constraint "check_project_or_update";

alter table "public"."comments" drop constraint "comments_author_id_fkey";

alter table "public"."comments" drop constraint "comments_parent_comment_id_fkey";

alter table "public"."comments" drop constraint "comments_project_id_fkey";

alter table "public"."comments" drop constraint "comments_project_update_id_fkey";

alter table "public"."community" drop constraint "comment_id_fkey";

alter table "public"."community" drop constraint "community_project_id_fkey";

alter table "public"."community" drop constraint "community_update_id_fkey";

alter table "public"."contributions" drop constraint "contributions_project_id_fkey";

alter table "public"."escrow_contracts" drop constraint "escrow_contracts_contract_id_key";

alter table "public"."escrow_contracts" drop constraint "escrow_contracts_contribution_id_fkey";

alter table "public"."escrow_contracts" drop constraint "escrow_contracts_engagement_id_key";

alter table "public"."escrow_contracts" drop constraint "escrow_contracts_project_id_fkey";

alter table "public"."escrow_contracts" drop constraint "valid_escrow_amount";

alter table "public"."escrow_contracts" drop constraint "valid_platform_fee";

alter table "public"."escrow_milestones" drop constraint "escrow_milestones_escrow_id_fkey";

alter table "public"."escrow_milestones" drop constraint "escrow_milestones_project_milestone_id_fkey";

alter table "public"."escrow_milestones" drop constraint "valid_milestone_amount";

alter table "public"."escrow_status" drop constraint "valid_amounts";

alter table "public"."kindler_projects" drop constraint "kindler_projects_kindler_id_fkey";

alter table "public"."kindler_projects" drop constraint "kindler_projects_project_id_fkey";

alter table "public"."profiles" drop constraint "profiles_id_fkey";

alter table "public"."project_milestones" drop constraint "project_milestones_milestone_id_fkey";

alter table "public"."project_milestones" drop constraint "project_milestones_project_id_fkey";

alter table "public"."project_milestones" drop constraint "project_milestones_project_id_milestone_id_key";

alter table "public"."project_pitch" drop constraint "project_pitch_project_id_fkey";

alter table "public"."project_tag_relationships" drop constraint "project_tag_relationships_project_id_fkey";

alter table "public"."project_tag_relationships" drop constraint "project_tag_relationships_tag_id_fkey";

alter table "public"."project_tags" drop constraint "project_tags_color_check";

alter table "public"."project_tags" drop constraint "project_tags_name_key";

alter table "public"."project_updates" drop constraint "project_updates_author_id_fkey";

alter table "public"."project_updates" drop constraint "project_updates_project_id_fkey";

alter table "public"."projects" drop constraint "check_min_investment_less_than_target";

alter table "public"."projects" drop constraint "check_positive_target_amount";

alter table "public"."projects" drop constraint "projects_owner_id_fkey";

drop function if exists "public"."set_updated_at"();

drop function if exists "public"."update_modified_column"();

drop function if exists "public"."update_project_on_investment"();

drop function if exists "public"."validate_min_investment"();

alter table "public"."comments" drop constraint "comments_pkey";

alter table "public"."community" drop constraint "community_pkey";

alter table "public"."contributions" drop constraint "contributions_pkey";

alter table "public"."escrow_contracts" drop constraint "escrow_contracts_pkey";

alter table "public"."escrow_milestones" drop constraint "escrow_milestones_pkey";

alter table "public"."escrow_status" drop constraint "escrow_status_pkey";

alter table "public"."kindler_projects" drop constraint "kindler_projects_pkey";

alter table "public"."profiles" drop constraint "profiles_pkey";

alter table "public"."project_milestones" drop constraint "project_milestones_pkey";

alter table "public"."project_pitch" drop constraint "project_pitch_pkey";

alter table "public"."project_tag_relationships" drop constraint "project_tag_relationships_pkey";

alter table "public"."project_tags" drop constraint "project_tags_pkey";

alter table "public"."project_updates" drop constraint "project_updates_pkey";

alter table "public"."projects" drop constraint "projects_pkey";

drop index if exists "public"."comments_pkey";

drop index if exists "public"."community_pkey";

drop index if exists "public"."community_project_id_idx";

drop index if exists "public"."community_update_id_idx";

drop index if exists "public"."contributions_pkey";

drop index if exists "public"."escrow_contracts_contract_id_key";

drop index if exists "public"."escrow_contracts_engagement_id_key";

drop index if exists "public"."escrow_contracts_pkey";

drop index if exists "public"."escrow_milestones_pkey";

drop index if exists "public"."escrow_status_pkey";

drop index if exists "public"."idx_escrow_status_escrow_id";

drop index if exists "public"."idx_escrow_status_last_updated";

drop index if exists "public"."idx_escrow_status_metadata";

drop index if exists "public"."idx_escrow_status_status";

drop index if exists "public"."idx_kindler_projects_project_id";

drop index if exists "public"."idx_project_updates_author_id";

drop index if exists "public"."idx_project_updates_project_id";

drop index if exists "public"."idx_projects_owner_id";

drop index if exists "public"."kindler_projects_pkey";

drop index if exists "public"."profiles_pkey";

drop index if exists "public"."project_milestones_pkey";

drop index if exists "public"."project_milestones_project_id_milestone_id_key";

drop index if exists "public"."project_pitch_pkey";

drop index if exists "public"."project_tag_relationships_pkey";

drop index if exists "public"."project_tags_name_key";

drop index if exists "public"."project_tags_pkey";

drop index if exists "public"."project_updates_pkey";

drop index if exists "public"."projects_pkey";

drop table "public"."comments";

drop table "public"."community";

drop table "public"."contributions";

drop table "public"."escrow_contracts";

drop table "public"."escrow_milestones";

drop table "public"."escrow_status";

drop table "public"."kindler_projects";

drop table "public"."profiles";

drop table "public"."project_milestones";

drop table "public"."project_pitch";

drop table "public"."project_tag_relationships";

drop table "public"."project_tags";

drop table "public"."project_updates";

drop table "public"."projects";

drop type "public"."escrow_status_type";

drop type "public"."milestone_status";

drop type "public"."user_role";


