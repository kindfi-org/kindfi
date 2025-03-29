import { useState } from 'react'
import { Button } from '../base/button'

const levels = ['All Levels', 'Beginners', 'Intermediate', 'Advanced']
export function LevelFilter() {
	const [selected, setSelected] = useState(0)
	const select = (i: number) => setSelected(i)
	return (
		<div className="flex flex-col w-auto gap-4">
			<p className="font-normal text-base">Levels</p>
			<div className="flex flex-wrap items-start gap-4">
				{levels.map((list, i) => (
					<Button
						key={list}
						onClick={() => select(i)}
						className={`
              border transition-all rounded-md hover:bg-primary-500 hover:text-white
              ${selected === i ? 'bg-primary-500 text-white' : 'bg-white text-black'}

            `}
					>
						{list}
					</Button>
				))}
			</div>
		</div>
	)
}
