export interface NFTTier {
	id: string
	title: string
	support: string
	left: number
}

export interface NFTCollection {
	id: string
	title: string
	rarity: string
}

export interface Comment {
	id: string
	name: string
	badge: string
	comment: string
	likes: number
}

export const nftTiers: NFTTier[] = [
	{ id: 'uuid-1', title: 'Early Bird', support: 'Support $50+', left: 100 },
	{ id: 'uuid-2', title: 'Impact Maker', support: 'Support $100+', left: 50 },
	{
		id: 'uuid-3',
		title: 'Project Champion',
		support: 'Support $500+',
		left: 10,
	},
]

export const nftCollection: NFTCollection[] = [
	{ title: 'Early Bird', id: '#042', rarity: 'Rare' },
	{ title: 'Impact Maker', id: '#021', rarity: 'Epic' },
	{ title: 'Project Champion', id: '#007', rarity: 'Legendary' },
]

export const comments: Comment[] = [
	{
		id: 'uuid-1',
		name: 'Sarah M.',
		badge: 'Early Supporter',
		comment:
			'Amazing to see the project reach its goal! The community really came together. 🎉',
		likes: 24,
	},
	{
		id: 'uuid-2',
		name: 'David K.',
		badge: 'Project Champion',
		comment:
			'The transparency and regular updates made this journey special. Looking forward to the impact report! 📊',
		likes: 18,
	},
]
