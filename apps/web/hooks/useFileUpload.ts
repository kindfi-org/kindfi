import { useState } from 'react'
import { uploadToBucket } from '~/lib/utils/uploadFileToBucket'

interface UploadFileOpts {
	allowedTypes: { [key: string]: string }
	maxSize?: number
}

export function useUploadFile() {
	const [error, setError] = useState<string | null>(null)
	const [fileName, setFileName] = useState<string | null>(null)
	const [uploading, setUploading] = useState(false)
	const [fileUrl, setFileUrl] = useState<string | null>(null)

	async function uploadFile(
		file: File,
		{ allowedTypes, maxSize = 5242880 }: UploadFileOpts, // default maxSize is 5MB
	) {
		setUploading(true)
		setFileUrl(null)
		setError(null)
		setFileName(file.name)

		if (file.size > maxSize) {
			setError('File size too marge. (Max: 5MB)')
			setUploading(false)
			return
		}

		if (!Object.values(allowedTypes).includes(file.type)) {
			setError(
				`Invalid file type. Allowed: ${Object.keys(allowedTypes).join(', ')}.`,
			)
			setUploading(false)
			return
		}

		const bucket = 'media-uploads'
		// Temporarily return a dummy image URL on error; remove after storage buckets are set up.
		const dummyUrl =
			'https://uyqodqrtoeezwkikqwbl.supabase.co/storage/v1/object/public/media-uploads//1740267709719-imagwe.webp'

		// // Actual functionality
		// const { error: uploadError, url } = await uploadToBucket(file, bucket)
		// if (uploadError) {
		// 	setError(uploadError)
		// } else {
		// 	setFileUrl(url || '')
		// }
		setFileUrl(dummyUrl || '')
		setUploading(false)
		return dummyUrl
		// return url
	}

	const deleteFile = async () => {
		setFileName(null)
		setFileUrl(null)
	}

	return { uploadFile, error, uploading, fileUrl, fileName, deleteFile }
}
