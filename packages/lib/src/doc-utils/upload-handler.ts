import { extractAddress, extractDate } from './extraction'
import { processFile, validateDocument } from './validation'

type ToastType = {
  title: string
  description?: string
  duration?: number
  className?: string
}

export function createFileUploadHandler(
  documentType: string | null,
  setFile: (file: File | null) => void,
  setPreviewUrl: (url: string | null) => void,
  setIsProcessing: (isProcessing: boolean) => void,
  setProgress: (progress: number) => void,
  setValidationErrors: (errors: string[]) => void,
  setExtractedData: (data: any) => void,
  Tesseract: any,
  toast: (options: any) => void,
) {
  return async function handleFileUpload(uploadedFile: File) {
    if (!documentType) {
      toast({
        title: 'Document Type Required',
        description: 'Please select a document type first.',
        className: 'bg-destructive text-destructive-foreground',
      } as ToastType)
      return
    }
    
    setFile(uploadedFile)
    
    // Only create object URLs on the client side
    if (typeof window !== 'undefined') {
      const preview = URL.createObjectURL(uploadedFile)
      setPreviewUrl(preview)
    }
    
    processFile(
      uploadedFile,
      setIsProcessing,
      setProgress,
      setValidationErrors,
      Tesseract,
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

export function handleDrop(
  e: React.DragEvent<HTMLDivElement>,
  documentType: string | null,
  handleFileUpload: (uploadedFile: File) => Promise<void>,
  toast: (toastProps: any) => void,
) {
  e.preventDefault()
  const droppedFile = e.dataTransfer.files[0]
  
  if (droppedFile && isValidFileType(droppedFile)) {
    handleFileUpload(droppedFile)
  }
}

export function handleFileSelect(
  e: React.ChangeEvent<HTMLInputElement>,
  documentType: string | null,
  handleFileUpload: (uploadedFile: File) => Promise<void>,
  toast: (toastProps: any) => void,
) {
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
    handleFileUpload(selectedFile)
  }
}

export function removeFile(
  previewUrl: string | null,
  setFile: (file: File | null) => void,
  setPreviewUrl: (url: string | null) => void,
  setExtractedData: (data: any) => void,
  setValidationErrors: (errors: string[]) => void,
) {
  // Only revoke object URLs on the client side
  if (typeof window !== 'undefined' && previewUrl) {
    URL.revokeObjectURL(previewUrl)
  }
  
  setFile(null)
  setPreviewUrl(null)
  setExtractedData(null)
  setValidationErrors([])
}