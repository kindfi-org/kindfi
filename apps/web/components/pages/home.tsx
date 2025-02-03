import dynamic from 'next/dynamic'
import {
	type Money,
	type Percentage,
	type Project,
	createMoney,
	createPercentage,
} from '~/lib/types'

const Hero = dynamic(
	() => import('~/components/sections/home/hero').then((mod) => mod.Hero),
	{
		ssr: true, // Rendered on the server to enhance initial load and SEO performance
		loading: () => <p>Loading Hero Section...</p>,
	},
)
const UserJourney = dynamic(
	() =>
		import('~/components/sections/home/user-journey').then(
			(mod) => mod.UserJourney,
		),
	{
		loading: () => <p>Loading User Journey...</p>,
	},
)
const HighlightedProjects = dynamic(
	() =>
		import('~/components/sections/home/highlighted-projects').then(
			(mod) => mod.HighlightedProjects,
		),
	{
		loading: () => <p>Loading Highlighted Projects...</p>,
	},
)
const JoinUs = dynamic(
	() => import('~/components/sections/home/join-us').then((mod) => mod.JoinUs),
	{
		loading: () => <p>Loading Join Us...</p>,
	},
)
const HowItWorks = dynamic(
	() =>
		import('~/components/sections/home/how-it-works').then(
			(mod) => mod.HowItWorks,
		),
	{
		loading: () => <p>Loading How It Works...</p>,
	},
)
const NewUserGuide = dynamic(
	() =>
		import('~/components/sections/home/new-user-guide').then(
			(mod) => mod.NewUserGuide,
		),
	{
		loading: () => <p>Loading New User Guide...</p>,
	},
)
const PlatformOverview = dynamic(
	() =>
		import('~/components/sections/home/platform-overview').then(
			(mod) => mod.PlatformOverview,
		),
	{
		loading: () => <p>Loading Platform Overview...</p>,
	},
)
const Community = dynamic(
	() =>
		import('~/components/sections/home/community').then((mod) => mod.Community),
	{
		loading: () => <p>Loading Community...</p>,
	},
)
const FinalCTA = dynamic(
	() =>
		import('~/components/sections/home/final-cta').then((mod) => mod.FinalCTA),
	{
		loading: () => <p>Loading Final Call-to-Action...</p>,
	},
)

const projects: Project[] = [
	{
		id: 'healthy-kids-id',
		image: '/images/kids.webp',
		category: 'Child Welfare',
		title: 'Healthy Kids Workshop',
		description:
			'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica...',
		currentAmount: { __brand: 'money', value: 22800 } as unknown as Money,
		targetAmount: { __brand: 'money', value: 25000 } as unknown as Money,
		investors: 18,
		minInvestment: { __brand: 'money', value: 5 } as unknown as Money,
		percentageComplete: {
			__brand: 'percentage',
			value: 90,
		} as unknown as Percentage,
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
		currentAmount: createMoney(54000),
		targetAmount: createMoney(60000),
		investors: 35,
		minInvestment: createMoney(10),
		percentageComplete: createPercentage(90),
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
		currentAmount: createMoney(15500),
		targetAmount: createMoney(20000),
		investors: 22,
		minInvestment: createMoney(8),
		percentageComplete: createPercentage(77),
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
		currentAmount: createMoney(30000),
		targetAmount: createMoney(50000),
		investors: 28,
		minInvestment: createMoney(20),
		percentageComplete: createPercentage(60),
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
		currentAmount: createMoney(34000),
		targetAmount: createMoney(50000),
		investors: 29,
		minInvestment: createMoney(15),
		percentageComplete: createPercentage(68),
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
		currentAmount: createMoney(18500),
		targetAmount: createMoney(25000),
		investors: 20,
		minInvestment: createMoney(20),
		percentageComplete: createPercentage(74),
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
		currentAmount: createMoney(40000),
		targetAmount: createMoney(55000),
		investors: 40,
		minInvestment: createMoney(10),
		percentageComplete: createPercentage(73),
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
		currentAmount: createMoney(32000),
		targetAmount: createMoney(45000),
		investors: 30,
		minInvestment: createMoney(20),
		percentageComplete: createPercentage(71),
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
			<UserJourney />
			<HighlightedProjects />
			<JoinUs />
			<HowItWorks />
			<NewUserGuide />
			<PlatformOverview />
			<Community />
			<FinalCTA />
		</>
	)
}
