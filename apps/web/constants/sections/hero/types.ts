export type HeroIcon =
	| 'Rocket'
	| 'Leaf'
	| 'Heart'
	| 'NewspaperIcon'
	| 'Stethoscope'
	| 'UtensilsCrossed'
	| 'Baby'
	| 'Sprout'
	| 'Coins'
	| 'GraduationCap'
	| 'HandHelping'
	| 'LineChart'

export interface HeroCategory {
	id: string
	icon: HeroIcon
	label: string
	color: string
}

export interface HeroStat {
	id: string
	value: string
	label: string
	icon: string
	highlight?: boolean
}

export interface HeroContent {
	title: string
	subtitle: string
	description: string
	cta: {
		primary: string
		secondary: string
	}
	categories: HeroCategory[]
	secondaryCategories: HeroCategory[]
	stats: HeroStat[]
}
