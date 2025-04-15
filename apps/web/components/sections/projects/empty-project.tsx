import { SearchX } from 'lucide-react'
import { Button } from '~/components/base/button'

interface EmptyStateProps {
	selectedCategories: string[]
	onClearFilters: () => void
}

export function EmptyProject({
	selectedCategories,
	onClearFilters,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
			<div className="bg-gray-50 p-6 rounded-full mb-6">
				<SearchX className="h-12 w-12 text-gray-400" />
			</div>

			<h3 className="text-xl font-semibold text-gray-900 mb-2">
				No projects found
			</h3>

			<p className="text-gray-600 mb-6 max-w-md">
				{selectedCategories.length > 0 ? (
					<>
						We couldn't find any projects matching your selected{' '}
						{selectedCategories.length > 1 ? 'categories' : 'category'}.
					</>
				) : (
					<>
						There are no projects available at the moment. Please check back
						later.
					</>
				)}
			</p>

			{selectedCategories.length > 0 && (
				<div className="flex flex-col space-y-3">
					<Button onClick={onClearFilters} variant="outline">
						Clear {selectedCategories.length > 1 ? 'filters' : 'filter'}
					</Button>

					<span className="text-sm text-gray-500">
						Selected: {selectedCategories.join(', ')}
					</span>
				</div>
			)}
		</div>
	)
}
