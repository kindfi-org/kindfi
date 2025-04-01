import { Filter, LayoutGrid, Menu, X } from 'lucide-react'
import { Button } from '../base/button'

interface FilterButtonProps {
	onFilterClick: () => void
	onLayoutChange: (layout: 'grid' | 'list') => void
	currentLayout?: 'grid' | 'list'
}
export function FilterButton({
	onFilterClick,
	onLayoutChange,
	currentLayout = 'grid',
}: FilterButtonProps) {
	return (
		<div className="flex flex-row gap-4 justify-between md:w-auto w-full ">
			<Button
				onClick={onFilterClick}
				aria-label="Filter content"
				className="bg-primary-500 hover:bg-primary-600 transition-all rounded-md shadow-lg hover:shadow-xl"
			>
				<Filter /> Filter <X />
			</Button>
			<div
				className="bg-white  rounded-md shadow-md flex-row flex px-4 py-2 h-10 items-center gap-3 shadow-gray-100"
				role="radiogroup"
				aria-label="Layout selection"
			>
				<Button
					onClick={() => onLayoutChange('grid')}
					className={`focus:outline-none border-none shadow-none bg-transparent hover:bg-transparent ${currentLayout === 'grid' ? 'text-primary-600' : 'text-gray-400'}`}
					aria-label="Grid layout"
					aria-pressed={currentLayout === 'grid'}
				>
					<LayoutGrid />
				</Button>
				<Button
					onClick={() => onLayoutChange('list')}
					className={`focus:outline-none border-none shadow-none bg-transparent hover:bg-transparent ${currentLayout === 'list' ? 'text-primary-600' : 'text-gray-400'}`}
					aria-label="List layout"
					aria-pressed={currentLayout === 'list'}
				>
					<Menu />
				</Button>
			</div>
		</div>
	)
}
