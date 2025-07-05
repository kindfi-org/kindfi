export interface CreateProjectFormData {
	// Step 1: Basic Information
	title: string
	description: string
	targetAmount: number
	minimumInvestment: number

	// Step 2: Media and Links
	image: File | null
	website?: string
	socialLinks: string[]

	// Step 3: Location and Classification
	location: {
		country: string
		code: string
	}
	category: string
	tags: string[]
}

export interface Country {
	name: string
	code: string // ISO 3166-1 alpha-3
}
