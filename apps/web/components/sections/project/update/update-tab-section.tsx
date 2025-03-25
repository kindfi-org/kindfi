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

import { updateItems } from '~/lib/mock-data/project/mock-updates-tab'
import { LoadMoreButton } from './LoadMoreButton'
import { UpdateCard } from './UpdateCard'

export function UpdatesTabSection() {
	const handleLoadMore = async (): Promise<void> => {
		console.log('Load more updates...')

		await new Promise((resolve) => setTimeout(resolve, 1000))

		console.log('More updates loaded.')
	}

	return (
		<section
			className="w-full max-w-5xl mx-auto py-10 px-4"
			aria-labelledby="updates-tab-section-title"
		>
			<h1 id="updates-tab-section-title" className="sr-only">
				Updates
			</h1>
			<UpdateCard data={updateItems} updatesUrl="/updates" />
			<LoadMoreButton onLoadMore={handleLoadMore} />
		</section>
	)
}
