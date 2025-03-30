'use client'
import { ArrowLeft, ArrowRight } from 'lucide-react'
// import * as pdfjsLib from 'pdfjs-dist'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '~/components/base/button'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '~/components/base/card'
import { useToast } from '~/components/base/toast'
import { DocumentTypeSelector } from '~/components/shared/kyc/kyc-2/document-type-selector'
import { DocumentUploadZone } from '~/components/shared/kyc/kyc-2/document-upload-zone'
import { ExtractedDataDisplay } from '~/components/shared/kyc/kyc-2/extracted-data-display'
import type {
	DocumentType,
	IDDocumentUploadProps,
	ToastType,
} from '~/components/shared/kyc/kyc-2/types'
import { useDocumentFiles } from '~/hooks/kyc/use-document-files'
import { useDocumentProcessor } from '~/hooks/kyc/use-document-processor'
import { useDocumentValidation } from '~/hooks/kyc/use-document-validation'
import { ValidationAlerts } from './validation-alerts'

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export function IDDocumentUpload({ onBack, onNext }: IDDocumentUploadProps) {
	const [documentType, setDocumentType] = useState<DocumentType>('')
	const { toast } = useToast()

	const {
		frontFile,
		backFile,
		frontPreviewUrl,
		backPreviewUrl,
		frontExtractedData,
		backExtractedData,
		removeFile,
		setFrontFile,
		setBackFile,
		setFrontPreviewUrl,
		setBackPreviewUrl,
		setFrontExtractedData,
		setBackExtractedData,
	} = useDocumentFiles()

	const { isProcessing, progress, processFile } = useDocumentProcessor(
		documentType,
		toast,
	)

	const { validationErrors, validateDocument, setValidationErrors } =
		useDocumentValidation(documentType)

	useEffect(() => {
		return () => {
			if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl)
			if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl)
		}
	}, [frontPreviewUrl, backPreviewUrl])

	const isValidFileType = useCallback((file: File): boolean => {
		const validTypes = [
			'image/png',
			'image/jpeg',
			'image/jpg',
			'application/pdf',
		]
		return validTypes.includes(file.type)
	}, [])

	const handleDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>, isFront: boolean) => {
			e.preventDefault()
			if (!documentType) {
				toast({
					title: 'Document Type Required',
					description: 'Please select an ID document type before uploading.',
					className: 'bg-destructive text-destructive-foreground',
				} as ToastType)
				return
			}
			const droppedFile = e.dataTransfer.files[0]
			if (droppedFile && isValidFileType(droppedFile)) {
				await handleFileUpload(droppedFile, isFront)
			}
		},
		[documentType, isValidFileType, toast],
	)

	const handleFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
			if (!documentType) {
				toast({
					title: 'Document Type Required',
					description: 'Please select an ID document type before uploading.',
					className: 'bg-destructive text-destructive-foreground',
				} as ToastType)
				e.target.value = ''
				return
			}
			const selectedFile = e.target.files?.[0]
			if (selectedFile && isValidFileType(selectedFile)) {
				await handleFileUpload(selectedFile, isFront)
			}
		},
		[documentType, isValidFileType, toast],
	)

	const handleFileUpload = useCallback(
		async (uploadedFile: File, isFront: boolean) => {
			if (!documentType) {
				toast({
					title: 'Document Type Required',
					description: 'Please select a document type first.',
					className: 'bg-destructive text-destructive-foreground',
				} as ToastType)
				return
			}

			try {
				if (uploadedFile) {
					const previewUrl = URL.createObjectURL(uploadedFile)
					if (isFront) {
						setFrontPreviewUrl(previewUrl)
						setFrontFile(uploadedFile)
					} else {
						setBackPreviewUrl(previewUrl)
						setBackFile(uploadedFile)
					}
				}

				const processedData = await processFile(uploadedFile, isFront)
				if (isFront) {
					setFrontExtractedData(processedData)
				} else {
					setBackExtractedData(processedData)
				}
			} catch (error) {
				console.error('Error handling file upload:', error)
				toast({
					title: 'Error Processing Document File',
					description:
						error instanceof Error
							? error.message
							: 'There was an error processing your file. Please try again.',
					className: 'bg-destructive text-destructive-foreground',
				} as ToastType)

				if (isFront) {
					setFrontFile(null)
					setFrontPreviewUrl(null)
					setFrontExtractedData(null)
				} else {
					setBackFile(null)
					setBackPreviewUrl(null)
					setBackExtractedData(null)
				}
			}
		},
		[
			documentType,
			toast,
			processFile,
			setFrontFile,
			setBackFile,
			setFrontPreviewUrl,
			setBackPreviewUrl,
			setFrontExtractedData,
			setBackExtractedData,
		],
	)

	const handleContinue = useCallback(() => {
		if (!frontExtractedData || !documentType || !frontFile) {
			toast({
				title: 'Incomplete Information',
				description: 'Please upload both sides of your ID document.',
				className: 'bg-destructive text-destructive-foreground',
			} as ToastType)
			return
		}

		const { isValid, errors } = validateDocument(frontExtractedData)

		if (isValid) {
			if (onNext) {
				onNext({
					documentType,
					extractedData: frontExtractedData,
					frontImage: frontFile,
					backImage: backFile,
				})
			}
		} else {
			setValidationErrors(errors)
			toast({
				title: 'Validation Failed',
				description: 'Please review the document requirements.',
				className: 'bg-destructive text-destructive-foreground',
			} as ToastType)
		}
	}, [
		frontExtractedData,
		documentType,
		frontFile,
		backFile,
		onNext,
		validateDocument,
		toast,
		setValidationErrors,
	])

	return (
		<Card className="w-full max-w-xl mx-auto max-h-[90vh] flex flex-col">
			<CardHeader className="flex-shrink-0">
				<CardTitle className="text-2xl font-semibold">
					Upload ID Document
				</CardTitle>
				<p className="text-gray-500">
					Please provide clear photos of both sides of your ID document.
				</p>
			</CardHeader>

			<CardContent className="space-y-6 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
				<div className="flex-shrink-0">
					<h3 className="text-lg font-medium mb-2">Step 2 of 4</h3>
					<div className="w-full h-2 bg-gray-200 rounded-full">
						<div className="w-1/2 h-2 bg-black rounded-full" />
					</div>
				</div>

				<DocumentTypeSelector
					value={documentType}
					onChange={(value) => setDocumentType(value)}
				/>

				<div className="grid grid-cols-1 gap-4">
					<div>
						<DocumentUploadZone
							side="front"
							previewUrl={frontPreviewUrl}
							isProcessing={isProcessing}
							progress={progress}
							onDrop={(e) =>
								handleDrop(e as React.DragEvent<HTMLDivElement>, true)
							}
							onFileSelect={(e) => handleFileSelect(e, true)}
							onRemove={() => removeFile(true)}
							isDisabled={!documentType}
						/>
						<ExtractedDataDisplay
							data={frontExtractedData}
							side="front"
							isProcessing={Boolean(
								isProcessing && frontFile && !frontExtractedData,
							)}
						/>
					</div>

					<div>
						<DocumentUploadZone
							side="back"
							previewUrl={backPreviewUrl}
							isProcessing={isProcessing}
							progress={progress}
							onDrop={(e) =>
								handleDrop(e as React.DragEvent<HTMLDivElement>, false)
							}
							onFileSelect={(e) => handleFileSelect(e, false)}
							onRemove={() => removeFile(false)}
							isDisabled={!documentType}
						/>
						<ExtractedDataDisplay
							data={backExtractedData}
							side="back"
							isProcessing={Boolean(
								isProcessing && backFile && !backExtractedData,
							)}
						/>
					</div>
				</div>

				<ValidationAlerts
					errors={validationErrors}
					documentType={documentType}
				/>
			</CardContent>

			<div className="flex justify-between space-x-4 p-6 border-t flex-shrink-0">
				<Button variant="outline" onClick={onBack} disabled={isProcessing}>
					<ArrowLeft className="mr-2 h-4 w-4" /> Back
				</Button>
				<Button
					onClick={handleContinue}
					disabled={isProcessing || !frontFile || !backFile || !documentType}
				>
					Continue <ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</Card>
	)
}
