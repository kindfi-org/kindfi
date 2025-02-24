import { useCallback } from 'react'
import { extractAddress, extractDate } from './extraction'
import { processFile, validateDocument } from './validation'
import type { ExtractedData } from '~/components/types'

type ToastType = {
  title: string
  description?: string
  duration?: number
  className?: string
}

// Define Tesseract interface that's compatible with processFile requirements
interface TesseractType {
  recognize: (
    file: File, 
    lang: string, 
    options: { logger: (message: unknown) => void }
  ) => Promise<{ data: { text: string } }>
}

export const useHandleFileUpload = (
  documentType: string | null,
  setFile: (file: File | null) => void,
  setPreviewUrl: (url: string | null) => void,
  setIsProcessing: (isProcessing: boolean) => void,
  setProgress: (progress: number) => void,
  setValidationErrors: (errors: string[]) => void,
  setExtractedData: (data: ExtractedData | null) => void,
  Tesseract: TesseractType,
  toast: (options: ToastType | Record<string, unknown>) => void,
) => {
  return useCallback(
    async (uploadedFile: File) => {
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
        Tesseract,
        extractDate,
        extractAddress,
        setExtractedData,
        validateDocument,
        toast,
      )
    },
    [
      documentType,
      setFile,
      setPreviewUrl,
      setIsProcessing,
      setProgress,
      setValidationErrors,
      setExtractedData,
      Tesseract,
      toast,
    ],
  )
}

export const isValidFileType = (file: File): boolean => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg']
  return validTypes.includes(file.type)
}

// Define a type for the handleFileUpload function
type HandleFileUploadFn = (
  uploadedFile: File,
  documentType: string | null,
  setFile: (file: File | null) => void,
  toast: (toastProps: ToastType | Record<string, unknown>) => void,
) => Promise<void>

export const handleDrop = async (
  e: React.DragEvent<HTMLDivElement>,
  documentType: string | null,
  handleFileUpload: HandleFileUploadFn,
  setFile: (file: File | null) => void,
  toast: (toastProps: ToastType | Record<string, unknown>) => void,
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
  handleFileUpload: HandleFileUploadFn,
  setFile: (file: File | null) => void,
  toast: (toastProps: ToastType | Record<string, unknown>) => void,
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
    await handleFileUpload(selectedFile, documentType, setFile, toast)
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