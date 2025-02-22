'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/base/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/base/select";
import { Button } from "~/components/base/button";
import { Upload, AlertCircle, Loader2, X, ArrowRight, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "~/components/base/alert";
import { useToast } from "~/components/base/toast";
import Tesseract from 'tesseract.js';

interface ExtractedData {
  text: string;
  date: string | null;
  address: string | null;
}

type ToastType = {
  title: string;
  description?: string;
  duration?: number;
  className?: string;
};

type DocumentType = 'utility' | 'bank' | 'government' | '';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ProofOfAddressUpload = ({ 
  onBack, 
  onNext 
}: { 
  onBack?: () => void, 
  onNext?: (data: {
    documentType: DocumentType,
    extractedData: ExtractedData
  }) => void 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [documentType, setDocumentType] = useState<DocumentType>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (previewUrl) {
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const isValidFileType = useCallback((file: File): boolean => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    return validTypes.includes(file.type);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!documentType) {
      toast({
        title: "Document Type Required",
        description: "Please select a document type before uploading.",
        className: "bg-destructive text-destructive-foreground"
      } as ToastType);
      return;
    }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      await handleFileUpload(droppedFile);
    }
  }, [documentType, isValidFileType]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!documentType) {
      toast({
        title: "Document Type Required",
        description: "Please select a document type before uploading.",
        className: "bg-destructive text-destructive-foreground"
      } as ToastType);
      e.target.value = '';
      return;
    }
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      await handleFileUpload(selectedFile);
    }
  }, [documentType, isValidFileType]);

  const removeFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setValidationErrors([]);
  }, [previewUrl]);

  const extractDate = useCallback((text: string): string | null => {
    const formattedDatePattern = new RegExp(`(${monthNames.join('|')})\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'i');
    const formattedMatch = text.match(formattedDatePattern);

    if (formattedMatch) {
      const [_, month, day, year] = formattedMatch;
      const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());
      if (monthIndex !== -1) {
        const date = new Date(parseInt(year), monthIndex, parseInt(day));
        return date.toISOString();
      }
    }

    const datePattern = /(\d{2})[/-](\d{2})[/-](\d{4})/g;
    const matches = text.match(datePattern);
    
    if (matches) {
      const dates = matches.map(dateStr => {
        const [day, month, year] = dateStr.split(/[/-]/).map(Number);
        const date = new Date(year, month - 1, day);
        return { date, str: dateStr };
      }).filter(({ date }) => !isNaN(date.getTime()));

      if (dates.length > 0) {
        dates.sort((a, b) => a.date.getTime() - b.date.getTime());
        return dates[0].date.toISOString();
      }
    }
    
    return null;
  }, []);

  const extractAddress = useCallback((text: string): string | null => {
    const lines = text.split('\n');
    const addressLines = lines.filter((line: string) => 
      /\d+.*(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|circle|cr|way|boulevard|blvd)/i.test(line)
    );
    return addressLines.length > 0 ? addressLines.join('\n') : null;
  }, []);

  const validateDocument = useCallback((data: ExtractedData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.date) {
      errors.push("No date found in the document");
    } else {
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      
      const documentDate = new Date(data.date);
      documentDate.setHours(0, 0, 0, 0);
      
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      threeMonthsAgo.setHours(0, 0, 0, 0);

      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      };

      if (documentDate < threeMonthsAgo) {
        errors.push(`Document is too old. Must be dated after ${formatDate(threeMonthsAgo)}`);
      }

      if (documentDate > today) {
        errors.push("Document date cannot be in the future");
      }
    }

    if (!data.address) {
      errors.push("No address found in the document");
    } else {
      const addressValidationRegex = /\d+\s+[a-zA-Z0-9\s]+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd)/i;
      if (!addressValidationRegex.test(data.address)) {
        errors.push("Address appears to be invalid or incomplete");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const handleFileUpload = useCallback(async (uploadedFile: File) => {
    if (!documentType) {
      toast({
        title: "Document Type Required",
        description: "Please select a document type first.",
        className: "bg-destructive text-destructive-foreground"
      } as ToastType);
      return;
    }
    
    setFile(uploadedFile);
    const preview = URL.createObjectURL(uploadedFile);
    setPreviewUrl(preview);
    await processFile(uploadedFile);
  }, [documentType]);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setValidationErrors([]);

    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: message => {
            if (message.status === 'recognizing text') {
              setProgress(Math.round(message.progress * 100));
            }
          }
        }
      );

      const extractedText = result.data.text;

      const processedData: ExtractedData = {
        text: extractedText,
        date: extractDate(extractedText),
        address: extractAddress(extractedText),
      };

      setExtractedData(processedData);

      const { isValid, errors } = validateDocument(processedData);

      if (isValid) {
        toast({
          title: "Document processed successfully",
          description: "We've extracted the required information from your document.",
          className: "bg-green-500"
        } as ToastType);
      } else {
        setValidationErrors(errors);
        toast({
          title: "Document Validation Failed",
          description: "Please review the document requirements.",
          className: "bg-destructive text-destructive-foreground"
        } as ToastType);
      }

    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: "Error processing document",
        description: "Please ensure your document is clear and try again.",
        className: "bg-destructive text-destructive-foreground"
      } as ToastType);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [extractDate, extractAddress, validateDocument, toast]);

  const handleContinue = useCallback(() => {
    if (!extractedData || !documentType) {
      toast({
        title: "Incomplete Information",
        description: "Please upload a document and select a document type.",
        className: "bg-destructive text-destructive-foreground"
      } as ToastType);
      return;
    }

    const { isValid, errors } = validateDocument(extractedData);

    if (isValid) {
      if (onNext) {
        onNext({
          documentType,
          extractedData
        });
      }

      toast({
        title: "Validation Successful",
        description: "Your document has been validated and processed.",
        className: "bg-green-500"
      } as ToastType);
    } else {
      setValidationErrors(errors);
      toast({
        title: "Validation Failed",
        description: "Please review the document requirements.",
        className: "bg-destructive text-destructive-foreground"
      } as ToastType);
    }
  }, [extractedData, documentType, onNext, validateDocument, toast]);

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Upload Proof of Address</CardTitle>
        <p className="text-gray-500">Please provide a recent document that proves your current address.</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Step 4 of 4</h3>
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div className="w-full h-2 bg-black rounded-full"></div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-lg font-medium">Document Type</label>
          <Select 
            value={documentType}
            onValueChange={(value: DocumentType) => setDocumentType(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utility">Utility Bill</SelectItem>
              <SelectItem value="bank">Bank Statement</SelectItem>
              <SelectItem value="government">Government ID</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">Choose the type of document you'll be uploading</p>
        </div>

        {!previewUrl ? (
          <div 
            className={`
              border-2 border-dashed rounded-lg p-8 text-center 
              transition-all duration-300 ease-in-out transform 
              hover:scale-[1.02] hover:border-black hover:bg-gray-50 
              hover:shadow-lg cursor-pointer relative
              ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={(e: React.DragEvent) => e.preventDefault()}
            onClick={() => !isProcessing && document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-medium">
              Click to upload or drag and drop
            </h3>
            <p className="text-sm text-gray-500">JPG or PNG images only</p>
          </div>
        ) : (
          <div className="relative border rounded-lg overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
                <div className="w-64 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-white mt-2">Processing... {progress}%</p>
              </div>
            )}
            <button
              onClick={removeFile}
              className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewUrl}
              alt="Document preview"
              className="w-full h-auto max-h-[400px] object-contain"
            />
          </div>
        )}

        {extractedData && (
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="mt-2">
                <p className="font-medium">Extracted Information:</p>
                <div className="mt-2 text-sm space-y-1">
                  {extractedData.date && (
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(extractedData.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                  {extractedData.address && (
                    <p><strong>Address:</strong> {extractedData.address}</p>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="mt-2">
                <p className="font-medium">Validation Errors:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

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

        <div className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={onBack} 
            disabled={isProcessing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={isProcessing || !extractedData || !documentType}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProofOfAddressUpload;