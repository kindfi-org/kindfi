import Tesseract from 'tesseract.js'

interface ProcessFileResult {
	extractedText: string | null
	progress: number
	error?: string
}

export const processFile = async (file: File): Promise<ProcessFileResult> => {
	let progress = 0
	let extractedText: string | null = null
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
	} catch (error) {
		console.error('Error processing document:', error)
		errorMessage = 'Error processing document'
	}

	return {
		extractedText,
		progress,
		error: errorMessage,
	}
}
