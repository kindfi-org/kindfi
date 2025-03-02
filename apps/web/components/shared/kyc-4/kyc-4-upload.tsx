'use client'
import {
  handleFileUpload,
  removeFile,
  isValidFileType
} from '@packages/lib/src/doc-utils/upload-handler'
import {
  validateDocument,
} from '@packages/lib/src/doc-utils/validation'
import { AlertCircle } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'

import { Alert, AlertDescription } from '~/components/base/alert'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/base/card'
import { useToast } from '~/components/base/toast'
import type {
  DocumentType,
  ExtractedData,
} from '~/components/shared/kyc-4/types'
import { DocumentPreview } from './document-preview'
import { DocumentTypeSelector } from './document-type-selector'
import { ExtractedInfoDisplay } from './extracted-info-display'
import { FileUploadArea } from './file-upload-area'
import { OCRProcessor } from './ocr-processor'
import { ValidationDisplay } from './validation-display'

const ProofOfAddressUpload = ({
  onBack,
  onNext,
}: {
  onBack?: () => void
  onNext?: () => void
}) => {
  const [file, setFile] = useState<File | null>(null)
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

  const handleFileUploadBound = useCallback(
    async (file: File): Promise<void> => {
      return handleFileUpload(
        documentType,
        setFile,
        setPreviewUrl,
        setIsProcessing,
        setProgress,
        setValidationErrors,
        setExtractedData,
        toast
      )(file)
    },
    [documentType, toast],
  )

  useEffect(() => {
    if (file) {
      handleFileUploadBound(file)
    }
  }, [file, handleFileUploadBound])

  
  const handleNextWithData = useCallback(
    (data: { documentType: DocumentType; extractedData: ExtractedData }) => {
      console.log('Processing document data:', data);
      
      if (onNext) {
        onNext();
      }
    },
    [onNext]
  );


  const handleDropWrapper = useCallback(
    (
      _e: React.DragEvent<HTMLButtonElement>,
      _documentType: DocumentType,
      _handleFileUploadBound: (_file: File) => void,
      _setFile: React.Dispatch<React.SetStateAction<File | null>>,
      _toast: ReturnType<typeof useToast>['toast']
    ): void => {
      // Extract files directly and call the handler
      const droppedFiles = _e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        const file = droppedFiles[0];
        if (isValidFileType(file)) {
          _handleFileUploadBound(file);
        }
      }
    },
    []
  );

  const handleFileSelectWrapper = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      _documentType: string,
      _handleFileUploadBound: (file: File) => void,
      _setFile: React.Dispatch<React.SetStateAction<File | null>>,
      _toast: ReturnType<typeof useToast>['toast']
    ): void => {
      if (!_documentType) {
        _toast({
          title: 'Document Type Required',
          description: 'Please select a document type before uploading.',
          // Remove the className property as it's not accepted by the toast component
        });
        e.target.value = '';
        return;
      }
      
      const selectedFile = e.target.files?.[0];
      if (selectedFile && isValidFileType(selectedFile)) {
        _handleFileUploadBound(selectedFile);
      }
    },
    []
  );

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
            handleDrop={handleDropWrapper}
            handleFileSelect={handleFileSelectWrapper}
            documentType={documentType}
            handleFileUploadBound={handleFileUploadBound}
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
                setExtractedData,
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
          onNext={handleNextWithData}
          extractedData={extractedData}
          documentType={documentType}
          validateDocument={validateDocument}
          toast={toast}
          setValidationErrors={setValidationErrors}
        />
      </CardContent>
    </Card>
  )
}

export default ProofOfAddressUpload