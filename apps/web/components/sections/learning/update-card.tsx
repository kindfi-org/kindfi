import Link from 'next/link'

interface UpdateCardProps {
	category: string
	title: string
	date: string
	href: string
	className?: string
}

export function UpdateCard({
	category,
	title,
	date,
	href,
	className = '',
}: UpdateCardProps) {
	return (
		<Link
			href={href}
			className={`block p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}
		>
			{/* Category */}
			<div className="inline-block px-3 py-1 bg-gray-100 rounded-md text-sm font-medium mb-6">
				{category}
			</div>
			{/* Title */}
			<h3 className="text-[22px] leading-tight font-semibold mb-6 line-clamp-3">
				{title}
			</h3>
			{/* Date */}
			<time className="text-base text-gray-500">{date}</time>
		</Link>
	)
}
