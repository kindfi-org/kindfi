import { useState } from 'react'
import { Dialog, DialogClose, DialogContent } from '~/components/base/dialog' // Añadí DialogClose
import {
	type IdentityFormValues,
	IdentityVerification,
} from '~/components/shared/kyc/kyc-1'
import IDDocumentUpload from '~/components/shared/kyc/kyc-2/kyc-2-upload'
import type { DocumentType } from '~/components/shared/kyc/kyc-2/types'
import { ProofOffaceVerification } from '~/components/shared/kyc/kyc-3/kyc-3'
import { ProofOfAddressUpload } from '~/components/shared/kyc/kyc-4/kyc-4-upload'
import { FinalReview } from '~/components/shared/kyc/kyc-5/final-review'
import { submitFinalKyc, submitKycStep } from '~/lib/api/kycApi'
import { useKycContext } from '../../../hooks/kyc/useKycContext'

interface KYCModalProps {
	isOpen: boolean
	onClose: () => void
}

export function KYCModal({ isOpen, onClose }: KYCModalProps) {
	const { kycData, updateKycData, clearKycData } = useKycContext()
	const [currentStep, setCurrentStep] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const handleNext = async (
		step: number,
		data:
			| IdentityFormValues
			| {
					documentType?: DocumentType
					frontImage?: File | null
					backImage?: File | null
			  }
			| { selfie?: File | string }
			| { addressDocument?: File | string }
			| { confirmed?: boolean },
	) => {
		setLoading(true)
		setError(null)
		try {
			const formattedData = data
			if (step === 1 && 'dateOfBirth' in data) {
				const formattedData = {
					...data,
					dateOfBirth:
						data.dateOfBirth instanceof Date
							? data.dateOfBirth.toISOString().split('T')[0]
							: data.dateOfBirth,
				} as Omit<IdentityFormValues, 'dateOfBirth'> & { dateOfBirth: string }
				console.log('Data being sent to submitKycStep (Step 1):', formattedData)
			} else {
				console.log('Data being sent to submitKycStep (Step', step, '):', data)
			}

			if (step === 5) {
				const response = await submitFinalKyc(kycData)
				console.log(
					'Response from submitFinalKyc:',
					JSON.stringify(response, null, 2),
				)
			} else {
				const response = await submitKycStep(step, formattedData)
				console.log(
					'Response from submitKycStep:',
					JSON.stringify(response, null, 2),
				)
			}

			updateKycData({ [getStepKey(step)]: formattedData })
			setCurrentStep(Math.min(step + 1, 5))
		} catch (err) {
			console.error('Error in handleNext for step', step, 'Error:', err)
			setError('Error submitting data. Please try again or proceed manually.')
		} finally {
			setLoading(false)
		}
	}

	const handleProceedManually = () => {
		setError(null)
		setCurrentStep((prev) => Math.min(prev + 1, 5))
	}

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1))
	}

	const handleCancel = () => {
		setCurrentStep(1)
		clearKycData()
		setError(null)
		onClose()
	}

	const getStepKey = (step: number) => {
		switch (step) {
			case 1:
				return 'identityInfo'
			case 2:
				return 'documentInfo'
			case 3:
				return 'faceVerification'
			case 4:
				return 'addressInfo'
			case 5:
				return 'finalReview'
			default:
				return 'identityInfo'
		}
	}

	const mappedKycData = {
		personalInfo: {
			fullName: kycData.identityInfo?.fullName || '',
			dateOfBirth:
				kycData.identityInfo?.dateOfBirth instanceof Date
					? kycData.identityInfo.dateOfBirth.toISOString().split('T')[0]
					: kycData.identityInfo?.dateOfBirth || '',
			nationality: kycData.identityInfo?.nationality || '',
		},
		documents: {
			documentType: kycData.documentInfo?.documentType
				? String(kycData.documentInfo.documentType)
				: 'passport',
			frontImage: kycData.documentInfo?.frontImage || null,
			backImage: kycData.documentInfo?.backImage || null,
			extractedData: {
				documentNumber: '',
				expiryDate: '',
				issuingCountry: kycData.identityInfo?.nationality || '',
				issuingAuthority: '',
				documentType: kycData.documentInfo?.documentType
					? (String(kycData.documentInfo.documentType).toLowerCase() as
							| 'passport'
							| 'national_id'
							| 'driving_license')
					: 'passport',
				issuedDate: '',
				fullName: kycData.identityInfo?.fullName || '',
				dateOfBirth:
					kycData.identityInfo?.dateOfBirth instanceof Date
						? kycData.identityInfo.dateOfBirth.toISOString().split('T')[0]
						: kycData.identityInfo?.dateOfBirth || '',
				nationality: kycData.identityInfo?.nationality || '',
			},
		},
		address: {
			street: '',
			city: '',
			country: kycData.identityInfo?.nationality || '',
			proofDocument:
				kycData.addressInfo?.addressDocument instanceof File
					? kycData.addressInfo.addressDocument
					: null,
		},
	}

	const renderStep = () => {
		switch (currentStep) {
			case 1:
				return (
					<IdentityVerification
						onCancel={handleCancel}
						onNext={(data: IdentityFormValues) => handleNext(1, data)}
					/>
				)
			case 2:
				return (
					<IDDocumentUpload
						onBack={handleBack}
						onNext={(data) => {
							const { documentType, frontImage, backImage } = data
							handleNext(2, { documentType, frontImage, backImage })
						}}
					/>
				)
			case 3:
				return (
					<ProofOffaceVerification
						onCancel={handleCancel}
						onContinue={(image) => {
							handleNext(3, { selfie: image })
						}}
					/>
				)
			case 4:
				return (
					<ProofOfAddressUpload
						onBack={handleBack}
						onNext={(data) => {
							const adaptedData = { addressDocument: data.extractedData.text }
							handleNext(4, adaptedData)
						}}
					/>
				)
			case 5:
				return (
					<FinalReview
						onBack={handleBack}
						onSubmit={() => {
							handleNext(5, { confirmed: true })
							handleCancel()
						}}
						onStepChange={(step) => setCurrentStep(step)}
						kycData={mappedKycData}
					/>
				)
			default:
				return null
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-xl p-0">
				<div className="flex justify-between p-4 border-b">
					{Array.from({ length: 5 }, (_, i) => {
						const stepNum = i + 1
						return (
							<button
								key={`step-${stepNum}`}
								type="button"
								className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
									currentStep > stepNum
										? 'bg-green-500'
										: currentStep === stepNum
											? 'bg-blue-500'
											: 'bg-gray-300'
								} text-white font-semibold`}
								onClick={() => setCurrentStep(stepNum)}
								aria-label={`Step ${stepNum}`}
							>
								{stepNum}
							</button>
						)
					})}
					<DialogClose className="ml-2 text-gray-500 hover:text-gray-700 cursor-pointer">
						<span className="sr-only">Close</span>×
					</DialogClose>
				</div>
				{loading && <div className="p-4 text-center">Loading...</div>}
				{error && (
					<div className="p-4 text-red-500">
						{error}
						<button
							type="button"
							onClick={handleProceedManually}
							className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
						>
							Proceed Anyway
						</button>
					</div>
				)}
				{renderStep()}
			</DialogContent>
		</Dialog>
	)
}
