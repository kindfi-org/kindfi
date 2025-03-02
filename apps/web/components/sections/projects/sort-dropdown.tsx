import { Filter } from 'lucide-react'
import type { SortOption } from '~/hooks/use-projects-filter'

interface SortDropdownProps {
	value: SortOption
	onChange: (value: SortOption) => void
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
	return (
		<div className="flex items-center">
			<div className="relative">
				<select
					value={value}
					onChange={(e) => onChange(e.target.value as SortOption)}
					className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:border-blue-500"
				>
					<option value="popular">Popular Searches</option>
					<option value="newest">Newest</option>
					<option value="funding">Most Funded</option>
					<option value="supporters">Most Supporters</option>
				</select>
				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
					<Filter className="h-4 w-4" />
				</div>
			</div>
		</div>
	)
}
