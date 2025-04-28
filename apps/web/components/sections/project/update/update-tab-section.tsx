/**
 * @description      : update tab section in the project details with Supabase integration
 * @author           : pheobeayo
 * @group            : ODhack 12 contributor
 * @created          : 25/03/2025 - 10:36:35
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 25/03/2025
 * - Author          : pheobeayo
 * - Modification    : fixed the update tab section in the Project Details
 * - Version         : 2.0.0
 * - Date            : [Current Date]
 * - Author          : [Your Name]
 * - Modification    : Implemented Supabase integration for project updates
 **/
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { UpdateCard } from "./update-card";
import { LoadMoreButton } from "./load-more-button";
import { Button } from "~/components/base/button";
import { Loader2, Plus } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { UpdateForm } from "./update-form";

export function ProjectUpdatesTabSection() {
  const { projectId } = useParams();
  const [isCreatingUpdate, setIsCreatingUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 2;

  // Use TanStack Query to fetch project updates
  const {
    data: updates,
    isLoading,
    error,
    refetch,
  } = useSupabaseQuery(["projectUpdates", projectId, page], (supabase) =>
    supabase
      .from("project_updates")
      .select("*, user:created_by(name, avatar_url)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)
  );

  // Check if user is a Kindler (project owner)
  // This would typically come from a user context or auth hook
  const isKindler = true; // Placeholder - replace with actual auth logic

  // Mutation for creating a new update
  const createUpdateMutation = useSupabaseMutation(
    (supabase, newUpdate) =>
      supabase.from("project_updates").insert([
        {
          ...newUpdate,
          project_id: projectId,
        },
      ]),
    {
      onSuccess: () => {
        refetch();
        setIsCreatingUpdate(false);
      },
    }
  );

  // Mutation for updating an existing update
  const updateUpdateMutation = useSupabaseMutation(
    (supabase, { id, ...updateData }) =>
      supabase.from("project_updates").update(updateData).eq("id", id),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  // Mutation for deleting an update
  const deleteUpdateMutation = useSupabaseMutation(
    (supabase, id) => supabase.from("project_updates").delete().eq("id", id),
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const handleLoadMore = async (): Promise<void> => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleCreateUpdate = (data) => {
    createUpdateMutation.mutate(data);
  };

  const handleEditUpdate = (id, data) => {
    updateUpdateMutation.mutate({ id, ...data });
  };

  const handleDeleteUpdate = (id) => {
    deleteUpdateMutation.mutate(id);
  };

  // Setup real-time subscription
  useEffect(() => {
    const supabase = createClientComponentClient();

    // Subscribe to changes in the project_updates table for this project
    const channel = supabase
      .channel(`project-updates-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "project_updates",
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          // Refetch data when any change occurs
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, refetch]);

  return (
    <section
      className="w-full max-w-5xl mx-auto py-10 px-4"
      aria-labelledby="updates-tab-section-title"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 id="updates-tab-section-title" className="text-3xl font-bold">
          Project Updates
        </h1>
        {isKindler && (
          <Button
            onClick={() => setIsCreatingUpdate(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Update
          </Button>
        )}
      </div>

      {isCreatingUpdate && (
        <UpdateForm
          onSubmit={handleCreateUpdate}
          onCancel={() => setIsCreatingUpdate(false)}
          isSubmitting={createUpdateMutation.isLoading}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          Failed to load updates. Please try again.
        </div>
      ) : updates?.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No updates available yet.
        </div>
      ) : (
        <>
          <UpdateCard
            data={updates}
            updatesUrl={`/projects/${projectId}/updates`}
            canManageUpdates={isKindler}
            onEdit={handleEditUpdate}
            onDelete={handleDeleteUpdate}
          />
          {updates.length >= pageSize && (
            <LoadMoreButton onLoadMore={handleLoadMore} />
          )}
        </>
      )}
    </section>
  );
}
