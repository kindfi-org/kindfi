// hooks/use-kyc.ts
import { useEffect, useState } from 'react'
import type { KYCData } from '~/components/shared/kyc/kyc-modal'
import { submitKYC } from '~/lib/services/kyc'

const KYC_STORAGE_KEY = 'kyc-data'

export function useKYC() {
	const [currentStep, setCurrentStep] = useState(1)
	const [kycData, setKycData] = useState<KYCData>({
		personalInfo: {
			fullName: '',
			dateOfBirth: '',
			nationality: '',
		},
		documents: {
			documentType: '',
			frontImage: null,
			backImage: null,
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			extractedData: {} as any,
		},
		address: {
			street: '',
			city: '',
			country: '',
			proofDocument: null,
		},
		faceVerification: {
			selfieImage: null,
		},
	})
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		try {
			const savedData = localStorage.getItem(KYC_STORAGE_KEY)
			if (savedData) {
				const { step, data } = JSON.parse(savedData)
				setCurrentStep(step)
				setKycData(data)
			}
		} catch (error) {
			console.error('Failed to load KYC data from storage', error)
		}
	}, [])

	useEffect(() => {
		try {
			const dataToSave = JSON.stringify({ step: currentStep, data: kycData })
			localStorage.setItem(KYC_STORAGE_KEY, dataToSave)
		} catch (error) {
			console.error('Failed to save KYC data to storage', error)
		}
	}, [currentStep, kycData])

	const nextStep = () => setCurrentStep((prev) => prev + 1)
	const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))
	const goToStep = (step: number) => setCurrentStep(step)

	const updateKycData = (data: Partial<KYCData>) => {
		setKycData((prev) => ({ ...prev, ...data }))
	}

	const handleFinalSubmit = async () => {
		setIsLoading(true)
		setError(null)
		try {
			const result = await submitKYC(kycData)
			if (result.success) {
				// Handle successful submission
				console.log('KYC submission successful')
				localStorage.removeItem(KYC_STORAGE_KEY)
			} else {
				setError(result.message || 'An unknown error occurred.')
			}
		} catch (err) {
			setError('Failed to submit KYC data.')
		} finally {
			setIsLoading(false)
		}
	}

	return {
		currentStep,
		kycData,
		isLoading,
		error,
		nextStep,
		prevStep,
		goToStep,
		updateKycData,
		handleFinalSubmit,
	}
}
