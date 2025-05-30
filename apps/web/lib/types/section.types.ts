export interface AchievementCardProps {
	title: string
	subtitle?: string
	status: 'earned' | 'in-progress' | 'locked'
	icon: 'trophy' | 'award' | 'heart' | 'star' | 'diamond' | 'users'
	progressPercentage?: number
}
export interface NFTProps {
	id: string
	title: string
	project: string
	imageUrl: string
	description: string
}

export interface NFTCardProps {
	id: string
	title: string
	project: string
	imageUrl?: string
	onClick?: () => void
}

export interface StatsProps {
	totalNFTs: number
	rareItems: number
	collections: number
}
