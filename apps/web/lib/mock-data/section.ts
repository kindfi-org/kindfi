import type { AchievementCardProps } from '~/lib/types'

export const ACHIEVEMENT_CARDS: AchievementCardProps[] = [
	{
		title: 'First Support',
		subtitle: 'Earned',
		status: 'earned',
		icon: 'trophy',
	},
	{
		title: 'Community Builder',
		subtitle: 'In Progress',
		status: 'in-progress',
		icon: 'heart',
		progressPercentage: 23, // Progress percentage (0-100)
	},
	{
		title: 'Serial Supporter',
		subtitle: 'Locked',
		status: 'locked',
		icon: 'star',
	},
	{
		title: 'Impact Leader',
		subtitle: 'Locked',
		status: 'locked',
		icon: 'award',
	},
	{
		title: 'Diamond Impact',
		subtitle: 'Locked',
		status: 'locked',
		icon: 'diamond',
	},
	{
		title: 'Network Effect',
		subtitle: 'Locked',
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
