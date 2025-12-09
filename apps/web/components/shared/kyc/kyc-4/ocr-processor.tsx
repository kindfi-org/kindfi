import type { DocumentType, ExtractedData } from '@packages/lib/doc-utils'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import type React from 'react'
import { Button } from '~/components/base/button'
import type { useToast } from '~/components/base/toast'

interface OCRProcessorProps {
	isProcessing: boolean
	onBack?: () => void
	onNext?: (data: {
		documentType: DocumentType
		extractedData: ExtractedData
	}) => void
	extractedData: ExtractedData | null
	documentType: DocumentType
	validateDocument: (data: ExtractedData) => {
		isValid: boolean
		errors: string[]
	}
	toast: ReturnType<typeof useToast>['toast']
	setValidationErrors: React.Dispatch<React.SetStateAction<string[]>>
	handleContinue: (
		extractedData: ExtractedData | null,
		documentType: DocumentType,
		onNext:
			| ((data: {
					documentType: DocumentType
					extractedData: ExtractedData
			  }) => void)
			| undefined,
		validateDocument: (data: ExtractedData) => {
			isValid: boolean
			errors: string[]
		},
		toast: ReturnType<typeof useToast>['toast'],
		setValidationErrors: (errors: string[]) => void,
	) => void
}

const handleContinue = (
	extractedData: ExtractedData | null,
	documentType: DocumentType,
	onNext: (data: {
		documentType: DocumentType
		extractedData: ExtractedData
	}) => void,
	validateDocument: (data: ExtractedData) => {
		isValid: boolean
		errors: string[]
	},
	toast: ReturnType<typeof useToast>['toast'],
	setValidationErrors: React.Dispatch<React.SetStateAction<string[]>>,
) => {
	// Create minimal extractedData if null (allows proceeding even if OCR failed)
	const dataToUse: ExtractedData =
		extractedData ||
		({
			date: null,
			address: null,
		} as ExtractedData)

	const validation = validateDocument(dataToUse)

	// For proof of address documents, allow proceeding even with validation warnings
	// Show warnings but don't block submission
	if (validation.errors.length > 0) {
		setValidationErrors(validation.errors)
		toast({
			title: 'Verification Warnings',
			description:
				'Some information could not be automatically extracted. ' +
				'Please review the warnings and verify all information manually before submitting.',
		})
	}

	// Allow proceeding even with warnings
	onNext({ documentType, extractedData: dataToUse })
}

export const OCRProcessor: React.FC<OCRProcessorProps> = ({
	isProcessing,
	onBack,
	onNext,
	extractedData,
	documentType,
	validateDocument,
	toast,
	setValidationErrors,
}) => {
	return (
		<div className="flex justify-end space-x-4">
			<Button variant="outline" onClick={onBack} disabled={isProcessing}>
				<ArrowLeft className="mr-2 h-4 w-4" /> Back
			</Button>
			<Button
				onClick={() => {
					if (onNext) {
						handleContinue(
							extractedData,
							documentType,
							onNext,
							validateDocument,
							toast,
							setValidationErrors,
						)
					}
				}}
				disabled={isProcessing || !documentType}
			>
				Continue <ArrowRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	)
}
