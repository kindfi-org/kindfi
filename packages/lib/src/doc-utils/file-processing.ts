import Tesseract from 'tesseract.js'
import { extractAddress, extractDate } from './extraction'
import type { ExtractedData } from './types'
import { validateDocument } from './validation'

interface ProcessFileResult {
	extractedData: ExtractedData | null
	progress: number
	validationErrors: string[]
	success: boolean
	error?: string
}

export const processFile = async (file: File): Promise<ProcessFileResult> => {
	let progress = 0
	let extractedData: ExtractedData | null = null
	let validationErrors: string[] = []
	let success = false
	let errorMessage: string | undefined

	try {
		const result = await Tesseract.recognize(file, 'eng', {
			logger: (message: { status: string; progress: number }) => {
				if (message.status === 'recognizing text') {
					progress = Math.round(message.progress * 100)
				}
			},
		})

		const extractedText = result.data.text
		extractedData = {
			text: extractedText,
			date: extractDate(extractedText),
			address: extractAddress(extractedText),
		}

		const { isValid, errors } = validateDocument(extractedData)

		if (!isValid) {
			validationErrors = errors
		} else {
			success = true
		}
	} catch (error) {
		console.error('Error processing document:', error)
		errorMessage = 'Error processing document'
	}

	return {
		extractedData,
		progress,
		validationErrors,
		success,
		error: errorMessage,
	}
}
