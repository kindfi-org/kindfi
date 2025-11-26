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
	if (!extractedData) {
		toast({ title: 'Error', description: 'No data extracted' })
		return
	}

	const validation = validateDocument(extractedData)
	if (!validation.isValid) {
		setValidationErrors(validation.errors)
		toast({
			title: 'Validation Error',
			description: 'Document validation failed',
		})
		return
	}

	onNext({ documentType, extractedData })
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
				disabled={isProcessing || !extractedData || !documentType}
			>
				Continue <ArrowRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	)
}
