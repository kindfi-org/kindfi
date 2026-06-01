export const mockStep5KycData = {
	personalInfo: {
		fullName: 'John Doe',
		dateOfBirth: '1990-01-01',
		nationality: 'United States',
	},
	documents: {
		documentType: 'Passport',
		frontImage: null,
		backImage: null,
		extractedData: {
			documentNumber: '123456789',
			expiryDate: '2025-01-01',
		},
	},
	address: {
		street: '123 Main Street',
		city: 'New York',
		country: 'United States',
		proofDocument: null,
	},
}
export const handleBack = () => {}
export const handleSubmit = () => {}
export const handleStepChange = (step: number) => alert(`Navigate to step: ${step}`)
