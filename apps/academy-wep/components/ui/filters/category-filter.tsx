'use client'
import { cn } from '~/lib/utils'
import { Button } from '../../base/button'

interface CategoryFilterProps {
	categories: string[]
	selected: number
	setSelected: (index: number) => void
}

export function CategoryFilter({
	categories,
	selected,
	setSelected,
}: CategoryFilterProps) {
	const getButtonClassName = (index: number) => {
		const isPrimary = selected === index

		return cn(
			'border border-zinc-300 shadow-none transition-all rounded-md hover:bg-zinc-700 hover:text-white cursor-pointer',
			isPrimary ? 'bg-zinc-700 text-white' : 'bg-white text-black',
		)
	}

	return (
		<div className="flex flex-col w-auto gap-4">
			<p className="font-normal text-base">Category</p>
			<div className="flex flex-wrap items-start gap-2">
				{categories.map((category, i) => (
					<Button
						key={category}
						onClick={() => setSelected(i)}
						className={getButtonClassName(i)}
						type="button"
					>
						{category}
					</Button>
				))}
			</div>
		</div>
	)
}
