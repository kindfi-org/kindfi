import type React from 'react'
import type { useToast } from '~/components/base/toast'

export type DocumentType = 'utility' | 'bank' | 'government' | ''

export interface ExtractedData {
  text: string
  date: string | null
  address: string | null
}

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export type NextHandler = (_data: {
  documentType: DocumentType;
  extractedData: ExtractedData;
}) => void;

export interface OCRProcessorProps {
  isProcessing: boolean;
  onBack?: () => void;
  onNext?: NextHandler;
  extractedData: ExtractedData | null;
  documentType: DocumentType;
  validateDocument: (_data: ExtractedData) => ValidationResult;
  toast: ReturnType<typeof useToast>['toast'];
  setValidationErrors: React.Dispatch<React.SetStateAction<string[]>>;
}
