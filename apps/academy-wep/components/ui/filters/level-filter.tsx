'use client'

import { cn } from '~/lib/utils'
import { Button } from '../../base/button'

interface LevelFilterProps {
	levels: string[]
	selected: number
	setSelected: (index: number) => void
}

export function LevelFilter({
	levels,
	selected,
	setSelected,
}: LevelFilterProps) {
	return (
		<div className="flex flex-col w-auto gap-4">
			<p className="font-normal text-base">Level</p>
			<div className="flex flex-wrap items-start gap-2">
				{levels.map((level, i) => (
					<Button
						key={level}
						onClick={() => setSelected(i)}
						className={cn(
							'border border-zinc-300 shadow-none transition-all rounded-md hover:bg-primary-500 hover:text-white cursor-pointer',
							selected === i
								? 'bg-primary-500 text-white'
								: 'bg-white text-black',
						)}
						aria-pressed={selected === i}
						type="button"
					>
						{level}
					</Button>
				))}
			</div>
		</div>
	)
}
