import type { LucideIcon } from 'lucide-react-native'

export type FeatureCardData = {
	id: string
	icon: LucideIcon
	title: string
	description: string
	stat?: string
	bulletPoints?: string[]
	iconColor: string
	backgroundColor: string
}
