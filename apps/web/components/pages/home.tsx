import CommunitySection from '~/components/sections/home/community-section'
import CreatorSection from '~/components/sections/home/creator-section'
import Hero from '~/components/sections/home/hero-section'
import { InvestmentModelsSection } from '~/components/sections/home/invest-models-section'
import NewInvestorGuide from '~/components/sections/home/investor-guide-section'
import ProjectJourney from '~/components/sections/home/journey-section'
import { WhyInvestSection } from '~/components/sections/home/participate-section'
import { ProjectsShowcase } from '~/components/sections/home/projects-component'
import LatamWeb3Platform from '~/components/sections/home/showcast-section'
import type { Project } from '~/lib/types'

const projects: Project[] = [
	{
		id: 'healthy-kids-id',
		image: '/images/kids.webp',
		category: 'Child Welfare',
		title: 'Healthy Kids Workshop',
		description:
			'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica...',
		currentAmount: 22800,
		targetAmount: 25000,
		investors: 18,
		minInvestment: 5,
		percentageComplete: 90,
		tags: [
			{ id: 'ngo-tag-id', text: 'NGO' },
			{ id: 'nutrition-tag-id', text: 'NUTRITION' },
			{ id: 'children-tag-id', text: 'CHILDREN' },
		],
	},
	{
		id: 'forest-restoration-id',
		image: '/images/bosques.webp',
		category: 'Environmental Protection',
		title: 'Forest Restoration Initiative',
		description:
			'Restore and reforest areas devastated by uncontrolled deforestation. Your support helps rebuild ecosystems and fight climate change.',
		currentAmount: 54000,
		targetAmount: 60000,
		investors: 35,
		minInvestment: 10,
		percentageComplete: 90,
		tags: [
			{ id: 'environment-tag-id', text: 'ENVIRONMENT' },
			{ id: 'ecological-tag-id', text: 'ECOLOGICAL' },
			{ id: 'sustainable-tag-id', text: 'SUSTAINABLE' },
		],
	},
	{
		id: 'rural-animal-shelter-id',
		image: '/images/dogs.webp',
		category: 'Animal Welfare',
		title: 'Rural Animal Shelter',
		description:
			'Provide care and shelter to homeless animals in rural communities. Help us create safe havens for animals in need.',
		currentAmount: 15500,
		targetAmount: 20000,
		investors: 22,
		minInvestment: 8,
		percentageComplete: 77,
		tags: [
			{ id: 'animals-tag-id', text: 'ANIMALS' },
			{ id: 'care-tag-id', text: 'CARE' },
			{ id: 'community-tag-id', text: 'COMMUNITY' },
		],
	},
	{
		id: 'disaster-aid-id',
		image: '/images/disaster-aid.webp',
		category: 'Disaster Relief',
		title: 'Natural Disasters Human Aid',
		description:
			'Provide critical support to communities affected by natural disasters. From emergency supplies to long-term rebuilding efforts, join us in bringing hope and recovery to those in need.',
		currentAmount: 30000,
		targetAmount: 50000,
		investors: 28,
		minInvestment: 20,
		percentageComplete: 60,
		tags: [
			{ id: 'humanitarian-tag-id', text: 'HUMANITARIAN' },
			{ id: 'disaster-tag-id', text: 'DISASTER RELIEF' },
			{ id: 'community-tag-id', text: 'COMMUNITY SUPPORT' },
		],
	},
	{
		id: 'indigenous-crafts-id',
		image: '/images/artesania.webp',
		category: 'Culture and Arts',
		title: 'Preserving Indigenous Crafts',
		description:
			'Support the preservation of indigenous craftsmanship in Costa Rica. Your contributions protect traditional techniques and cultural heritage.',
		currentAmount: 34000,
		targetAmount: 50000,
		investors: 29,
		minInvestment: 15,
		percentageComplete: 68,
		tags: [
			{ id: 'culture-tag-id', text: 'CULTURE' },
			{ id: 'indigenous-tag-id', text: 'INDIGENOUS' },
			{ id: 'art-tag-id', text: 'ART' },
		],
	},
	{
		id: 'water-for-rural-communities-id',
		image: '/images/water.webp',
		category: 'Access to Clean Water',
		title: 'Water for Rural Communities',
		description:
			'Provide access to safe drinking water in underserved rural areas. Help us install water purification systems to improve health and livelihoods.',
		currentAmount: 18500,
		targetAmount: 25000,
		investors: 20,
		minInvestment: 12,
		percentageComplete: 74,
		tags: [
			{ id: 'water-tag-id', text: 'WATER' },
			{ id: 'health-tag-id', text: 'HEALTH' },
			{ id: 'community-tag-id', text: 'COMMUNITY' },
		],
	},
	{
		id: 'empowering-education-id',
		image: '/images/education.webp',
		category: 'Education',
		title: 'Empowering Education',
		description:
			'Support education programs for children in low-income areas. Together, we can bridge the education gap and create opportunities for the next generation.',
		currentAmount: 40000,
		targetAmount: 55000,
		investors: 40,
		minInvestment: 10,
		percentageComplete: 73,
		tags: [
			{ id: 'education-tag-id', text: 'EDUCATION' },
			{ id: 'children-tag-id', text: 'CHILDREN' },
			{ id: 'future-tag-id', text: 'FUTURE' },
		],
	},
	{
		id: 'mobile-clinics-id',
		image: '/images/healthcare.webp',
		category: 'Healthcare',
		title: 'Mobile Clinics',
		description:
			'Bring essential healthcare services to remote areas through mobile clinics. Your support helps save lives and build healthier communities.',
		currentAmount: 32000,
		targetAmount: 45000,
		investors: 30,
		minInvestment: 20,
		percentageComplete: 71,
		tags: [
			{ id: 'healthcare-tag-id', text: 'HEALTHCARE' },
			{ id: 'community-tag-id', text: 'COMMUNITY' },
			{ id: 'impact-tag-id', text: 'IMPACT' },
		],
	},
]

export function HomeDashboard() {
	return (
		<>
			<Hero />
			<ProjectJourney />
			<ProjectsShowcase
				title="Causes That Change Lives and Shape a Better World"
				subtitle="Join hands to support initiatives that create lasting social, environmental, animal, artistic, and cultural impact. From protecting our planet and rescuing animals to uplifting communities and celebrating artistic expression, find a cause that moves you and make a difference today"
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
