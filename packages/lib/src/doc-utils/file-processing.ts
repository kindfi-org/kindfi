import Tesseract from 'tesseract.js'
import type { ExtractedData } from './types'

interface ProcessFileResult {
	extractedText: string | null
	extractedData: ExtractedData | null
	validationErrors: string[]
	progress: number
	error?: string
}

export const processFile = async (file: File): Promise<ProcessFileResult> => {
	let progress = 0
	let extractedText: string | null = null
	const extractedData: ExtractedData | null = null
	const validationErrors: string[] = []
	let errorMessage: string | undefined

	try {
		const result = await Tesseract.recognize(file, 'eng', {
			logger: (message: { status: string; progress: number }) => {
				if (message.status === 'recognizing text') {
					progress = Math.round(message.progress * 100)
				}
			},
		})

		extractedText = result.data.text
		// Add logic to populate extractedData and validationErrors if needed
	} catch (error) {
		console.error('Error processing document:', error)
		errorMessage = 'Error processing document'
	}

	return {
		extractedText,
		extractedData,
		validationErrors,
		progress,
		error: errorMessage,
	}
}
