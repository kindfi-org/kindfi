'use client'
import { processFile } from '@packages/lib'
import * as pdfjsLib from 'pdfjs-dist'
import { useCallback, useState } from 'react'
import {
	DocumentPatterns,
	type DocumentType,
	type ExtractedData,
	type ToastFunction,
} from '~/components/shared/kyc/kyc-2/types'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export function useDocumentProcessor(
	documentType: DocumentType,
	toast: ToastFunction,
) {
	const [isProcessing, setIsProcessing] = useState(false)
	const [progress, setProgress] = useState(0)

	const convertPDFToImage = useCallback(async (file: File): Promise<File> => {
		const arrayBuffer = await file.arrayBuffer()
		const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
		const page = await pdf.getPage(1)
		const viewport = page.getViewport({ scale: 2.0 })

		const canvas = document.createElement('canvas')
		canvas.height = viewport.height
		canvas.width = viewport.width

		const context = canvas.getContext('2d')
		if (!context) throw new Error('Could not create canvas context')

		await page.render({
			canvasContext: context,
			viewport: viewport,
		}).promise

		return new Promise((resolve, reject) => {
			canvas.toBlob((blob) => {
				if (!blob) reject(new Error('Could not convert PDF to image'))
				else
					resolve(new File([blob], 'converted-pdf.png', { type: 'image/png' }))
			}, 'image/png')
		})
	}, [])

	const extractText = useCallback(
		(text: string, pattern: RegExp): string | null => {
			const match = text.match(pattern)
			if (!match) return null
			
			// Return the first non-empty capture group, or the full match
			for (let i = 1; i < match.length; i++) {
				if (match[i] && match[i].trim().length > 0) {
					return match[i].trim()
				}
			}
			return match[0].trim()
		},
		[],
	)

	const processFileWithType = useCallback(
		async (file: File, isFront: boolean) => {
			setIsProcessing(true)
			setProgress(0)

			try {
				const imageToProcess =
					file.type === 'application/pdf' ? await convertPDFToImage(file) : file

				const result = await processFile(imageToProcess)
				const { extractedText, progress, error } = result
				setProgress(progress)

				// Check for errors from the OCR process
				if (error) {
					// For passport, allow proceeding even if OCR fails
					if (documentType === 'Passport' && isFront) {
						toast({
							title: 'OCR Processing Warning',
							description:
								`OCR processing encountered an issue: ${error}. ` +
								'You can still proceed - please verify all information manually.',
							className: 'bg-yellow-500 text-yellow-900',
						})
						return {
							text: '',
							idNumber: null,
							fullName: null,
							expiryDate: null,
							nationality: null,
							originalFileType: file.type,
						}
					}

					throw new Error(
						`OCR processing failed: ${error}. Please ensure the image is clear and try again.`,
					)
				}

				// If no text was extracted, provide helpful guidance
				if (!extractedText || extractedText.trim().length === 0) {
					// For passport, allow proceeding with empty text but warn the user
					// They can manually verify the information later
					if (documentType === 'Passport' && isFront) {
						toast({
							title: 'Text Extraction Notice',
							description:
								'Could not automatically extract text from your passport. ' +
								'You can still proceed - please verify all information manually before submitting.',
							className: 'bg-yellow-500 text-yellow-900',
						})
						// Return minimal data structure to allow proceeding
						return {
							text: '',
							idNumber: null,
							fullName: null,
							expiryDate: null,
							nationality: null,
							originalFileType: file.type,
						}
					}

					throw new Error(
						'Could not extract text from the document. Please ensure:\n' +
							'• The image is clear and well-lit\n' +
							'• The document is fully visible\n' +
							'• The file format is supported (JPG, PNG, or PDF)\n' +
							'• Try taking a new photo with better lighting',
					)
				}

				const cleanedText = extractedText
					.replace(/\s+/g, ' ')
					.trim()
					.toUpperCase()

				// Debug: Log extracted text for troubleshooting (only in development)
				if (process.env.NODE_ENV === 'development' && documentType === 'Passport') {
					console.log('Extracted text from passport:', cleanedText.substring(0, 500))
				}

				const processedData: ExtractedData = {
					text: extractedText,
					idNumber: null,
					fullName: null,
					expiryDate: null,
					originalFileType: file.type,
				}

				if (isFront) {
					switch (documentType) {
						case 'Passport':
							// Try multiple patterns for passport number
							processedData.idNumber =
								extractText(cleanedText, DocumentPatterns.Passport.idNumber) ||
								extractText(cleanedText, /PASSPORT[\s:]*NO[.:\s]*([A-Z0-9]{6,12})/i) ||
								extractText(cleanedText, /([A-Z]{1,2}[0-9]{6,9})/) ||
								extractText(cleanedText, /([0-9]{9})/)

							// Try multiple patterns for name
							processedData.fullName =
								extractText(cleanedText, DocumentPatterns.Passport.name) ||
								extractText(cleanedText, /(?:SURNAME|LAST\s*NAME)[\s:]*([A-Z\s]{3,30})/i) ||
								extractText(cleanedText, /(?:GIVEN\s*NAMES|FIRST\s*NAME)[\s:]*([A-Z\s]{3,30})/i) ||
								extractText(cleanedText, /([A-Z][A-Z\s]{5,40})/)

							// Try multiple patterns for nationality
							processedData.nationality =
								extractText(cleanedText, DocumentPatterns.Passport.nationality) ||
								extractText(cleanedText, /(?:NATIONALITY|NAT)[\s:]*([A-Z]{2,3})/i) ||
								extractText(cleanedText, /([A-Z]{2,3})(?:\s*NATIONALITY)/i)

							// Also try to extract expiry date from passport front (many passports have it)
							processedData.expiryDate =
								extractText(cleanedText, /(?:EXPIRY|EXPIRES|DATE\s*OF\s*EXPIRY)[\s:]*(\d{1,2}[\s./-]\d{1,2}[\s./-]\d{2,4})/i) ||
								extractText(cleanedText, /(\d{1,2}[\s./-]\d{1,2}[\s./-]\d{2,4})/)
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
		[documentType, extractText, toast, convertPDFToImage],
	)

	return {
		isProcessing,
		progress,
		processFile: processFileWithType,
	}
}
