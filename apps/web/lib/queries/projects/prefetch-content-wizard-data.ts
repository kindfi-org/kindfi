type ContentWizardPrefetchOptions<TBasicInfo extends { id?: string | null }> = {
	getBasicInfo: () => Promise<TBasicInfo | null>
	cacheBasicInfo: (basicInfo: TBasicInfo | null) => void
	prefetchPitch: () => Promise<void>
	prefetchHighlights: () => Promise<void>
}

/** Load basic info once, seed its managed query entry, then prefetch the independent wizard data together. */
export async function prefetchContentWizardData<TBasicInfo extends { id?: string | null }>({
	getBasicInfo,
	cacheBasicInfo,
	prefetchPitch,
	prefetchHighlights,
}: ContentWizardPrefetchOptions<TBasicInfo>): Promise<TBasicInfo | null> {
	const basicInfo = await getBasicInfo()
	cacheBasicInfo(basicInfo)

	const prefetches = [prefetchHighlights()]
	if (basicInfo?.id) prefetches.push(prefetchPitch())

	await Promise.all(prefetches)
	return basicInfo
}
