import { extractAddress, extractDate } from './extraction'
import { processFile, validateDocument } from './validation'

export interface ExtractedData {
  text: string;
  date: string | null;
  address: string | null;
}

type ToastType = {
  title: string
  description?: string
  duration?: number
  className?: string
}

export const handleFileUpload = (
  documentType: string | null,
  setFile: (file: File | null) => void,
  setPreviewUrl: (url: string | null) => void,
  setIsProcessing: (isProcessing: boolean) => void,
  setProgress: (progress: number) => void,
  setValidationErrors: (errors: string[]) => void,
  setExtractedData: (data: ExtractedData | null) => void,
  toast: (options: ToastType) => void,
) => {
  return async (uploadedFile: File) => {
    if (!documentType) {
      toast({
        title: 'Document Type Required',
        description: 'Please select a document type first.',
        className: 'bg-destructive text-destructive-foreground',
      } as ToastType)
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
      toast,
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
  uploadHandler: ReturnType<typeof handleFileUpload>,
  setFile: (file: File | null) => void,
  toast: (toastProps: ToastType) => void,
) => {
  e.preventDefault()
  const droppedFile = e.dataTransfer.files[0]
  if (droppedFile && isValidFileType(droppedFile)) {
    await uploadHandler(droppedFile)
  }
}

export const handleFileSelect = async (
  e: React.ChangeEvent<HTMLInputElement>,
  documentType: string | null,
  uploadHandler: ReturnType<typeof handleFileUpload>,
  setFile: (file: File | null) => void,
  toast: (toastProps: ToastType) => void,
) => {
  if (!documentType) {
    toast({
      title: 'Document Type Required',
      description: 'Please select a document type before uploading.',
      className: 'bg-destructive text-destructive-foreground',
    } as ToastType)
    e.target.value = ''
    return
  }
  
  const selectedFile = e.target.files?.[0]
  if (selectedFile && isValidFileType(selectedFile)) {
    await uploadHandler(selectedFile)
  }
}

export const removeFile = (
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