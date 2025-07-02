create table "public"."projects" (
    "id" uuid not null default uuid_generate_v4(),
    "title" text not null,
    "description" text,
    "current_amount" numeric(12,2) not null default 0,
    "target_amount" numeric(12,2) not null,
    "min_investment" numeric(12,2) not null,
    "percentage_complete" numeric(5,2) not null default 0,
    "investors_count" integer not null default 0,
    "created_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone default CURRENT_TIMESTAMP,
    "category_id" text,
    "image_url" text,
    "kinder_id" uuid not null
);


CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."projects" add constraint "check_min_investment_less_than_target" CHECK ((min_investment <= target_amount)) not valid;

alter table "public"."projects" validate constraint "check_min_investment_less_than_target";

alter table "public"."projects" add constraint "check_positive_target_amount" CHECK ((target_amount > (0)::numeric)) not valid;

alter table "public"."projects" validate constraint "check_positive_target_amount";

alter table "public"."projects" add constraint "projects_kinder_id_fkey" FOREIGN KEY (kinder_id) REFERENCES auth.users(id) not valid;

alter table "public"."projects" validate constraint "projects_kinder_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_project_on_investment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    UPDATE public.projects
    SET
        current_amount = current_amount + NEW.amount,
        percentage_complete = LEAST((current_amount + NEW.amount) / target_amount * 100, 100),
        investors_count = investors_count + 1
    WHERE id = NEW.project_id;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_min_investment()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    min_invest DECIMAL(12, 2);
BEGIN
    -- Fetch the minimum investment amount for the project
    SELECT min_investment INTO min_invest
    FROM public.projects
    WHERE id = NEW.project_id;

    -- Validate the investment amount
    IF NEW.amount < min_invest THEN
        RAISE EXCEPTION 'Investment amount must be at least %', min_invest;
    END IF;

    RETURN NEW;
END;
$function$
;

grant delete on table "public"."projects" to "anon";

grant insert on table "public"."projects" to "anon";

grant references on table "public"."projects" to "anon";

grant select on table "public"."projects" to "anon";

grant trigger on table "public"."projects" to "anon";

grant truncate on table "public"."projects" to "anon";

grant update on table "public"."projects" to "anon";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

create policy "Allow authenticated users to create projects"
on "public"."projects"
as permissive
for insert
to public
with check (((auth.role() = 'authenticated'::text) AND (auth.uid() = kinder_id)));


create policy "Allow project owners to update their projects"
on "public"."projects"
as permissive
for update
to public
using ((auth.uid() = kinder_id));


create policy "Allow public read access to projects"
on "public"."projects"
as permissive
for select
to public
using (true);


CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_modified_column();
