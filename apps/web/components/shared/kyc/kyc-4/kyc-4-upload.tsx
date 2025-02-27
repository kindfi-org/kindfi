'use client'
import {
  createFileUploadHandler,
  removeFile,
  handleContinue,
  validateDocument,
} from '@packages/lib/src/doc-utils'
import { AlertCircle } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import Tesseract from 'tesseract.js'
import { Alert, AlertDescription } from '~/components/base/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/base/card'
import { useToast } from '~/components/base/toast'
import type { DocumentType } from '~/types'
import type { ExtractedData } from '~/types'
import { DocumentPreview } from '~/components/shared/kyc-4/document-preview'
import { DocumentTypeSelector } from '~/components/shared/kyc-4/document-type-selector'
import { ExtractedInfoDisplay } from '~/components/shared/kyc-4/extracted-info-display'
import FileUploadArea from '~/components/shared/kyc-4/file-upload-area'
import { OCRProcessor } from '~/components/shared/kyc-4/ocr-processor'
import { ValidationDisplay } from '~/components/shared/kyc-4/validation-display'

// Define proper types for external libraries and functions
interface TesseractInterface {
  recognize: (file: File, options?: unknown) => Promise<unknown>
  [key: string]: unknown
}

type ValidateDocumentFunction = (
  data: ExtractedData
) => { isValid: boolean; errors: string[] }

type HandleContinueFunction = (
  extractedData: ExtractedData | null,
  documentType: DocumentType,
  onNext: ((data: { documentType: DocumentType; extractedData: ExtractedData }) => void) | undefined,
  validateDocument: ValidateDocumentFunction,
  toast: ReturnType<typeof useToast>['toast'],
  setValidationErrors: React.Dispatch<React.SetStateAction<string[]>>
) => void

// Type adapter functions
const adaptTesseract = (tesseract: typeof Tesseract): TesseractInterface => tesseract as unknown as TesseractInterface

const adaptValidateDocument = (
  validate: typeof validateDocument
): ValidateDocumentFunction => 
  (data: ExtractedData) => validate(data as unknown as Parameters<typeof validateDocument>[0])

const adaptHandleContinue = (
  continueHandler: typeof handleContinue
): HandleContinueFunction =>
  (extractedData, documentType, onNext, validateDoc, toast, setValidationErrors) => 
    continueHandler(
      extractedData as unknown as Parameters<typeof handleContinue>[0],
      documentType,
      onNext as unknown as Parameters<typeof handleContinue>[2],
      validateDoc as unknown as Parameters<typeof handleContinue>[3],
      toast,
      setValidationErrors
    )

const ProofOfAddressUpload = ({
  onBack,
  onNext,
}: {
  onBack?: () => void
  onNext?: () => void
}) => {
  // Prefix unused state with underscore
  const [_file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [documentType, setDocumentType] = useState<DocumentType>('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (previewUrl) {
      return () => URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  // Use adapter function to properly type the setter
  const setExtractedDataAdapter = (data: unknown): void => {
    setExtractedData(data as ExtractedData | null)
  }

  // Create file upload handler with proper typing
  const handleFileUploadBound = createFileUploadHandler(
    documentType,
    setFile,
    setPreviewUrl,
    setIsProcessing,
    setProgress,
    setValidationErrors,
    setExtractedDataAdapter,
    adaptTesseract(Tesseract),
    toast,
  )

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">
          Upload Proof of Address
        </CardTitle>
        <p className="text-gray-500">
          Please provide a recent document that proves your current address.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Step 4 of 4</h3>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="w-full h-2 bg-black rounded-full" />
          </div>
        </div>

        <DocumentTypeSelector
          documentType={documentType}
          setDocumentType={setDocumentType}
        />

        {!previewUrl ? (
          <FileUploadArea
            isProcessing={isProcessing}
            handleDrop={(e) => {
              e.preventDefault()
              const droppedFile = e.dataTransfer.files[0]
              if (droppedFile) {
                handleFileUploadBound(droppedFile)
              }
            }}
            handleFileSelect={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) {
                handleFileUploadBound(selectedFile)
              }
            }}
            documentType={documentType}
            setFile={setFile}
            toast={toast}
          />
        ) : (
          <DocumentPreview
            isProcessing={isProcessing}
            progress={progress}
            previewUrl={previewUrl}
            removeFile={() =>
              removeFile(
                previewUrl,
                setFile,
                setPreviewUrl,
                setExtractedDataAdapter,
                setValidationErrors,
              )
            }
            setFile={setFile}
            setPreviewUrl={setPreviewUrl}
            setExtractedData={setExtractedData}
            setValidationErrors={setValidationErrors}
          />
        )}

        <ExtractedInfoDisplay extractedData={extractedData} />

        <ValidationDisplay validationErrors={validationErrors} />

        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="mt-2">
              <p className="font-medium">Your document must:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Be dated within the last 3 months</li>
                <li>Show your full name and current address</li>
                <li>Be a clear, complete copy of the original</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
        
        <OCRProcessor
          isProcessing={isProcessing}
          onBack={onBack}
          onNext={onNext}
          extractedData={extractedData}
          documentType={documentType}
          validateDocument={adaptValidateDocument(validateDocument)}
          toast={toast}
          handleContinue={adaptHandleContinue(handleContinue)}
          setValidationErrors={setValidationErrors}
        />
      </CardContent>
    </Card>
  )
}

export default ProofOfAddressUpload