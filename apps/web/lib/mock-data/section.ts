import type { AchievementCardProps } from '~/lib/types'

export const ACHIEVEMENT_CARDS: AchievementCardProps[] = [
	{
		id: 'first-support',
		title: 'First Support',
		description: 'Completed your first support action',
		status: 'completed',
		icon: 'trophy',
	},
	{
		id: 'community-builder',
		title: 'Community Builder',
		description: 'Help build our community',
		status: 'in-progress',
		icon: 'heart',
		progressPercentage: 65,
	},
	{
		id: 'serial-supporter',
		title: 'Serial Supporter',
		description: 'Support multiple projects',
		status: 'locked',
		icon: 'star',
	},
	{
		id: 'impact-leader',
		title: 'Impact Leader',
		description: 'Lead by example in community impact',
		status: 'locked',
		icon: 'award',
	},
	{
		id: 'diamond-impact',
		title: 'Diamond Impact',
		description: 'Achieve the highest level of impact',
		status: 'locked',
		icon: 'diamond',
	},
	{
		id: 'network-effect',
		title: 'Network Effect',
		description: 'Create a network of supporters',
		status: 'locked',
		icon: 'users',
	},
]

export const NFTDATA = [
	{
		id: '1',
		title: 'Impact NFT 1',
		project: 'Project X',
		imageUrl: '/images/nft1.png',
		description: 'This NFT represents the first milestone in Project X.',
	},
	{
		id: '2',
		title: 'Impact NFT 2',
		project: 'Project Y',
		imageUrl: '/images/nft2.png',
		description: 'A unique collectible from Project Y.',
	},
	{
		id: '3',
		title: 'Impact NFT 3',
		project: 'Project Z',
		imageUrl: '/images/nft3.png',
		description: 'Commemorating a special achievement in Project Z.',
	},
	{
		id: '4',
		title: 'Impact NFT 4',
		project: 'Project X',
		imageUrl: '/images/nft4.png',
		description: 'A limited edition NFT from Project X.',
	},
	{
		id: '5',
		title: 'Impact NFT 5',
		project: 'Project Y',
		imageUrl: '/images/nft5.png',
		description: 'Exclusive collectible from Project Y.',
	},
	{
		id: '6',
		title: 'Impact NFT 6',
		project: 'Project Z',
		imageUrl: '/images/nft6.png',
		description: 'A token of appreciation from Project Z.',
	},
]
