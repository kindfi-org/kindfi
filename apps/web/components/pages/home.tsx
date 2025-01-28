import CommunitySection from '~/components/sections/home/community-section'
import CreatorSection from '~/components/sections/home/creator-section'
import Hero from '~/components/sections/home/hero-section'
import { InvestmentModelsSection } from '~/components/sections/home/invest-models-section'
import NewInvestorGuide from '~/components/sections/home/investor-guide-section'
import ProjectJourney from '~/components/sections/home/journey-section'
import { WhyInvestSection } from '~/components/sections/home/participate-section'
import { ProjectsShowcase } from '~/components/sections/home/projects-component'
import LatamWeb3Platform from '~/components/sections/home/showcast-section'
import { projects, showcaseContent } from '~/constants/home'

export function HomeDashboard() {
	return (
		<>
			<Hero />
			<ProjectJourney />
			<ProjectsShowcase
				title={showcaseContent.title}
				subtitle={showcaseContent.subtitle}
				projects={projects}
			/>
			<WhyInvestSection />
			<InvestmentModelsSection />
			<NewInvestorGuide />
			<LatamWeb3Platform />
			<CommunitySection />
			<CreatorSection />
		</>
	)
}
