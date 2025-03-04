import { extractAddress, extractDate } from './extraction'
import { processFile, validateDocument } from './validation'


export const handleFileUpload = (
	documentType: string | null,
	setFile: (file: File | null) => void,
	setPreviewUrl: (url: string | null) => void,
	setIsProcessing: (isProcessing: boolean) => void,
	setProgress: (progress: number) => void,
	setValidationErrors: (errors: string[]) => void,
	setExtractedData: (data: any) => void,
	// Tesseract: any,
	toast: (options: any) => void,
) => {
	return async (uploadedFile: File) => {
		if (!documentType) {
			return
		}

		setFile(uploadedFile)
		const preview = URL.createObjectURL(uploadedFile)
		setPreviewUrl(preview)

		processFile(
			uploadedFile,
			setIsProcessing,
			setProgress,
			setValidationErrors,
			// Tesseract,
			extractDate,
			extractAddress,
			setExtractedData,
			validateDocument,
		)
	}
}

export const isValidFileType = (file: File): boolean => {
	const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
	return validTypes.includes(file.type)
}

export const handleDrop = async (
	e: React.DragEvent<HTMLDivElement>,
	documentType: string | null,
	handleFileUpload: (
		uploadedFile: File,
		documentType: string | null,
		setFile: (file: File | null) => void,
		toast: (toastProps: any) => void,
	) => void,
	setFile: (file: File | null) => void,
	toast: (toastProps: any) => void,
) => {
	e.preventDefault()
	const droppedFile = e.dataTransfer.files[0]
	if (droppedFile && isValidFileType(droppedFile)) {
		await handleFileUpload(droppedFile, documentType, setFile, toast)
	}
}

export const handleFileSelect = async (
	e: React.ChangeEvent<HTMLInputElement>,
	documentType: string | null,
	handleFileUpload: (
		uploadedFile: File,
		documentType: string | null,
		setFile: (file: File | null) => void,
		toast: (toastProps: any) => void,
	) => void,
	setFile: (file: File | null) => void,
	toast: (toastProps: any) => void,
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

export const removeFile = (
	previewUrl: string | null,
	setFile: (file: File | null) => void,
	setPreviewUrl: (url: string | null) => void,
	setExtractedData: (data: any) => void,
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
