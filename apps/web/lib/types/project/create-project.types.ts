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
	location: string
	category: string
	tags: string[]
}
