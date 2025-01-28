export interface JourneyStep {
	number: number
	title: string
	description: string
	active: boolean
	icon: string
}

export interface JourneyContent {
	title: {
		text: string
		highlight: string
	}
	description: string
	toggleButtons: {
		project: string
		investor: string
	}
	actionButtons: {
		project: string
		investor: string
	}
	projectSteps: JourneyStep[]
	investorSteps: JourneyStep[]
}
