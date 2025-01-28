export type ParticipateIcon = 'ArrowUpRight' | 'RefreshCw' | 'Megaphone'

export interface ParticipateFeature {
	id: string
	title: string
	description: string
	highlight: string
	icon: ParticipateIcon
}

export interface ParticipateCTA {
	title: string
	description: string
	buttons: {
		primary: string
		secondary: string
	}
}

export interface ParticipateContent {
	title: string
	subtitle: string
	highlightWords: string[]
	features: ParticipateFeature[]
	cta: ParticipateCTA
}
