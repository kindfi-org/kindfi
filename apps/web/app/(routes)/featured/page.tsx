import { CTASection } from '~/components/featured/cta-section'
import { FeaturedCreators } from '~/components/featured/featured-creators'
import { HeroSection } from '~/components/featured/hero-section'
import { ProjectsGrid } from '~/components/featured/projects-grid'
import {
	featuredCreators,
	featuredProjects,
} from '~/lib/mock-data/featured-projects/mock-featured-projets'

export function FeaturedPage() {
	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<HeroSection
				title="The Most Successful"
				highlight="Fundraising Campaigns"
				subtitle="Explore the top projects from trusted creators who have already made a difference."
				badge="Verified Impact"
			/>

			{/* Featured Projects */}
			<ProjectsGrid
				projects={featuredProjects}
				title="Featured Projects"
				description="Discover verified projects making real impact worldwide."
			/>

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
	)
}
