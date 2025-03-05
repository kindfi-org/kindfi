import Tesseract from 'tesseract.js'
import { extractAddress, extractDate } from './extraction'

interface ExtractedData {
	text: string
	date: string | null
	address: string | null
}
export const validateDocument = (
	data: ExtractedData,
): { isValid: boolean; errors: string[] } => {
	const errors: string[] = []

	if (!data.date) {
		errors.push('No date found in the document')
	} else {
		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const documentDate = new Date(data.date)
		documentDate.setHours(0, 0, 0, 0)

		const threeMonthsAgo = new Date(today)
		threeMonthsAgo.setMonth(today.getMonth() - 3)
		threeMonthsAgo.setHours(0, 0, 0, 0)

		const formatDate = (date: Date) => {
			return date.toLocaleDateString('en-US', {
				month: 'long',
				day: 'numeric',
				year: 'numeric',
			})
		}

		if (documentDate < threeMonthsAgo) {
			errors.push(
				`Document is too old. Must be dated after ${formatDate(threeMonthsAgo)}`,
			)
		}

		if (documentDate > today) {
			errors.push('Document date cannot be in the future')
		}
	}

	if (!data.address) {
		errors.push('No address found in the document')
	} else {
		const addressValidationRegex =
			/\d+\s+[a-zA-Z0-9\s]+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd)/i
		if (!addressValidationRegex.test(data.address)) {
			errors.push('Address appears to be invalid or incomplete')
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

// export const processFile = async (
// 	file: File,
// 	setIsProcessing: (value: boolean) => void,
// 	setProgress: (value: number) => void,
// 	setValidationErrors: (errors: string[]) => void,
// 	// extractDate: (text: string) => string | null,
// 	// extractAddress: (text: string) => string | null,
// 	setExtractedData: (data: ExtractedData) => void,
// 	validateDocument: (
// 		data: ExtractedData,
// 	) => { isValid: boolean; errors: string[] },
// ) => {
// 	setIsProcessing(true)
// 	setProgress(0)
// 	setValidationErrors([])

// 	try {
// 		const result = await Tesseract.recognize(file, 'eng', {
// 			logger: (message: any) => {
// 				if (message.status === 'recognizing text') {
// 					setProgress(Math.round(message.progress * 100))
// 				}
// 			},
// 		})

// 		const extractedText = result.data.text

// 		const processedData: ExtractedData = {
// 			text: extractedText,
// 			date: extractDate(extractedText),
// 			address: extractAddress(extractedText),
// 		}

// 		setExtractedData(processedData)

// 		const { isValid, errors } = validateDocument(processedData)

// 		if (isValid) {
// 			// Do something with the extracted data
// 		} else {
// 			setValidationErrors(errors)
// 		}
// 	} catch (error) {
// 		console.error('Error processing document:', error)
// 		// setValidationErrors(['Error processing document'])
// 	} finally {
// 		setIsProcessing(false)
// 		setProgress(0)
// 	}
// }

// export const handleContinue = (
// 	extractedData: ExtractedData | null,
// 	documentType: DocumentType,
// 	onNext:
// 		| ((data: {
// 				documentType: DocumentType
// 				extractedData: ExtractedData
// 		  }) => void)
// 		| undefined,
// 	validateDocument: (
// 		data: ExtractedData,
// 		toast: (toastProps: any) => void,
// 	) => { isValid: boolean; errors: string[] },
// 	toast: (toastProps: any) => void,
// 	setValidationErrors: (errors: string[]) => void,
// ) => {
// 	if (!extractedData || !documentType) {
// 		toast({
// 			title: 'Incomplete Information',
// 			description: 'Please upload a document and select a document type.',
// 			className: 'bg-destructive text-destructive-foreground',
// 		} as ToastType)
// 		return
// 	}

// 	const { isValid, errors } = validateDocument(extractedData, toast)

// 	if (isValid) {
// 		if (onNext) {
// 			onNext({
// 				documentType,
// 				extractedData,
// 			})
// 		}

// 		toast({
// 			title: 'Validation Successful',
// 			description: 'Your document has been validated and processed.',
// 			className: 'bg-green-500',
// 		} as ToastType)
// 	} else {
// 		setValidationErrors(errors)
// 		toast({
// 			title: 'Validation Failed',
// 			description: 'Please review the document requirements.',
// 			className: 'bg-destructive text-destructive-foreground',
// 		} as ToastType)
// 	}
// }
