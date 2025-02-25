'use client'
import * as pdfjsLib from 'pdfjs-dist'
import { useCallback, useState } from 'react'
import Tesseract from 'tesseract.js'
import type {
	DocumentType,
	ExtractedData,
	ToastFunction,
} from '../../components/shared/kyc/kyc-2/types'
import { DocumentPatterns } from '../../components/shared/kyc/kyc-2/types'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

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
			return match ? match[1] || match[0] : null
		},
		[],
	)

	const processFile = useCallback(
		async (file: File, isFront: boolean) => {
			setIsProcessing(true)
			setProgress(0)

			try {
				const imageToProcess =
					file.type === 'application/pdf' ? await convertPDFToImage(file) : file

				const result = await Tesseract.recognize(imageToProcess, 'eng', {
					logger: (message) => {
						if (message.status === 'recognizing text') {
							setProgress(Math.round(message.progress * 100))
						}
					},
				})

				const extractedText = result.data.text

				const cleanedText = extractedText
					.replace(/\s+/g, ' ')
					.trim()
					.toUpperCase()

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
		[documentType, convertPDFToImage, extractText, toast],
	)

	return {
		isProcessing,
		progress,
		processFile,
		convertPDFToImage,
	}
}
