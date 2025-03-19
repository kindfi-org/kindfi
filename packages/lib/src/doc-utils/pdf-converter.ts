// import * as pdfjsLib from 'pdfjs-dist'

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

// /**
//  * Converts the first page of a PDF file into a PNG image.
//  * @param {File} file - The PDF file to convert.
//  * @returns {Promise<File>} - A promise that resolves to a PNG file.
//  */
// export async function convertPDFToImage(file: File) {
// 	const arrayBuffer = await file.arrayBuffer()
// 	const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
// 	const page = await pdf.getPage(1)
// 	const viewport = page.getViewport({ scale: 2.0 })

// 	const canvas = document.createElement('canvas')
// 	canvas.width = viewport.width
// 	canvas.height = viewport.height
// 	const context = canvas.getContext('2d')
// 	if (!context) throw new Error('Could not create canvas context')

// 	await page.render({
// 		canvasContext: context,
// 		viewport: viewport,
// 	}).promise

// 	return new Promise((resolve, reject) => {
// 		canvas.toBlob((blob) => {
// 			if (!blob) reject(new Error('Could not convert PDF to image'))
// 			else resolve(new File([blob], 'converted-pdf.png', { type: 'image/png' }))
// 		}, 'image/png')
// 	})
// }
