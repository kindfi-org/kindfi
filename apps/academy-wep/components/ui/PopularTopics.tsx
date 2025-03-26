import { Button } from '@/components/ui/button'
import { useState } from 'react'

function PopularTopics() {
	const [, setSelected] = useState(0)

	const colors = [
		{ bg: 'bg-primary-200 hover:bg-primary-300 text-primary-700' },
		{ bg: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
		{ bg: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
		{ bg: 'bg-purple-100 hover:bg-purple-200 text-purple-700' },
	]

	return (
		<div className="flex flex-col w-auto gap-4">
			<p className="font-normal text-base">Popular Topics</p>
			<div className="flex flex-wrap items-start gap-4">
				{topics.map((list, i) => {
					const color = colors[i % colors.length]
					return (
						<Button
							key={list}
							onClick={() => setSelected(i)}
							className={`
                border transition-all rounded-full px-4 py-2 font-medium
                ${color.bg}

              `}
						>
							{list}
						</Button>
					)
				})}
			</div>
		</div>
	)
}

export default PopularTopics

const topics = ['Blockchain', 'Stellar', 'Wallets', 'Web3']
