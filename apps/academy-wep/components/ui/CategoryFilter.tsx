import { useState } from 'react'
import { Button } from './button'

function CategoryFilter() {
	const [selected, setSelected] = useState(0)
	const [isHovered, setIsHovered] = useState(false)

	return (
		<div className="flex flex-col w-auto gap-4">
			<p className="font-normal text-base">Category</p>
			<div
				className="flex flex-wrap items-start gap-4"
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{categories.map((list, i) => (
					<Button
						key={list}
						onClick={() => setSelected(i)}
						className={`
              border transition-all rounded-md
              ${selected === i ? 'bg-primary-500 text-white' : 'bg-white text-black'}
              ${
								i === 0
									? isHovered
										? 'bg-white text-black'
										: 'bg-primary-500 text-white'
									: 'hover:bg-primary-500 hover:text-white'
							}
            `}
					>
						{list}
					</Button>
				))}
			</div>
		</div>
	)
}

export default CategoryFilter

const categories = ['All', 'Blockchain', 'Stella', 'Web3', 'KindFi']
