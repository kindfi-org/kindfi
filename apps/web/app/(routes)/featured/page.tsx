'use client';

import { LoaderIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { CTASection } from '~/components/featured/cta-section';
import { FeaturedCreators } from '~/components/featured/featured-creators';
import { HeroSection } from '~/components/featured/hero-section';
import { ProjectsGrid } from '~/components/shared/projects/projects-grid';
import ProjectsHeader from '~/components/shared/projects/projects-header';

import { useProjectsFilter } from '~/hooks/use-projects-filter';
import {
  featuredCreators,
  featuredProjects,
} from '~/lib/mock-data/featured-projects/mock-featured-projects';
import type { Project } from '~/lib/types/projects.types';

export default function FeaturedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const {
    selectedCategories,
    setSelectedCategories,
    sortOption,
    setSortOption,
    filterProjects,
    sortProjects,
  } = useProjectsFilter();

  // Simulate real data loading
  useEffect(() => {
    const fetchProjects = async () => {
      // In the future, this would be an API call
      setIsLoading(true);
      // Simulating network delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProjects(featuredProjects);
      setIsLoading(false);
    };

    fetchProjects();
  }, []);

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
          onViewModeChange={setViewMode}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          sortOption={sortOption}
          onSortChange={setSortOption}
          totalItems={projects.length}
        />

        {isLoading ? (
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
