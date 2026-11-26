export interface ProductTourStep {
	id: string
	targetSelector: string
	titleKey: string
	bodyKey: string
}

export type ProductTourRole = 'donor' | 'creator'

export interface ProductTourAdapter {
	getSteps(role: ProductTourRole): ProductTourStep[]
}
