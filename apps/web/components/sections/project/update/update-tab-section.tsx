/**
 * @description      : update tab section in the project details
 * @author           : pheobeayo
 * @group            : ODhack 12 contributor
 * @created          : 25/03/2025 - 10:36:35
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 25/03/2025
 * - Author          : pheobeayo
 * - Modification    : fixed the update tab section in the Project Details
 **/
'use client'

import { useState } from 'react'
import { updateItems } from '~/lib/mock-data/project/project-updates-tab.mock'
import { LoadMoreButton } from './load-more-button'
import { UpdateCard } from './update-card'

export function UpdatesTabSection() {
	const [visibleUpdates, setVisibleUpdates] = useState(updateItems.slice(0, 2))
	const [hasMore, setHasMore] = useState(true)

	const handleLoadMore = async (): Promise<void> => {
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000))
		// Get next batch of updates
		const currentLength = visibleUpdates.length
		const nextBatch = updateItems.slice(currentLength, currentLength + 2)

		if (nextBatch.length > 0) {
			setVisibleUpdates((prev) => [...prev, ...nextBatch])
		}

		// Check if we've loaded all updates
		if (currentLength + nextBatch.length >= updateItems.length) {
			setHasMore(false)
		}
		// Finished loading process
	}

	return (
		<section
			className="w-full max-w-5xl mx-auto py-10 px-4"
			aria-labelledby="updates-tab-section-title"
		>
			<h1 id="updates-tab-section-title" className="sr-only">
				Updates
			</h1>
			<UpdateCard data={visibleUpdates} updatesUrl="/updates" />
			{hasMore && <LoadMoreButton onLoadMore={handleLoadMore} />}
		</section>
	)
}
