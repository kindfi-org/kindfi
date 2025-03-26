import { useState } from 'react'
import { Button } from './button'

function LevelFilter() {
	const [selected, setSelected] = useState(0)

	return (
		<div className="flex flex-col w-auto gap-4">
			<p className="font-normal text-base">Levels</p>
			<div className="flex flex-wrap items-start gap-4">
				{levels.map((list, i) => (
					<Button
						key={list}
						onClick={() => setSelected(i)}
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

export default LevelFilter

const levels = ['All Levels', 'Beginners', 'Intermediate', 'Advanced']
