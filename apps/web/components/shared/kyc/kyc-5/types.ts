export interface FinalReviewProps {
	onBack: () => void
	onSubmit: () => void
	onStepChange: (step: number) => void
	kycData: {
		personalInfo: {
			fullName: string
			dateOfBirth: string
			nationality: string
		}
		documents: {
			documentType: string
			frontImage: File | null
			backImage: File | null
			extractedData: any
		}
		address: {
			street: string
			city: string
			country: string
			proofDocument: File | null
		}
	}
}

export interface ReviewSectionProps {
	title: string
	children: React.ReactNode
	onEdit: () => void
}
