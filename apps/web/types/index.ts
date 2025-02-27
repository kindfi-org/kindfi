export type DocumentType = 'utility' | 'bank' | 'government' | ''

export interface ExtractedData {
  text: string;
  date: string | null;
  address?: string;
  confidence?: number;
  [key: string]: unknown;
}