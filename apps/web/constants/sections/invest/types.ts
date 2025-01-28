export interface InvestmentBenefit {
	id: string
	text: string
}

export interface InvestmentModel {
	id: string
	title: string
	description: string
	variant: 'a' | 'b' | 'c'
	icon: 'Shield' | 'Users' | 'Globe'
	benefits: InvestmentBenefit[]
}

export interface InvestmentContent {
	title: string
	subtitle: string
	highlightWords: string[]
	models: InvestmentModel[]
}
