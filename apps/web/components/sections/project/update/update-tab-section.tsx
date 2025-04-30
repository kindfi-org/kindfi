"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Loader2, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "~/components/base/button";
import { LoadMoreButton } from "./load-more-button";
import { UpdateCard } from "./update-card";
import { UpdateForm } from "./update-form";
import { createClient } from "~/lib/supabase/client";

// Define types for project updates based on actual DB structure
type ProjectUpdate = {
  id: string;
  project_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: {
    name?: string;
    avatar_url?: string;
  };
};

export function ProjectUpdatesTabSection() {
  const projectId = "0e88dd52-70a7-4418-b4cd-fc2f1e5fb036";
  const [isCreatingUpdate, setIsCreatingUpdate] = useState(false);
  const [page, setPage] = useState(1);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 2;

  // Check if user is a Kindler (project owner)
  // This would typically come from a user context or auth hook
  const isKindler = true; // Placeholder - replace with actual auth logic

  // Fetch project updates
  const fetchUpdates = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      console.log(
        `Fetching updates for project: ${projectId}, page: ${page}, pageSize: ${pageSize}`
      );

      const { data, error } = await supabase
        .from("project_updates")
        .select("*, user:author_id(name, avatar_url)")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) {
        console.error("Error fetching updates:", error);
        throw error;
      }

      console.log("Fetched updates:", data);

      setUpdates((prevUpdates) =>
        page === 1 ? data : [...prevUpdates, ...data]
      );
    } catch (err) {
      console.error("Failed to fetch updates:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch updates")
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new update
  const handleCreateUpdate = async (data: { content: string }) => {
    try {
      setIsSubmitting(true);
      const supabase = createClient();

      console.log("Creating update:", { ...data, project_id: projectId });

      const { error } = await supabase.from("project_updates").insert([
        {
          ...data,
          project_id: projectId,
          // In a real app, you would get the author_id from the authenticated user
          author_id: "current-user-id", // This should be replaced with the actual user ID
        },
      ]);

      if (error) {
        console.error("Error creating update:", error);
        throw error;
      }

      console.log("Update created successfully");

      // Refetch updates after creating a new one
      setPage(1);
      await fetchUpdates();
      setIsCreatingUpdate(false);
    } catch (err) {
      console.error("Error creating update:", err);
      alert("Failed to create update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing update
  const handleEditUpdate = async (id: string, data: { content: string }) => {
    try {
      setIsSubmitting(true);
      const supabase = createClient();

      console.log("Updating update:", { id, ...data });

      const { error } = await supabase
        .from("project_updates")
        .update(data)
        .eq("id", id);

      if (error) {
        console.error("Error updating update:", error);
        throw error;
      }

      console.log("Update edited successfully");

      // Refetch updates after editing
      await fetchUpdates();
    } catch (err) {
      console.error("Error updating update:", err);
      alert("Failed to update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an update
  const handleDeleteUpdate = async (id: string): Promise<void> => {
    try {
      const supabase = createClient();

      console.log("Deleting update:", id);

      const { error } = await supabase
        .from("project_updates")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting update:", error);
        throw error;
      }

      console.log("Update deleted successfully");

      // Refetch updates after deleting
      await fetchUpdates();
      return Promise.resolve();
    } catch (err) {
      console.error("Error deleting update:", err);
      alert("Failed to delete update. Please try again.");
      return Promise.reject(err);
    }
  };

  // Load more updates
  const handleLoadMore = async () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Fetch updates when component mounts or page changes
  useEffect(() => {
    fetchUpdates();
  }, [page, projectId]);

  // Setup real-time subscription
  useEffect(() => {
    const supabase = createClient();

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
        (payload) => {
          console.log("Real-time update received:", payload);
          // Refetch data when any change occurs
          fetchUpdates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  return (
    <section
      className="w-full max-w-5xl mx-auto py-10 px-4"
      aria-labelledby="updates-tab-section-title"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 id="updates-tab-section-title" className="text-2xl font-bold">
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
          isSubmitting={isSubmitting}
        />
      )}

      {isLoading && page === 1 ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          Failed to load updates. Please try again.
          <Button onClick={fetchUpdates} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      ) : updates.length === 0 ? (
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
