'use client'
import { useCallback, useEffect, useState } from 'react'
import type { ExtractedData } from '../../components/shared/kyc/kyc-2/types'

export function useDocumentFiles() {
	const [frontFile, setFrontFile] = useState<File | null>(null)
	const [backFile, setBackFile] = useState<File | null>(null)
	const [frontPreviewUrl, setFrontPreviewUrl] = useState<string | null>(null)
	const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null)
	const [frontExtractedData, setFrontExtractedData] =
		useState<ExtractedData | null>(null)
	const [backExtractedData, setBackExtractedData] =
		useState<ExtractedData | null>(null)

	useEffect(() => {
		return () => {
			if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl)
			if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl)
		}
	}, [frontPreviewUrl, backPreviewUrl])

	const removeFile = useCallback(
		(isFront: boolean) => {
			if (isFront) {
				if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl)
				setFrontFile(null)
				setFrontPreviewUrl(null)
				setFrontExtractedData(null)
			} else {
				if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl)
				setBackFile(null)
				setBackPreviewUrl(null)
				setBackExtractedData(null)
			}
		},
		[frontPreviewUrl, backPreviewUrl],
	)

	return {
		frontFile,
		backFile,
		setFrontFile,
		setBackFile,
		frontPreviewUrl,
		backPreviewUrl,
		setFrontPreviewUrl,
		setBackPreviewUrl,
		frontExtractedData,
		backExtractedData,
		setFrontExtractedData,
		setBackExtractedData,
		removeFile,
	}
}
