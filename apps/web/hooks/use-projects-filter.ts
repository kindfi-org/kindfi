import { useCallback } from "react";
import { useSetState } from "react-use";
import type { Project } from "~/lib/types/projects.types";

export type SortOption = "popular" | "newest" | "funding" | "supporters";

export function useProjectsFilter() {
  const [state, setState] = useSetState<{
    selectedCategories: string[];
    sortOption: SortOption;
  }>({
    selectedCategories: [],
    sortOption: "popular",
  });
  const { selectedCategories, sortOption } = state;

  const filterProjects = useCallback(
    (projects: Project[]) => {
      if (selectedCategories.length === 0) return projects;

      return projects.filter((project) => {
        // Handle different ways categories might be stored
        // 1. In the 'categories' field as a array of string

        if (
          project.categories.some((category) =>
            selectedCategories.includes(category),
          )
        ) {
          return true;
        }

        if (project.tags && project.tags.length > 0) {
          // 2. In the 'tags' array
          return project.tags.some((tag) => {
            const tagText = typeof tag === "string" ? tag : tag.text;
            return selectedCategories.includes(tagText);
          });
        }

        return false;
      });
    },
    [selectedCategories],
  );

  const sortProjects = useCallback(
    (projects: Project[], option: SortOption) => {
      const sortedProjects = [...projects];

      switch (option) {
        case "newest":
          // Fallback to current date if createdAt is not available
          return sortedProjects.sort((a, b) => {
            const dateA = a.created_at
              ? new Date(a.created_at).getTime()
              : Date.now();
            const dateB = b.created_at
              ? new Date(b.created_at).getTime()
              : Date.now();
            return dateB - dateA;
          });
        case "funding":
          return sortedProjects.sort((a, b) => {
            const percentA =
              a.percentage_complete ||
              (a.current_amount / (a.target_amount || a.goal || 1)) * 100;
            const percentB =
              b.percentage_complete ||
              (b.current_amount / (b.target_amount || b.goal || 1)) * 100;
            return percentB - percentA;
          });
        case "supporters":
          return sortedProjects.sort(
            (a, b) =>
              (b.investors_count || b.donors || 0) -
              (a.investors_count || a.donors || 0),
          );
        default:
          // 'popular' - could be based on a trending flag or other metrics
          return sortedProjects.sort((a, b) => {
            // Sort by trending flag first
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;

            // Then by featured flag
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;

            // Then by number of supporters
            return (
              (b.investors_count || b.donors || 0) -
              (a.investors_count || a.donors || 0)
            );
          });
      }
    },
    [],
  );

  return {
    selectedCategories,
    setSelectedCategories: (val: string[]) =>
      setState((prev) => ({ ...prev, selectedCategories: val })),
    sortOption,
    setSortOption: (val: SortOption) =>
      setState((prev) => ({ ...prev, sortOption: val })),
    filterProjects,
    sortProjects,
  };
}
