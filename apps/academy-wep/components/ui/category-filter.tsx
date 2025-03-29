import { useState } from 'react'
import { Button } from '../base/button'

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
	const [isHovered, setIsHovered] = useState(false)

	const getButtonClassName = (index: number) => {
		const baseClasses = 'border transition-all rounded-md'
		const isPrimary = (index === 0 && !isHovered) || selected === index
		const colorClasses = isPrimary
			? 'bg-primary-500 text-white'
			: 'bg-white text-black'
		const hoverClasses =
			index !== 0 ? 'hover:bg-primary-500 hover:text-white' : ''

		return `${baseClasses} ${colorClasses} ${hoverClasses}`
	}

	return (
    <div className="flex flex-col w-auto gap-4">
      <p className="font-normal text-base">Category</p>
      <div
        className="flex flex-wrap items-start gap-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {categories.map((category, i) => (
          <Button
            key={category}
            onClick={() => setSelected(i)}
            className={getButtonClassName(i)}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
}
