/**
 * @description      : LoadMore Button
 * @author           : pheeobeayo
 * @group            : ODhack 12 contributor
 * @created          : 25/03/2025 - 10:37:17
 *
 * MODIFICATION LOG
 * - Version         : 1.0.0
 * - Date            : 25/03/2025
 * - Author          : pheobeayo
 * - Modification    : fixed the update tab section in the Project Details
 **/
'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/base/button'

interface LoadMoreButtonProps {
	onLoadMore: () => Promise<void>
}

export function LoadMoreButton({ onLoadMore }: LoadMoreButtonProps) {
	const [isLoading, setIsLoading] = useState(false)

	const handleClick = async () => {
		setIsLoading(true)
		await onLoadMore()
		setIsLoading(false)
	}

	return (
		<div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md">
			<Button
				onClick={handleClick}
				disabled={isLoading}
				variant="outline"
				className="w-full text-lg font-bold shadow-md"
			>
				{isLoading ? (
					<>
						<Loader2 className="animate-spin h-5 w-5 mr-2" /> Loading...
					</>
				) : (
					'Load more updates'
				)}
			</Button>
		</div>
	)
}
