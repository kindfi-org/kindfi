'use client'
import { processFile } from '@packages/lib'
import { useCallback, useState } from 'react'
import {
	DocumentPatterns,
	type DocumentType,
	type ExtractedData,
	type ToastFunction,
} from '~/components/shared/kyc/kyc-2/types'

export function useDocumentProcessor(
	documentType: DocumentType,
	toast: ToastFunction,
) {
	const [isProcessing, setIsProcessing] = useState(false)
	const [progress, setProgress] = useState(0)

	const extractText = useCallback(
		(text: string, pattern: RegExp): string | null => {
			const match = text.match(pattern)
			return match ? match[1] || match[0] : null
		},
		[],
	)

	const processFileWithType = useCallback(
		async (file: File, isFront: boolean) => {
			setIsProcessing(true)
			setProgress(0)

			try {
				// const imageToProcess =
				// 	file.type === 'application/pdf' ? await convertPDFToImage(file) : file

				const { extractedData, progress, success, validationErrors } =
					await processFile(file)
				setProgress(progress)

				if (!success) {
					toast({
						title: 'Validation Error',
						description: validationErrors.join(', ') || 'Invalid document',
						className: 'bg-warning text-warning-foreground',
					})
					return null
				}

				if (!extractedData) {
					throw new Error('Failed to extract data')
				}

				const cleanedText = extractedData.text
					.replace(/\s+/g, ' ')
					.trim()
					.toUpperCase()

				const processedData: ExtractedData = {
					...extractedData,
					idNumber: null,
					fullName: null,
					expiryDate: null,
					originalFileType: file.type,
				}

				if (isFront) {
					switch (documentType) {
						case 'Passport':
							processedData.idNumber = extractText(
								cleanedText,
								DocumentPatterns.Passport.idNumber,
							)
							processedData.fullName = extractText(
								cleanedText,
								DocumentPatterns.Passport.name,
							)
							processedData.nationality = extractText(
								cleanedText,
								DocumentPatterns.Passport.nationality,
							)
							break

						case 'National ID':
							processedData.idNumber = extractText(
								cleanedText,
								DocumentPatterns['National ID'].idNumber,
							)
							processedData.fullName = extractText(
								cleanedText,
								DocumentPatterns['National ID'].name,
							)
							break

						case "Driver's License":
							processedData.idNumber = extractText(
								cleanedText,
								DocumentPatterns["Driver's License"].idNumber,
							)
							processedData.fullName = extractText(
								cleanedText,
								DocumentPatterns["Driver's License"].name,
							)
							processedData.vehicleClass = extractText(
								cleanedText,
								DocumentPatterns["Driver's License"].vehicleClass,
							)
							break
					}
				} else {
					processedData.expiryDate = extractText(
						cleanedText,
						/\d{2}[\s./-]\d{2}[\s./-]\d{4}/,
					)
					processedData.issueDate = extractText(
						cleanedText,
						/ISSUE.*?(\d{2}[\s./-]\d{2}[\s./-]\d{4})/i,
					)
					processedData.issuingAuthority = extractText(
						cleanedText,
						/ISSUED BY[:\s]+([^\n]+)/i,
					)
				}

				return processedData
			} catch (error) {
				console.error('Error processing document:', error)
				toast({
					title: 'Error Processing File',
					description:
						error instanceof Error
							? error.message
							: 'There was an error processing your file. Please try again.',
					className: 'bg-destructive text-destructive-foreground',
				})
				throw error
			} finally {
				setIsProcessing(false)
				setProgress(0)
			}
		},
		[documentType, extractText, toast],
	)

	return {
		isProcessing,
		progress,
		processFile: processFileWithType,
	}
}
