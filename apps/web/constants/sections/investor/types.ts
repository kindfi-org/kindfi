export interface InvestorStep {
	stepNumber: number
	title: string
	description: string
	Icon: 'ExploreProject' | 'ExploreDetails' | 'Contibute'
	imageAlt: string
}

export interface InvestorContent {
	title: {
		main: string
		highlight: string
	}
	description: string
	steps: InvestorStep[]
}
