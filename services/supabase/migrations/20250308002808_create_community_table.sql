CREATE TABLE community (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    project_id uuid NOT NULL,
    update_id uuid NOT NULL,
    comment_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT community_pkey PRIMARY KEY ("id"),
    CONSTRAINT community_project_id_fkey FOREIGN KEY ("project_id") REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT community_update_id_fkey FOREIGN KEY ("update_id") REFERENCES project_updates (id) ON DELETE CASCADE,
    CONSTRAINT comment_id_fkey FOREIGN KEY ("comment_id") REFERENCES comments(id) ON DELETE CASCADE 
);

CREATE INDEX "community_project_id_idx" ON "public"."community" ("project_id");
CREATE INDEX "community_update_id_idx" ON "public"."community" ("update_id");