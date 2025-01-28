export interface ShowcaseFeature {
	id: string
	title: string
	description: string
	icon: string
	stats?: {
		value: string
		label: string
	}
	checkList?: { id: string; text: string }[]
}

export interface ShowcaseStat {
	id: string
	value: string
	label: string
	icon: string
}

export interface ShowcaseContent {
	title: {
		main: string
		highlight: string
	}
	description: string
	features: ShowcaseFeature[]
	bottomInfo: {
		text: string
		link: {
			text: string
			url: string
		}
	}
	stats: ShowcaseStat[]
}
