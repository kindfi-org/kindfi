import CommunitySection from '~/components/sections/home/community-section'
import CreatorSection from '~/components/sections/home/creator-section'
import Hero from '~/components/sections/home/hero-section'
import { InvestmentModelsSection } from '~/components/sections/home/invest-models-section'
import NewInvestorGuide from '~/components/sections/home/investor-guide-section'
import ProjectJourney from '~/components/sections/home/journey-section'
import { WhyInvestSection } from '~/components/sections/home/participate-section'
import { ProjectsShowcase } from '~/components/sections/home/projects-component'
import LatamWeb3Platform from '~/components/sections/home/showcast-section'

const projects = [
	{
		image: '/images/kids.webp',
		category: 'Child Welfare',
		title: 'Healthy Kids Workshop',
		description:
			'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica. Together, we can ensure a brighter future for every child.',
		currentAmount: 22800,
		targetAmount: 25000,
		investors: 18,
		minInvestment: 5,
		percentageComplete: 90,
		tags: ['NGO', 'NUTRITION', 'CHILDREN'],
	},
	{
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
		tags: ['ENVIRONMENT', 'ECOLOGICAL', 'SUSTAINABLE'],
	},
	{
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
		tags: ['ANIMALS', 'CARE', 'COMMUNITY'],
	},
	{
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
		tags: ['HUMANITARIAN', 'DISASTER RELIEF', 'COMMUNITY SUPPORT'],
	},
	{
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
		tags: ['CULTURE', 'INDIGENOUS', 'ART', 'TRADITIONS'],
	},
	{
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
		tags: ['WATER', 'HEALTH', 'COMMUNITY'],
	},
	{
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
		tags: ['EDUCATION', 'CHILDREN', 'FUTURE'],
	},
	{
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
		tags: ['HEALTHCARE', 'COMMUNITY', 'IMPACT'],
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
