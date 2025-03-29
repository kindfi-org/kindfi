import { useState } from 'react'
import { Button } from '../base/button'

interface PopularTopicsProps {
	onTopicSelect?: (topic: string, index: number) => void
}
const TOPICS = ['Blockchain', 'Stellar', 'Wallets', 'Web3']
export function PopularTopics({ onTopicSelect }: PopularTopicsProps) {
	const [selected, setSelected] = useState(0)

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
        {TOPICS.map((topic, i) => {
          const color = colors[i % colors.length];
          return (
            <Button
              key={topic}
              onClick={() => {
                setSelected(i);
                if (onTopicSelect) onTopicSelect(topic, i);
              }}
              className={`
                border transition-all rounded-full px-4 py-2 font-medium
                ${color.bg} ${selected === i ? "border-2" : ""}

              `}
            >
              {topic}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
