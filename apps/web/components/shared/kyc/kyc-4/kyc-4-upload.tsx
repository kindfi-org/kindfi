/* eslint-disable no-unused-vars */
'use client'
import type { DocumentType, ExtractedData } from '@packages/lib'
import { processFile, validateDocument } from '@packages/lib'
import { AlertCircle } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Alert, AlertDescription } from '~/components/base/alert'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { useToast } from '~/components/base/toast'
import { DocumentPreview } from './document-preview'
import { DocumentTypeSelector } from './document-type-selector'
import { ExtractedInfoDisplay } from './extracted-info-display'
import { FileUploadArea } from './file-upload-area'
import { OCRProcessor } from './ocr-processor'
import { ValidationDisplay } from './validation-display'

type ToastType = {
	title: string
	description?: string
	duration?: number
	className?: string
}

const ProofOfAddressUpload = ({
	onBack,
	onNext,
}: {
	onBack?: () => void
	onNext?: (data: {
		documentType: DocumentType
		extractedData: ExtractedData
	}) => void
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

	const isValidFileType = (file: File): boolean => {
		const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
		return validTypes.includes(file.type)
	}

	const handleDrop = async (
		e: React.DragEvent<HTMLLabelElement>,
		documentType: DocumentType,
		_handleFileUploadBound: (file: File) => void,
		setFile: React.Dispatch<React.SetStateAction<File | null>>,
		toast: (props: Omit<ToastType, 'className'>) => () => void,
	) => {
		e.preventDefault()
		const droppedFile = e.dataTransfer.files[0]
		if (droppedFile && isValidFileType(droppedFile)) {
			await handleFileUpload(
				documentType,
				setFile,
				setPreviewUrl,
				setIsProcessing,
				setProgress,
				setValidationErrors,
				setExtractedData,
				toast,
			)
		}
	}

	const handleFileSelect = async (
		e: React.ChangeEvent<HTMLInputElement>,
		documentType: string | null,
		handleFileUpload: (
			uploadedFile: File,
			documentType: string | null,
			setFile: (file: File | null) => void,
			toast: (props: Omit<ToastType, 'className'>) => () => void,
		) => void,
		setFile: (file: File | null) => void,
		toast: (props: Omit<ToastType, 'className'>) => () => void,
	) => {
		if (!documentType) {
			e.target.value = ''
			return
		}
		const selectedFile = e.target.files?.[0]
		if (selectedFile && isValidFileType(selectedFile)) {
			await handleFileUpload(selectedFile, documentType, setFile, toast)
		}
	}

	const removeFile = (
		previewUrl: string | null,
		setFile: (file: File | null) => void,
		setPreviewUrl: (url: string | null) => void,
		setExtractedData: (data: ExtractedData | null) => void,
		setValidationErrors: (errors: string[]) => void,
	) => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl)
		}
		setFile(null)
		setPreviewUrl(null)
		setExtractedData(null)
		setValidationErrors([])
	}

	const handleFileUpload = (
		documentType: string | null,
		setFile: (file: File | null) => void,
		setPreviewUrl: (url: string | null) => void,
		setIsProcessing: (isProcessing: boolean) => void,
		setProgress: (progress: number) => void,
		setValidationErrors: (errors: string[]) => void,
		setExtractedData: (data: ExtractedData | null) => void,
		toast: (props: Omit<ToastType, 'className'>) => () => void,
	) => {
		return async (uploadedFile: File) => {
			if (!documentType) {
				toast({
					title: 'Error',
					description: 'Please select a document type.',
				})
				return
			}

			setFile(uploadedFile)
			const preview = URL.createObjectURL(uploadedFile)
			setPreviewUrl(preview)

			setIsProcessing(true)
			setProgress(0)
			setValidationErrors([])

			try {
				const result = await processFile(uploadedFile)

				if (result.error) {
					setValidationErrors([result.error])
					toast({ title: 'Error', description: result.error })
				} else {
					setExtractedData(result.extractedData)
					setValidationErrors(result.validationErrors)

					if (result.validationErrors.length > 0) {
						toast({
							title: 'Warning',
							description: 'Document has validation errors.',
						})
					} else {
						toast({
							title: 'Success',
							description: 'Document processed successfully!',
						})
					}
				}

				setProgress(result.progress)
			} catch (error) {
				toast({
					title: 'Error',
					description: 'An error occurred while processing the document.',
				})
				console.error('Error in handleFileUpload:', error)
			} finally {
				setIsProcessing(false)
			}
		}
	}
	// biome-ignore lint/correctness/useExhaustiveDependencies: these dependencies are needed
	const handleFileUploadBound = useCallback(
		(uploadedFile: File) => {
			handleFileUpload(
				documentType,
				setFile,
				setPreviewUrl,
				setIsProcessing,
				setProgress,
				setValidationErrors,
				setExtractedData,
				toast,
			)(uploadedFile)
		},
		[documentType, toast],
	)

	useEffect(() => {
		if (file) {
			handleFileUploadBound(file)
		}
	}, [file, handleFileUploadBound]) // Now stable

	const handleContinue = (
		extractedData: ExtractedData | null,
		documentType: DocumentType,
		onNext:
			| ((data: {
					documentType: DocumentType
					extractedData: ExtractedData
			  }) => void)
			| undefined,
		validateDocument: (
			data: ExtractedData,
			toast: (props: Omit<ToastType, 'className'>) => () => void,
		) => { isValid: boolean; errors: string[] },
		toast: (props: Omit<ToastType, 'className'>) => () => void,
		setValidationErrors: (errors: string[]) => void,
	) => {
		if (!extractedData || !documentType) {
			toast({
				title: 'Incomplete Information',
				description: 'Please upload a document and select a document type.',
				className: 'bg-destructive text-destructive-foreground',
			} as ToastType)
			return
		}

		const { isValid, errors } = validateDocument(extractedData, toast)

		if (isValid) {
			if (onNext) {
				onNext({
					documentType,
					extractedData,
				})
			}

			toast({
				title: 'Validation Successful',
				description: 'Your document has been validated and processed.',
				className: 'bg-green-500',
			} as ToastType)
		} else {
			setValidationErrors(errors)
			toast({
				title: 'Validation Failed',
				description: 'Please review the document requirements.',
				className: 'bg-destructive text-destructive-foreground',
			} as ToastType)
		}
	}

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
						handleDrop={(
							e,
							documentType,
							handleFileUploadBound,
							setFile,
							toast,
						) =>
							handleDrop(
								e as unknown as React.DragEvent<HTMLLabelElement>,
								documentType,
								handleFileUploadBound,
								setFile,
								toast,
							)
						}
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

export { ProofOfAddressUpload }
