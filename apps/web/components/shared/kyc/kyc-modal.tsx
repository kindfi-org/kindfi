'use client'

import { useState } from 'react'
import { Dialog, DialogContent } from '~/components/base/dialog'
import {
	type IdentityFormValues,
	IdentityVerification,
} from '~/components/shared/kyc/kyc-1'

// Import other KYC steps as needed (for future implementation)
// import IDDocumentUpload from '../shared/kyc/kyc-2/kyc-2-upload'
// import ProofOfFaceVerification from '../shared/kyc/kyc-3/kyc-3'
// import ProofOfAddressUpload from '../shared/kyc/kyc-4/kyc-4-upload'
// import FinalReview from '../shared/kyc/kyc-5/final-review'

interface KYCModalProps {
	isOpen: boolean
	onClose: () => void
}

export function KYCModal({ isOpen, onClose }: KYCModalProps) {
	const [currentStep, setCurrentStep] = useState(1)
	const [kycData, setKycData] = useState({
		identityInfo: {} as IdentityFormValues,
		documentInfo: {},
		faceVerification: {},
		addressInfo: {},
	})

	const handleIdentitySubmit = (data: IdentityFormValues) => {
		setKycData((prev) => ({
			...prev,
			identityInfo: data,
		}))
		setCurrentStep(2)

		// In a real implementation, you would navigate to step 2
		// For now, let's just close the modal since other steps are not implemented yet
		console.log('Identity verification data submitted:', data)
		console.log('Ready to proceed to step 2 (Document Upload)')
	}

	const handleCancel = () => {
		// Reset state if needed
		onClose()
	}

	// Function to go back to previous step
	const _handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1))
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-xl p-0">
				{currentStep === 1 && (
					<IdentityVerification
						onCancel={handleCancel}
						onNext={handleIdentitySubmit}
						defaultValues={kycData.identityInfo}
					/>
				)}

				{/* Step 2: ID Document Upload (to be implemented) */}
				{/* {currentStep === 2 && (
          <IDDocumentUpload
            onBack={handleBack}
            onNext={(data) => {
              setKycData((prev) => ({ ...prev, documentInfo: data }));
              setCurrentStep(3);
            }}
          />
        )} */}

				{/* Additional KYC steps will be implemented here */}
			</DialogContent>
		</Dialog>
	)
}
