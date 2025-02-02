interface BaseItem {
	id: string
	title: string
	description: string
	date: string
}

interface TabItem {
	id: string
	label: string
	content: string
}

interface StatItem {
	id: string
	label: string
	value: string
	bgColor: string
	textColor: string
	icon: string
}

interface UpdateItem extends BaseItem {
	id: string
	exclusive?: boolean
}

interface TimelineEvent extends BaseItem {
	id: string
	status: 'completed' | 'pending'
}

interface MediaItem {
	id: string
	type: 'image' | 'video'
	src: string
	alt: string
}
interface Highlight {
	id: string // Add id to Highlight
	label: string
	value: string
	icon: string
}

interface AboutProjectProps {
	id: string
	description: string
	highlights: Highlight[]
	updates: BaseItem[]
	titleAboveHighlights: boolean
}

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
		id: 'event-1',
		title: 'Project Launch',
		description: 'Project officially launched',
		date: 'Mar 15',
		status: 'completed',
	},
	{
		id: 'event-2',
		title: '50% Milestone',
		description: 'Reached halfway point',
		date: 'Apr 1',
		status: 'completed',
	},
	{
		id: 'event-3',

		title: 'Goal Reached',
		description: 'Successfully achieved target',
		date: 'Apr 15',
		status: 'completed',
	},
	{
		id: 'event-4',

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
