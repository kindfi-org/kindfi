"use client";

import { LoaderIcon } from "lucide-react";
import { useSetState } from "react-use";

import { CTASection } from "~/components/featured/cta-section";
import { FeaturedCreators } from "~/components/featured/featured-creators";
import { HeroSection } from "~/components/featured/hero-section";
import { ProjectsGrid } from "~/components/shared/projects/projects-grid";
import { ProjectsHeader } from "~/components/shared/projects/projects-header";

import { useProjectsFilter } from "~/hooks/use-projects-filter";
import {
  featuredCreators,
  featuredProjects,
} from "~/lib/mock-data/featured-projects/mock-featured-projects";
import type { Project } from "~/lib/types/projects.types";

export default function FeaturedPage() {
  const [state, setState] = useSetState<{
    projects: Project[];
    viewMode: "grid" | "list";
    loading: boolean;
  }>({
    projects: featuredProjects,
    viewMode: "grid",
    loading: false,
  });
  const {
    selectedCategories,
    setSelectedCategories,
    sortOption,
    setSortOption,
    filterProjects,
    sortProjects,
  } = useProjectsFilter();
  const { projects, viewMode, loading } = state;

  const filteredProjects = filterProjects(sortProjects(projects, sortOption));

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection
        title="The Most Successful"
        highlight="Fundraising Campaigns"
        subtitle="Explore the top projects from trusted creators who have already made a difference."
        badge="Verified Impact"
      />

      {/* Featured Projects Section*/}
      <section className="container mx-auto px-6 lg:px-8 py-8">
        <ProjectsHeader
          title="Causes That Change Lives"
          subHeader="Featured Projects"
          description="Discover verified projects making real impact worldwide."
          viewMode={viewMode}
          onViewModeChange={(val) =>
            setState((prev) => ({ ...prev, viewMode: val }))
          }
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalItems={projects.length}
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderIcon className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500" />
          </div>
        ) : (
          <ProjectsGrid projects={filteredProjects} viewMode={viewMode} />
        )}
      </section>
      {/* Featured Creators */}
      <FeaturedCreators
        creators={featuredCreators}
        title="Featured Creators"
        description="Meet our most successful and trusted project creators making real change happen."
      />

      {/* CTA Section */}
      <CTASection
        title="Become a Verified Creator"
        description="Join our community of trusted project creators and start making a real difference through blockchain-verified crowdfunding."
        primaryButtonText="Start Verification Process"
        secondaryButtonText="Learn More"
      />
    </div>
  );
}
