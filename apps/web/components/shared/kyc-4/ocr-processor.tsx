import { ArrowLeft, ArrowRight } from 'lucide-react'
import type React from 'react'
import { Button } from '~/components/base/button'
import type { OCRProcessorProps } from './types'

export const OCRProcessor: React.FC<OCRProcessorProps> = ({
  isProcessing,
  onBack,
  onNext,
  extractedData,
  documentType,
  validateDocument,
  toast,
  setValidationErrors,
}) => {
  const handleContinue = () => {
    if (!onNext) return;
    if (!extractedData) {
      toast({ title: 'Error', description: 'No data extracted' })
      return
    }

    const validation = validateDocument(extractedData)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      toast({
        title: 'Validation Error',
        description: 'Document validation failed',
      })
      return
    }

    onNext({ documentType, extractedData })
  }

  return (
    <div className="flex justify-end space-x-4">
      <Button variant="outline" onClick={onBack} disabled={isProcessing}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      <Button
        onClick={handleContinue}
        disabled={isProcessing || !extractedData || !documentType}
      >
        Continue <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}