'use client'

import { Dialog, DialogContent } from '~/components/base/dialog'
import {
	FinalReview,
	IDDocumentUpload,
	IdentityVerification,
	// ProofOfAddressUpload,
	ProofOffaceVerification,
} from '~/components/shared'
import type { IdentityFormValues } from '~/components/shared/kyc/kyc-1'
import { useKYC } from '~/hooks/use-kyc'
import type {
	DocumentType,
	ExtractedData,
} from '~/components/shared/kyc/kyc-2/types'
import type {
	ExtractedDocumentData,
	FinalReviewProps,
} from '~/lib/types/final-review-kyc5.types'

// Define a comprehensive type for all collected KYC data
export type KYCData = FinalReviewProps['kycData'] & {
	faceVerification: { selfieImage: string | null }
}

interface KYCModalProps {
	isOpen: boolean
	onClose: () => void
}

interface SubmitData {
	documentType: DocumentType
	extractedData: ExtractedData
	frontImage: File | null
	backImage: File | null
}

// interface AddressSubmitData {
// 	extractedData?: {
// 		address?: {
// 			street?: string
// 			city?: string
// 			country?: string
// 		}
// 	}
// 	file: File | null
//}





export function KYCModal({ isOpen, onClose }: KYCModalProps) {
	const {
		currentStep,
		kycData,
		isLoading,
		error,
		nextStep,
		prevStep,
		goToStep,
		updateKycData,
		handleFinalSubmit,
	} = useKYC()

	// Handles data from Step 1, converting Date to string for storage
	const handleIdentitySubmit = (data: IdentityFormValues) => {
		updateKycData({
			personalInfo: {
				...data,
				dateOfBirth: data.dateOfBirth.toISOString().split('T')[0], // Store as YYYY-MM-DD
			},
		})
		nextStep()
	}

	const handleDocumentSubmit = (data: SubmitData) => {
		const transformedData: ExtractedDocumentData = {
			documentNumber: data.extractedData.idNumber || '',
			expiryDate: data.extractedData.expiryDate || '',
			issuingCountry: '',
			issuingAuthority: data.extractedData.issuingAuthority || '',
			documentType: 'national_id',
			issuedDate: data.extractedData.issueDate || '',
			fullName: data.extractedData.fullName || '',
			dateOfBirth: '',
			nationality: data.extractedData.nationality || '',
		}

		updateKycData({
			documents: {
				documentType: data.documentType || '',
				frontImage: data.frontImage,
				backImage: data.backImage,
				extractedData: transformedData,
			},
		})
		nextStep()
	}

	// Handles data from Step 3
	const handleFaceVerificationSubmit = (data: string) => {
		updateKycData({
			faceVerification: { selfieImage: data },
		})
		nextStep()
	}

	// Handles data from Step 4
	
	// const handleAddressSubmit = (data: AddressSubmitData) => {
	// 	updateKycData({
	// 		address: {
	// 			street: data.extractedData?.address?.street || '',
	// 			city: data.extractedData?.address?.city || '',
	// 			country: data.extractedData?.address?.country || '',
	// 			proofDocument: null,
	// 		},
	// 	})
	// 	nextStep()
	// }

	const handleCancel = () => {
		onClose()
	}

	// Prepare defaultValues for Step 1, converting string back to Date
	const identityDefaultValues = {
		...kycData.personalInfo,
		dateOfBirth: kycData.personalInfo.dateOfBirth
			? new Date(kycData.personalInfo.dateOfBirth)
			: undefined,
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent
				className="p-0 sm:max-w-xl"
				aria-label="KYC Verification Process"
				aria-describedby="kyc-step-description"
			>
				<div className="sr-only" id="kyc-step-description">
					Step {currentStep} of 5 in the KYC verification process
				</div>
				{isLoading && <div className="p-4">Submitting...</div>}
				{error && <div className="p-4 text-red-500">{error}</div>}

				{currentStep === 1 && (
					<IdentityVerification
						onCancel={handleCancel}
						onNext={handleIdentitySubmit}
						defaultValues={identityDefaultValues}
					/>
				)}

				{currentStep === 2 && (
					<IDDocumentUpload onBack={prevStep} onNext={handleDocumentSubmit} />
				)}

				{currentStep === 3 && (
					<ProofOffaceVerification
						onCancel={prevStep}
						onContinue={handleFaceVerificationSubmit}
					/>
				)}

				{/* {currentStep === 4 && (
					<ProofOfAddressUpload
						onBack={prevStep}
						onNext={handleAddressSubmit}
					/>
				)} */}

				{currentStep === 5 && (
					<FinalReview
						onBack={prevStep}
						onSubmit={handleFinalSubmit}
						onStepChange={goToStep}
						kycData={kycData}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
