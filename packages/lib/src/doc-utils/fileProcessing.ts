import { extractAddress, extractDate } from "./extraction";
import Tesseract from "tesseract.js";
import { validateDocument } from "./validation";

interface ExtractedData {
	text: string;
	date: string | null;
	address: string | null;
}

interface ProcessFileResult {
	extractedData: ExtractedData | null;
	progress: number;
	validationErrors: string[];
	success: boolean;
	error?: string;
}

export const processFile = async (
	file: File,
	// validateDocument: (data: ExtractedData) => { isValid: boolean; errors: string[] }
): Promise<ProcessFileResult> => {
	let progress = 0;
	let extractedData: ExtractedData | null = null;
	let validationErrors: string[] = [];
	let success = false;
	let errorMessage: string | undefined;

	try {
		const result = await Tesseract.recognize(file, "eng", {
			logger: (message: any) => {
				if (message.status === "recognizing text") {
					progress = Math.round(message.progress * 100);
				}
			},
		});

		const extractedText = result.data.text;
		extractedData = {
			text: extractedText,
			date: extractDate(extractedText),
			address: extractAddress(extractedText),
		};

		const { isValid, errors } = validateDocument(extractedData);

		if (!isValid) {
			validationErrors = errors;
		} else {
			success = true;
		}
	} catch (error) {
		console.error("Error processing document:", error);
		errorMessage = "Error processing document";
	}

	return {
		extractedData,
		progress,
		validationErrors,
		success,
		error: errorMessage,
	};
};

// mport { extractAddress, extractDate } from "./extraction";
// import Tesseract from 'tesseract.js'


// interface ExtractedData {
// 	text: string
// 	date: string | null
// 	address: string | null
// }

// export const processFile = async (
//     file: File,
//     // setIsProcessing: (value: boolean) => void,
//     setProgress: (value: number) => void,
//     setValidationErrors: (errors: string[]) => void,
//     // extractDate: (text: string) => string | null,
//     // extractAddress: (text: string) => string | null,
//     setExtractedData: (data: ExtractedData) => void,
//     validateDocument: (data: ExtractedData) => { isValid: boolean; errors: string[] },
// ) => {
//     // setIsProcessing(true)
//     // setProgress(0)
//     setValidationErrors([])

//     try {
//         const result = await Tesseract.recognize(file, 'eng', {
//             logger: (message: any) => {
//                 if (message.status === 'recognizing text') {
//                     setProgress(Math.round(message.progress * 100))
//                 }
//             },
//         })

//         const extractedText = result.data.text

//         const processedData: ExtractedData = {
//             text: extractedText,
//             date: extractDate(extractedText),
//             address: extractAddress(extractedText),
//         }

//         setExtractedData(processedData)

//         const { isValid, errors } = validateDocument(processedData)

//         if (isValid) {
//             // Do something with the extracted data
//         } else {
//             setValidationErrors(errors)
//         }
//     } catch (error) {
//         console.error('Error processing document:', error)
//         // setValidationErrors(['Error processing document'])
//     } finally {
//         setIsProcessing(false)
//         setProgress(0)
//     }
// }