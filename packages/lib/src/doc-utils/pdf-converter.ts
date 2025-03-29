import * as pdfjsLib from 'pdfjs-dist'
// Using a local worker file bundled with the application
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`


/**
 * Converts the first page of a PDF file into a PNG image.
 * @param {File} file - The PDF file to convert.
 * @returns {Promise<File>} - A promise that resolves to a PNG file.
 */
export async function convertPDFToImage(file: File) {
	// Check if the File API is supported
	if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
		throw new Error('The File APIs are not fully supported in this browser.');
	}
	const arrayBuffer = await file.arrayBuffer()
	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
	const page = await pdf.getPage(1)
	const viewport = page.getViewport({ scale: 2.0 })
	const canvas = document.createElement('canvas')
	
	// Check if canvas is supported
	if (!canvas.getContext) {
		throw new Error('Canvas is not supported in this browser.');
	}
	
	canvas.width = viewport.width
	canvas.height = viewport.height
	const context = canvas.getContext('2d')
	if (!context) throw new Error('Could not create canvas context')
	await page.render({
		canvasContext: context,
		viewport: viewport,
	}).promise
	return new Promise((resolve, reject) => {
		// Check if toBlob is supported
		if (!canvas.toBlob) {
			reject(new Error('Canvas toBlob is not supported in this browser.'));
			return;
		}
		
		canvas.toBlob((blob) => {
			if (!blob) reject(new Error('Could not convert PDF to image'))
			else resolve(new File([blob], 'converted-pdf.png', { type: 'image/png' }))
		}, 'image/png')
	})
}