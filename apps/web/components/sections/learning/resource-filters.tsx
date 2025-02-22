import { LevelTabs } from '~/components/sections/learning/level-tabs'
import { SearchBar } from '~/components/sections/learning/search-bar'

interface ResourceFiltersProps {
	activeLevel: string
	onLevelChange: (level: string) => void
	onSearch: (value: string) => void
}

export function ResourceFilters({
	activeLevel,
	onLevelChange,
	onSearch,
}: ResourceFiltersProps) {
	return (
		<div className="flex flex-col sm:flex-row items-center gap-4">
			<SearchBar placeholder="Search resources..." onChange={onSearch} />
			<LevelTabs value={activeLevel} onValueChange={onLevelChange} />
		</div>
	)
}
