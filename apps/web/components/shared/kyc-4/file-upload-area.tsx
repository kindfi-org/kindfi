import { Upload } from 'lucide-react';
import { useRef } from 'react';
import type { useToast } from '~/components/base/toast';
import { cn } from '~/lib/utils';
import type { DocumentType } from '~/types';

export interface FileUploadAreaProps {
  isProcessing: boolean;
  documentType: DocumentType;
  handleFileSelect: (
    _e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
  toast: ReturnType<typeof useToast>['toast'];
  handleDrop: (
    _e: React.DragEvent<HTMLButtonElement>
  ) => void;
}

const FileUploadArea = ({
  isProcessing,
  handleDrop,
  handleFileSelect,
}: FileUploadAreaProps) => {
  const fileUploadRef = useRef<HTMLInputElement | null>(null);

  return (
    <button
      type="button"
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center w-full',
        'transition-all duration-300 ease-in-out transform',
        'hover:scale-[1.02] hover:border-black hover:bg-gray-50',
        'hover:shadow-lg cursor-pointer relative',
        { 'opacity-50 pointer-events-none': isProcessing },
      )}
      onDrop={(e) => {
        e.preventDefault();
        if (!isProcessing) handleDrop(e);
      }}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => {
        if (isProcessing || !fileUploadRef.current) return;
        fileUploadRef.current.click();
      }}
      disabled={isProcessing}
    >
      <input
        ref={fileUploadRef}
        id="file-upload"
        name="file-upload"
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileSelect}
        disabled={isProcessing}
      />
      <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
      <h3 className="text-lg font-medium">Click to upload or drag and drop</h3>
      <p className="text-sm text-gray-500">JPG or PNG images only</p>
    </button>
  );
};

export default FileUploadArea;