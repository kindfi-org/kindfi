import type {
	AboutProjectProps,
	MediaItem,
	Project,
	StatItem,
	TabItem,
	TimelineEvent,
	UpdateItem,
} from '~/lib/types'
import { createMoney, createPercentage } from '~/lib/utils/types-helpers'

export const projects: Project[] = [
	{
		id: 'healthy-kids-id',
		image: '/images/kids.webp',
		category: 'Child Welfare',
		title: 'Healthy Kids Workshop',
		description:
			'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica. Together, we can ensure a brighter future for every child.',
		currentAmount: createMoney(22800),
		targetAmount: createMoney(25000),
		investors: 18,
		minInvestment: createMoney(5),
		percentageComplete: createPercentage(90),
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
		minInvestment: createMoney(12),
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

export const projectTabsData: TabItem[] = [
	{ id: 'overview', label: 'Project Overview', content: '<ProjectOverview />' },
	{ id: 'impact', label: 'Your Impact', content: '<YourImpactSection />' },
	{
		id: 'updates',
		label: 'Projects Updates',
		content: '<ProjectUpdatesSection />',
	},
	{
		id: 'showcase',
		label: 'Success Gallery',
		content: '<ProjectShowcaseSection />',
	},
]

export const statsData: StatItem[] = [
	{
		id: 'stat-1',
		label: 'Contribution',
		value: '$100',
		bgColor: 'bg-blue-100',
		textColor: 'text-blue-700',
		icon: '💰',
	},
	{
		id: 'stat-2',
		label: 'NFT Earned',
		value: '1',
		bgColor: 'bg-purple-100',
		textColor: 'text-purple-700',
		icon: '🏆',
	},
	{
		id: 'stat-3',
		label: 'Referrals',
		value: '2',
		bgColor: 'bg-green-100',
		textColor: 'text-green-700',
		icon: '👥',
	},
]

export const updatesData: UpdateItem[] = [
	{
		id: 'update-1',
		title: 'Behind the Scenes Update #1',
		description: 'Exclusive project insights and progress updates...',
		date: '2 days ago',
		exclusive: true,
	},
	{
		id: 'update-2',
		title: 'Behind the Scenes Update #2',
		description: 'Exclusive project insights and progress updates...',
		date: '2 days ago',
		exclusive: true,
	},
]

export const statsDataUpdates: StatItem[] = [
	{
		id: 'stat-1',
		label: 'Total Raised',
		value: '$100,000',
		bgColor: 'bg-blue-100',
		textColor: 'text-blue-700',
		icon: '💰',
	},
	{
		id: 'stat-2',
		label: 'Supporters',
		value: '234',
		bgColor: 'bg-purple-100',
		textColor: 'text-purple-700',
		icon: '👥',
	},
	{
		id: 'stat-3',
		label: 'NFTs Minted',
		value: '156',
		bgColor: 'bg-green-100',
		textColor: 'text-green-700',
		icon: '🏆',
	},
]

export const timelineEvents: TimelineEvent[] = [
	{
		id: 'timeline-1',
		title: 'Project Launch',
		description: 'Project officially launched',
		date: 'Mar 15',
		status: 'completed',
	},
	{
		id: 'timeline-2',
		title: '50% Milestone',
		description: 'Reached halfway point',
		date: 'Apr 1',
		status: 'completed',
	},
	{
		id: 'timeline-3',
		title: 'Goal Reached',
		description: 'Successfully achieved target',
		date: 'Apr 15',
		status: 'completed',
	},
	{
		id: 'timeline-4',
		title: 'Implementation',
		description: 'Project implementation phase',
		date: 'May 1',
		status: 'pending',
	},
]

const createMediaItems = (
	count: number,
	prefix: string,
	type: 'image' | 'video' = 'image',
) =>
	Array.from({ length: count }, (_, i) => ({
		id: `${prefix.toLowerCase()}-${i + 1}`,
		src: `/images/${type}.png`,
		alt: `${prefix} ${i + 1}`,
		type,
	}))

export const successGalleryItems: MediaItem[] = createMediaItems(4, 'Success')
export const showcaseData: MediaItem[] = createMediaItems(12, 'Showcase')
export const mediaItems: MediaItem[] = [
	{
		id: 'main-video',
		src: '/images/video.png',
		alt: 'Main Video',
		type: 'video',
	},
	...createMediaItems(4, 'Thumbnail'),
]

export const projectOverviewMediaItems: MediaItem[] = [
	{
		id: 'main-video',
		type: 'video',
		src: '/images/video.png',
		alt: 'Main Video',
	},
]

export const aboutProjectProps: AboutProjectProps = {
	id: 'project-1',
	description:
		"Our initiative aims to reduce ocean plastic waste by 30% through innovative recycling technologies and community engagement programs. Working with local communities, we've established collection points and education centers.",
	highlights: [
		{
			id: 'highlight-1',
			label: 'Goal',
			value: 'Clear environmental impact',
			icon: 'target',
		},
		{
			id: 'highlight-2',
			label: 'Community',
			value: '500+ supporters',
			icon: 'user',
		},
		{
			id: 'highlight-3',
			label: 'Location',
			value: 'Global Initiative',
			icon: 'language',
		},
		{
			id: 'highlight-4',
			label: 'Verification',
			value: 'Verified by KindFi',
			icon: 'status',
		},
	],
	updates: [
		{
			id: 'update-1',
			title: 'Project Milestone 1',
			description: 'Brief update about project progress and achievements...',
			date: '2 days ago',
		},
		{
			id: 'update-2',
			title: 'Project Milestone 2',
			description: 'Brief update about project progress and achievements...',
			date: '2 days ago',
		},
	],
	titleAboveHighlights: true,
}
