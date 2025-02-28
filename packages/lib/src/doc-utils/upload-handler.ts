import Tesseract from 'tesseract.js';
import { extractAddress, extractDate } from './extraction';
import { validateDocument } from './validation';

export type DocumentType = 'utility' | 'bank' | 'government' | '';

export interface ExtractedData {
  text: string;
  date: string | null;
  address: string | null;
}

export type ToastType = {
  title: string;
  description?: string;
  duration?: number;
  className?: string;
  variant?: string; // For shadcn/ui toast
  status?: string;  // For chakra-ui toast
};

// Accept either a function or an object with toast methods
export type ToastFunction = 
  | ((toastProps: ToastType & { [key: string]: unknown }) => void)
  | { 
      success?: (message: string, options?: Record<string, unknown>) => void;
      error?: (message: string, options?: Record<string, unknown>) => void;
      warning?: (message: string, options?: Record<string, unknown>) => void;
      info?: (message: string, options?: Record<string, unknown>) => void;
      [key: string]: any; 
    };

// Enhanced createToast that handles different toast implementations
const createToast = (toast: ToastFunction, toastOptions: ToastType) => {
  // If toast is a function (like some toast libraries)
  if (typeof toast === 'function') {
    toast({
      ...toastOptions,
      duration: toastOptions.duration ?? 3000,
    });
  }
  // If toast is an object with methods (like react-toastify, react-hot-toast, or shadcn/ui)
  else if (toast && typeof toast === 'object') {
    const message = toastOptions.description 
      ? `${toastOptions.title}: ${toastOptions.description}`
      : toastOptions.title;
    
    // Determine which method to use based on className or variant
    if (toastOptions.className?.includes('destructive') || toastOptions.variant === 'destructive') {
      if (typeof toast.error === 'function') {
        toast.error(message, { duration: toastOptions.duration ?? 3000 });
      } else if (typeof toast.toast === 'function') {
        toast.toast({
          title: toastOptions.title,
          description: toastOptions.description,
          variant: 'destructive',
          duration: toastOptions.duration ?? 3000
        });
      }
    } else if (toastOptions.className?.includes('green') || toastOptions.variant === 'success') {
      if (typeof toast.success === 'function') {
        toast.success(message, { duration: toastOptions.duration ?? 3000 });
      } else if (typeof toast.toast === 'function') {
        toast.toast({
          title: toastOptions.title,
          description: toastOptions.description,
          variant: 'success',
          duration: toastOptions.duration ?? 3000
        });
      }
    } else {
      // Default to info or the generic toast method
      if (typeof toast.info === 'function') {
        toast.info(message, { duration: toastOptions.duration ?? 3000 });
      } else if (typeof toast.toast === 'function') {
        toast.toast({
          title: toastOptions.title,
          description: toastOptions.description,
          duration: toastOptions.duration ?? 3000
        });
      }
    }
  } else {
    // If no toast implementation is available, fall back to console
    console.log(`Toast: ${toastOptions.title}${toastOptions.description ? ` - ${toastOptions.description}` : ''}`);
  }
};

export const processFile = async (
  file: File,
  setIsProcessing: (value: boolean) => void,
  setProgress: (value: number) => void,
  setValidationErrors: (errors: string[]) => void,
  setExtractedData: (data: ExtractedData) => void,
  toast: ToastFunction,
) => {
  setIsProcessing(true);
  setProgress(0);
  setValidationErrors([]);

  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (message: { status: string; progress?: number }) => {
        if (message.status === 'recognizing text' && message.progress !== undefined) {
          setProgress(Math.round(message.progress * 100));
        }
      },
    });

    const extractedText = result.data.text;

    const processedData: ExtractedData = {
      text: extractedText,
      date: extractDate(extractedText),
      address: extractAddress(extractedText),
    };

    setExtractedData(processedData);

    const { isValid, errors } = validateDocument(processedData);

    if (isValid) {
      createToast(toast, {
        title: 'Document processed successfully',
        description: "We've extracted the required information from your document.",
        className: 'bg-green-500',
        variant: 'success',
      });
    } else {
      setValidationErrors(errors);
      createToast(toast, {
        title: 'Document Validation Failed',
        description: 'Please review the document requirements.',
        className: 'bg-destructive text-destructive-foreground',
        variant: 'destructive',
      });
    }
  } catch (error) {
    console.error('Error processing document:', error);
    createToast(toast, {
      title: 'Error processing document',
      description: 'Please ensure your document is clear and try again.',
      className: 'bg-destructive text-destructive-foreground',
      variant: 'destructive',
    });
  } finally {
    setIsProcessing(false);
    setProgress(0);
  }
};

export function createFileUploadHandler(
  documentType: DocumentType | null,
  setFile: (file: File | null) => void,
  setPreviewUrl: (url: string | null) => void,
  setIsProcessing: (isProcessing: boolean) => void,
  setProgress: (progress: number) => void,
  setValidationErrors: (errors: string[]) => void,
  setExtractedData: (data: ExtractedData | null) => void,
  toast: ToastFunction,
) {
  return async function handleFileUpload(uploadedFile: File) {
    if (!documentType) {
      createToast(toast, {
        title: 'Document Type Required',
        description: 'Please select a document type first.',
        className: 'bg-destructive text-destructive-foreground',
        variant: 'destructive',
      });
      return;
    }
    
    setFile(uploadedFile);
    
    // Only create object URLs on the client side
    if (typeof window !== 'undefined') {
      const preview = URL.createObjectURL(uploadedFile);
      setPreviewUrl(preview);
    }
    
    await processFile(
      uploadedFile,
      setIsProcessing,
      setProgress,
      setValidationErrors,
      setExtractedData as (data: ExtractedData) => void,
      toast,
    );
  };
}

export const isValidFileType = (file: File): boolean => {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  return validTypes.includes(file.type);
};

export function handleDrop(
  e: React.DragEvent<HTMLDivElement>,
  documentType: DocumentType | null,
  handleFileUpload: (uploadedFile: File) => Promise<void>,
  toast: ToastFunction,
) {
  e.preventDefault();
  const droppedFile = e.dataTransfer.files[0];
  
  if (!documentType) {
    createToast(toast, {
      title: 'Document Type Required',
      description: 'Please select a document type before uploading.',
      className: 'bg-destructive text-destructive-foreground',
      variant: 'destructive',
    });
    return;
  }
  
  if (droppedFile && isValidFileType(droppedFile)) {
    handleFileUpload(droppedFile);
  }
}

export function handleFileSelect(
  e: React.ChangeEvent<HTMLInputElement>,
  documentType: DocumentType | null,
  handleFileUpload: (uploadedFile: File) => Promise<void>,
  toast: ToastFunction,
) {
  if (!documentType) {
    createToast(toast, {
      title: 'Document Type Required',
      description: 'Please select a document type before uploading.',
      className: 'bg-destructive text-destructive-foreground',
      variant: 'destructive',
    });
    e.target.value = '';
    return;
  }
  
  const selectedFile = e.target.files?.[0];
  if (selectedFile && isValidFileType(selectedFile)) {
    handleFileUpload(selectedFile);
  }
}

export function removeFile(
  previewUrl: string | null,
  setFile: (file: File | null) => void,
  setPreviewUrl: (url: string | null) => void,
  setExtractedData: (data: ExtractedData | null) => void,
  setValidationErrors: (errors: string[]) => void,
) {
  if (typeof window !== 'undefined' && previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  
  setFile(null);
  setPreviewUrl(null);
  setExtractedData(null);
  setValidationErrors([]);
}

export const handleContinue = (
  extractedData: ExtractedData | null,
  documentType: DocumentType,
  onNext: ((data: {
    documentType: DocumentType;
    extractedData: ExtractedData;
  }) => void) | undefined,
  toast: ToastFunction,
  setValidationErrors: (errors: string[]) => void,
) => {
  if (!extractedData || !documentType) {
    createToast(toast, {
      title: 'Incomplete Information',
      description: 'Please upload a document and select a document type.',
      className: 'bg-destructive text-destructive-foreground',
      variant: 'destructive',
    });
    return;
  }

  const { isValid, errors } = validateDocument(extractedData);

  if (isValid) {
    if (onNext) {
      onNext({
        documentType,
        extractedData,
      });
    }

    createToast(toast, {
      title: 'Validation Successful',
      description: 'Your document has been validated and processed.',
      className: 'bg-green-500',
      variant: 'success',
    });
  } else {
    setValidationErrors(errors);
    createToast(toast, {
      title: 'Validation Failed',
      description: 'Please review the document requirements.',
      className: 'bg-destructive text-destructive-foreground',
      variant: 'destructive',
    });
  }
};