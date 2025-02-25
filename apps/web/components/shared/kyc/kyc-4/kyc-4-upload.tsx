'use client'
import {
	handleDrop,
	handleFileSelect,
	removeFile,
	useHandleFileUpload,
} from '@packages/lib/src/doc-utils/upload-handler'
import {
	handleContinue,
	validateDocument,
} from '@packages/lib/src/doc-utils/validation'
import { AlertCircle } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import Tesseract from 'tesseract.js'
import { Alert, AlertDescription } from '~/components/base/alert'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { useToast } from '~/components/base/toast'
import type { DocumentType } from '~/types'
import type { ExtractedData } from '~/types'
import { DocumentPreview } from '~/components/shared/kyc-4/document-preview'
import { DocumentTypeSelector } from '~/components/shared/kyc-4/document-type-selector'
import { ExtractedInfoDisplay } from '~/components/shared/kyc-4/extracted-info-display'
import { FileUploadArea } from '~/components/shared/kyc-4/file-upload-area'
import { OCRProcessor } from '~/components/shared/kyc-4/ocr-processor'
import { ValidationDisplay } from '~/components/shared/kyc-4/validation-display'


const ProofOfAddressUpload = ({
	onBack,
	onNext,
}: {
	onBack?: () => void
	onNext?: () => void
}) => {
	const [file, setFile] = useState<File | null>(null)
	// TODO: Refactor the state management using useSetState from 'react-use'
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)
	const [isProcessing, setIsProcessing] = useState<boolean>(false)
	const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
	const [progress, setProgress] = useState<number>(0)
	const [documentType, setDocumentType] = useState<DocumentType>('')
	const [validationErrors, setValidationErrors] = useState<string[]>([])
	const { toast } = useToast()

	useEffect(() => {
		if (previewUrl) {
			return () => URL.revokeObjectURL(previewUrl)
		}
	}, [previewUrl])


	const handleFileUploadBound = useHandleFileUpload(
		documentType,
		setFile,
		setPreviewUrl,
		setIsProcessing,
		setProgress,
		setValidationErrors,
		setExtractedData,
		Tesseract,
		toast,
	)

	useEffect(() => {
		if (file) {
			handleFileUploadBound(file)
		}
	}, [file, handleFileUploadBound])

	return (
		<Card className="w-full max-w-xl mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl font-semibold">
					Upload Proof of Address
				</CardTitle>
				<p className="text-gray-500">
					Please provide a recent document that proves your current address.
				</p>
			</CardHeader>

			<CardContent className="space-y-6">
				<div>
					<h3 className="text-lg font-medium mb-2">Step 4 of 4</h3>
					<div className="w-full h-2 bg-gray-200 rounded-full">
						<div className="w-full h-2 bg-black rounded-full" />
					</div>
				</div>

				<DocumentTypeSelector
					documentType={documentType}
					setDocumentType={setDocumentType}
				/>

				{!previewUrl ? (
					<FileUploadArea
						isProcessing={isProcessing}
						handleDrop={handleDrop}
						handleFileSelect={handleFileSelect}
						documentType={documentType}
						handleFileUploadBound={handleFileUploadBound}
						setFile={setFile}
						toast={toast}
					/>
				) : (
					<DocumentPreview
						isProcessing={isProcessing}
						progress={progress}
						previewUrl={previewUrl}
						removeFile={() =>
							removeFile(
								previewUrl,
								setFile,
								setPreviewUrl,
								setExtractedData,
								setValidationErrors,
							)
						}
						setFile={setFile}
						setPreviewUrl={setPreviewUrl}
						setExtractedData={setExtractedData}
						setValidationErrors={setValidationErrors}
					/>
				)}

				<ExtractedInfoDisplay extractedData={extractedData} />

				<ValidationDisplay validationErrors={validationErrors} />

				<Alert variant="default">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<div className="mt-2">
							<p className="font-medium">Your document must:</p>
							<ul className="list-disc pl-6 mt-2 space-y-1">
								<li>Be dated within the last 3 months</li>
								<li>Show your full name and current address</li>
								<li>Be a clear, complete copy of the original</li>
							</ul>
						</div>
					</AlertDescription>
				</Alert>

				
				<OCRProcessor
					isProcessing={isProcessing}
					onBack={onBack}
					onNext={onNext}
					extractedData={extractedData}
					documentType={documentType}
					validateDocument={validateDocument}
					toast={toast}
					handleContinue={handleContinue}
					setValidationErrors={setValidationErrors}
				/>
			</CardContent>
		</Card>
	)
}

export default ProofOfAddressUpload
