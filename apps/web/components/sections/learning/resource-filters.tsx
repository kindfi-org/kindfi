import { LevelTabs } from './level-tabs'
import { SearchBar } from './search-bar'

interface ResourceFiltersProps {
	activeLevel: string
	onLevelChange: (level: string) => void
	onSearch: (searchTerm: string) => void
}

export function ResourceFilters({
	activeLevel,
	onLevelChange,
	onSearch,
}: ResourceFiltersProps) {
	return (
		<div className="flex flex-col md:flex-row items-center gap-6">
			<SearchBar
				placeholder="Search resources..."
				onChange={onSearch}
				className="w-[320px]"
			/>
			<LevelTabs value={activeLevel} onValueChange={onLevelChange} />
		</div>
	)
}
