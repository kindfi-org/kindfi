export interface AchievementCardProps {
	id: string
	title: string
	description: string
	status: 'completed' | 'in-progress' | 'locked'
	icon: 'trophy' | 'award' | 'heart' | 'star' | 'diamond' | 'users'
	/** Progress percentage for in-progress achievements (0-100) */
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
