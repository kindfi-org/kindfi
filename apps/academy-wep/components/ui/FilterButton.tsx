import { Filter, LayoutGrid, Menu, X } from 'lucide-react'
import { Button } from './button'

function FilterButton() {
	return (
		<div className="flex flex-row gap-4 justify-between ">
			<Button className="bg-primary-500 hover:bg-primary-600 transition-all rounded-md shadow-lg hover:shadow-xl">
				<Filter /> Filter <X />
			</Button>
			<div className="bg-white  rounded-md shadow-md flex-row flex px-4 py-2 h-10 items-center gap-3 shadow-gray-100">
				<LayoutGrid className="text-primary-600" />
				<Menu />
			</div>
		</div>
	)
}

export default FilterButton
